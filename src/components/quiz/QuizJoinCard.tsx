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
        <CardHeader className="text-center">
          <CardTitle>Join Quiz</CardTitle>
          <CardDescription>Enter your name to participate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              disabled={isJoined || isJoining}
              maxLength={30}
            />
          </div>
          <Button
            onClick={handleJoin}
            disabled={!name.trim() || isJoined || isJoining}
            className="w-full"
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
      <CardHeader className="text-center">
        <CardTitle>Join the Quiz!</CardTitle>
        <CardDescription>Scan the QR code or enter the code below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG value={quizUrl} size={200} level="M" />
          </div>
        </div>

        {/* Quiz Code */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Or enter code:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-mono font-bold tracking-widest text-primary">
              {quizCode}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* URL */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground break-all">{quizUrl}</p>
        </div>
      </CardContent>
    </Card>
  );
}
