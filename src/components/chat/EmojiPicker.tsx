import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

// Common emoji categories for quick access
const EMOJI_CATEGORIES = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥"],
  gestures: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "💪", "🦾"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💌"],
  objects: ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⚡", "🔥", "✨", "💫", "🌟", "⭐", "🌈", "☀️", "🌙", "💡", "📱", "💻", "📚", "📝", "✅", "❌", "⚠️", "❓", "❗", "💯", "🆕", "🆒"],
  food: ["🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🍗", "🥤", "☕", "🍩", "🍪", "🎂", "🍰", "🍫", "🍬", "🍭"],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onEmojiSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>("smileys");

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  const categoryLabels: Record<keyof typeof EMOJI_CATEGORIES, string> = {
    smileys: "😀",
    gestures: "👋",
    hearts: "❤️",
    objects: "🎉",
    food: "🍕",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          className="h-9 w-9 rounded-xl hover:bg-muted"
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-2" 
        side="top" 
        align="start"
        sideOffset={8}
      >
        {/* Category Tabs */}
        <div className="flex gap-1 mb-2 pb-2 border-b border-border/50">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <Button
              key={category}
              size="sm"
              variant={activeCategory === category ? "secondary" : "ghost"}
              className="h-8 w-8 p-0"
              onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
            >
              {categoryLabels[category as keyof typeof EMOJI_CATEGORIES]}
            </Button>
          ))}
        </div>
        
        {/* Emoji Grid */}
        <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <Button
              key={`${emoji}-${index}`}
              variant="ghost"
              className="h-8 w-8 p-0 text-lg hover:bg-muted rounded-lg"
              onClick={() => handleSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
