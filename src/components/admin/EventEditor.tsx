import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ImageUploader } from "./ImageUploader";
import { Edit, Loader2, Image as ImageIcon } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  poster_url: string | null;
  external_link: string | null;
  participants: number;
}

interface EventEditorProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function EventEditor({ event, open, onOpenChange, onSave }: EventEditorProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload({ bucket: 'event-posters' });

  // Sync local state when event prop changes
  useState(() => {
    if (event) {
      setEditingEvent(event);
    }
  });

  const handleSave = async () => {
    if (!editingEvent) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          date: editingEvent.date,
          location: editingEvent.location,
          poster_url: editingEvent.poster_url,
          external_link: editingEvent.external_link,
          participants: editingEvent.participants,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;
      toast({ title: "Success", description: "Event updated" });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url && editingEvent) {
      setEditingEvent({ ...editingEvent, poster_url: url });
    }
    return url;
  };

  // Update local state when prop changes
  if (event && (!editingEvent || editingEvent.id !== event.id)) {
    setEditingEvent(event);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Event
          </DialogTitle>
          <DialogDescription>
            Update event details and poster image
          </DialogDescription>
        </DialogHeader>
        
        {editingEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editingEvent.category}
                  onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Link</Label>
                <Input
                  value={editingEvent.external_link || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, external_link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Participants</Label>
                <Input
                  type="number"
                  value={editingEvent.participants}
                  onChange={(e) => setEditingEvent({ ...editingEvent, participants: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <ImageUploader
                value={editingEvent.poster_url || ""}
                onChange={(url) => setEditingEvent({ ...editingEvent, poster_url: url })}
                onUpload={handleImageUpload}
                uploading={uploading}
                label="Event Poster"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={processing}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
