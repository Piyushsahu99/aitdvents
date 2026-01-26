import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface QuizJoinCardProps {
  quizCode: string;
  quizUrl: string;
  onJoin?: (name: string) => Promise<boolean>;
  isJoining?: boolean;
  isJoined?: boolean;
  mode?: "display" | "join";
}

export function QuizJoinCard({
  quizCode,
  quizUrl,
  onJoin,
  isJoining = false,
  isJoined = false,
  mode = "display",
}: QuizJoinCardProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quizCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Quiz code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  const handleJoin = async () => {
    if (!onJoin || !name.trim()) return;
    await onJoin(name.trim());
  };

  if (mode === "join") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Join Quiz</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Enter your name to participate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              disabled={isJoined || isJoining}
              maxLength={30}
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>
          <Button
            onClick={handleJoin}
            disabled={!name.trim() || isJoined || isJoining}
            className="w-full h-10 sm:h-12 text-sm sm:text-base"
            size="lg"
          >
            {isJoining ? "Joining..." : isJoined ? "Joined! ✓" : "Join Quiz"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Join the Quiz!</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Scan the QR code or enter the code below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-3 sm:p-4 bg-white rounded-xl shadow-lg">
            <QRCodeSVG value={quizUrl} size={160} level="M" className="sm:w-[200px] sm:h-[200px]" />
          </div>
        </div>

        {/* Quiz Code */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">Or enter code:</p>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-widest text-primary">
              {quizCode}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 sm:h-10 sm:w-10">
              {copied ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* URL */}
        <div className="text-center px-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground break-all">{quizUrl}</p>
        </div>
      </CardContent>
    </Card>
  );
}
