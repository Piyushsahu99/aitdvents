import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Hash, 
  Plus, 
  Users, 
  Globe, 
  Lock, 
  MessageSquarePlus,
  Loader2,
  Sparkles 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

interface GroupChatSelectorProps {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onRoomCreated?: () => void;
}

export function GroupChatSelector({ 
  rooms, 
  currentRoom, 
  onRoomSelect,
  onRoomCreated 
}: GroupChatSelectorProps) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to create a group chat",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          is_public: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Group created! 🎉",
        description: `"${newRoomName}" is now live`,
      });

      setNewRoomName("");
      setNewRoomDescription("");
      setCreateOpen(false);
      onRoomCreated?.();
      
      if (data) {
        onRoomSelect(data);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Failed to create group",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-xs h-7 hover:bg-muted"
        >
          <Hash className="h-3.5 w-3.5" />
          <span className="max-w-24 truncate">{currentRoom?.name || "Select Group"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Group Chats
          </DialogTitle>
          <DialogDescription>
            Join an existing group or create your own
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-64 pr-2">
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  onRoomSelect(room);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted ${
                  currentRoom?.id === room.id 
                    ? "bg-primary/10 border border-primary/30" 
                    : "border border-transparent"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  currentRoom?.id === room.id 
                    ? "bg-primary/20" 
                    : "bg-muted"
                }`}>
                  <Hash className={`h-4 w-4 ${
                    currentRoom?.id === room.id 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{room.name}</span>
                    {room.is_public ? (
                      <Globe className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  {room.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {room.description}
                    </p>
                  )}
                </div>
                {currentRoom?.id === room.id && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    Active
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Create New Group */}
        <div className="pt-4 border-t border-border/50">
          {!createOpen ? (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create New Group
            </Button>
          ) : (
            <div className="space-y-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
                New Group Chat
              </div>
              <Input
                placeholder="Group name (e.g., Web Dev Study)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Description (optional)"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => {
                    setCreateOpen(false);
                    setNewRoomName("");
                    setNewRoomDescription("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  onClick={handleCreateRoom}
                  disabled={!newRoomName.trim() || isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
