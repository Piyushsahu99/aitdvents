import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Trash2, Loader2, User } from "lucide-react";

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  userName: string;
  userId: string;
  onAvatarChange: (url: string | null) => void;
}

const AvatarUploader = ({ currentAvatarUrl, userName, userId, onAvatarChange }: AvatarUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("student_profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
      toast({ title: "Profile photo updated!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      const { error } = await supabase
        .from("student_profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (error) throw error;

      onAvatarChange(null);
      toast({ title: "Profile photo removed" });
    } catch {
      toast({ title: "Failed to remove photo", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with overlay */}
      <div
        className={`relative group cursor-pointer transition-all ${dragOver ? "scale-105" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={`w-28 h-28 border-4 transition-all ${
          dragOver 
            ? "border-primary border-dashed" 
            : "border-primary/20 group-hover:border-primary/50"
        }`}>
          <AvatarImage src={currentAvatarUrl || undefined} alt={userName} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
            {userName ? getInitials(userName) : <User className="w-10 h-10" />}
          </AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${
          uploading || dragOver 
            ? "opacity-100 bg-black/60" 
            : "opacity-0 group-hover:opacity-100 bg-black/40"
        }`}>
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Upload indicator ring */}
        {dragOver && (
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse" />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {currentAvatarUrl ? "Change" : "Upload"}
        </Button>
        
        {currentAvatarUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        Drag & drop or click to upload<br />
        Max 5MB • JPG, PNG, GIF
      </p>
    </div>
  );
};

export default AvatarUploader;