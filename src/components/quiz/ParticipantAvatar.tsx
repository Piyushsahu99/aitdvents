import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AVATARS = [
  { id: "🦊", label: "Fox", bg: "bg-orange-500" },
  { id: "🐼", label: "Panda", bg: "bg-slate-800" },
  { id: "🦁", label: "Lion", bg: "bg-amber-500" },
  { id: "🐨", label: "Koala", bg: "bg-gray-500" },
  { id: "🦄", label: "Unicorn", bg: "bg-pink-500" },
  { id: "🐸", label: "Frog", bg: "bg-green-500" },
  { id: "🦉", label: "Owl", bg: "bg-amber-700" },
  { id: "🐙", label: "Octopus", bg: "bg-purple-500" },
  { id: "🦋", label: "Butterfly", bg: "bg-blue-500" },
  { id: "🐝", label: "Bee", bg: "bg-yellow-500" },
  { id: "🦈", label: "Shark", bg: "bg-slate-600" },
  { id: "🐢", label: "Turtle", bg: "bg-teal-500" },
];

interface ParticipantAvatarProps {
  value: string | null;
  onChange: (avatar: string) => void;
  size?: "sm" | "md" | "lg";
  showPicker?: boolean;
}

export function ParticipantAvatar({
  value,
  onChange,
  size = "md",
  showPicker = true,
}: ParticipantAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  const selectedAvatar = AVATARS.find((a) => a.id === value) || AVATARS[0];

  if (!showPicker) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
          selectedAvatar.bg
        )}
      >
        {selectedAvatar.id}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected Avatar Display */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "rounded-full flex items-center justify-center cursor-pointer ring-4 ring-primary/30 hover:ring-primary/50 transition-all",
            sizeClasses.lg,
            selectedAvatar.bg
          )}
        >
          {selectedAvatar.id}
        </motion.div>
        <div>
          <p className="font-medium">Your Avatar</p>
          <p className="text-sm text-muted-foreground">Tap to change</p>
        </div>
      </div>

      {/* Avatar Picker */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border bg-card"
        >
          <p className="text-sm font-medium mb-3">Choose your avatar</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((avatar) => (
              <motion.button
                key={avatar.id}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onChange(avatar.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all",
                  avatar.bg,
                  value === avatar.id && "ring-4 ring-primary ring-offset-2"
                )}
              >
                {avatar.id}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Display component for showing avatar inline
export function AvatarDisplay({ avatar, size = "sm" }: { avatar: string | null; size?: "sm" | "md" | "lg" }) {
  const selectedAvatar = AVATARS.find((a) => a.id === avatar) || AVATARS[0];
  
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0",
        sizeClasses[size],
        selectedAvatar.bg
      )}
    >
      {selectedAvatar.id}
    </div>
  );
}
