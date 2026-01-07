import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
  avatar_url?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export function useLiveChat(roomId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch available chat rooms
  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
      
      // Set default room if not specified
      if (!roomId && data && data.length > 0) {
        setCurrentRoom(data[0]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }, [roomId]);

  // Fetch messages for current room
  const fetchMessages = useCallback(async () => {
    if (!currentRoom?.id) return;

    try {
      setIsLoading(true);
      const { data: messagesData, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", currentRoom.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles for messages
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from("student_profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const enrichedMessages = messagesData?.map(msg => ({
        ...msg,
        user_name: profileMap.get(msg.user_id)?.full_name || "Anonymous",
        avatar_url: profileMap.get(msg.user_id)?.avatar_url || null,
      })) || [];

      setMessages(enrichedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom?.id]);

  // Send a message
  const sendMessage = useCallback(async (message: string) => {
    if (!currentRoom?.id || !message.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          message: message.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentRoom?.id, toast]);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentRoom?.id) return;

    const channel = supabase
      .channel(`room-${currentRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${currentRoom.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Fetch user profile for new message
          const { data: profile } = await supabase
            .from("student_profiles")
            .select("full_name, avatar_url")
            .eq("user_id", newMessage.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...newMessage,
              user_name: profile?.full_name || "Anonymous",
              avatar_url: profile?.avatar_url || null,
            },
          ]);
        }
      )
      .subscribe();

    // Presence tracking
    const presenceChannel = supabase.channel(`presence-${currentRoom.id}`);
    
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat().map((p: any) => p.user_id);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await presenceChannel.track({ user_id: user.id });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [currentRoom?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) setCurrentRoom(room);
    }
  }, [roomId, rooms]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    rooms,
    currentRoom,
    setCurrentRoom,
    sendMessage,
    isLoading,
    onlineUsers,
  };
}
