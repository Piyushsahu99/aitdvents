import { useState, useRef, useEffect } from "react";
import { useLiveChat } from "@/hooks/useLiveChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Users, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface LiveChatProps {
  roomId?: string;
  compact?: boolean;
}

export function LiveChat({ roomId, compact = false }: LiveChatProps) {
  const { messages, currentRoom, sendMessage, isLoading, onlineUsers } = useLiveChat(roomId);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    await sendMessage(newMessage);
    setNewMessage("");
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentRoom) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No chat room available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${compact ? "h-[400px]" : "h-[600px]"} border-border/50`}>
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <CardTitle className="text-base font-semibold">{currentRoom.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {onlineUsers.length} online
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isOwn = msg.user_id === currentUserId;
                const showAvatar = index === 0 || messages[index - 1]?.user_id !== msg.user_id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={msg.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                          {msg.user_name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}
                    
                    <div className={`max-w-[75%] ${isOwn ? "text-right" : "text-left"}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                          <span className="text-xs font-medium text-foreground">
                            {isOwn ? "You" : msg.user_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      )}
                      <div
                        className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <div className="p-3 border-t border-border/50 bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder={currentUserId ? "Type a message..." : "Login to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!currentUserId || isSending}
            className="flex-1 rounded-xl border-border/50"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || !currentUserId || isSending}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
