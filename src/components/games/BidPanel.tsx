import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPrice } from "@/data/iplPlayers";
import { 
  Gavel, 
  ArrowUp, 
  Hand, 
  Timer, 
  TrendingUp,
  Coins,
  AlertTriangle
} from "lucide-react";

interface BidPanelProps {
  currentBid: number;
  minBidIncrement: number;
  timeRemaining: number;
  maxTime: number;
  remainingBudget: number;
  isMyTurn: boolean;
  currentBidder: string | null;
  onBid: (amount: number) => void;
  onPass: () => void;
  isProcessing: boolean;
}

export function BidPanel({
  currentBid,
  minBidIncrement,
  timeRemaining,
  maxTime,
  remainingBudget,
  isMyTurn,
  currentBidder,
  onBid,
  onPass,
  isProcessing,
}: BidPanelProps) {
  const [selectedIncrement, setSelectedIncrement] = useState(1);

  // Calculate bid amounts
  const bidIncrements = [
    { label: "+1x", multiplier: 1 },
    { label: "+2x", multiplier: 2 },
    { label: "+5x", multiplier: 5 },
    { label: "+10x", multiplier: 10 },
  ];

  const nextBid = currentBid + minBidIncrement * selectedIncrement;
  const canAfford = remainingBudget >= nextBid;
  const timeProgress = (timeRemaining / maxTime) * 100;
  const isLowTime = timeRemaining <= 5;

  // Reset increment when bid changes
  useEffect(() => {
    setSelectedIncrement(1);
  }, [currentBid]);

  return (
    <Card className={`transition-all ${isMyTurn ? "border-2 border-primary shadow-lg shadow-primary/20" : ""}`}>
      <CardContent className="p-4 space-y-4">
        {/* Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-4 w-4" />
              Time Remaining
            </span>
            <motion.span
              className={`font-mono font-bold text-lg ${
                isLowTime ? "text-destructive" : ""
              }`}
              animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
            >
              {timeRemaining}s
            </motion.span>
          </div>
          <Progress
            value={timeProgress}
            className={`h-2 ${isLowTime ? "[&>div]:bg-destructive" : ""}`}
          />
        </div>

        {/* Current bid display */}
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border">
          <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
          <motion.p
            key={currentBid}
            initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            className="text-3xl font-bold"
          >
            {formatPrice(currentBid)}
          </motion.p>
          {currentBidder && (
            <p className="text-sm text-muted-foreground mt-1">
              by {currentBidder}
            </p>
          )}
        </div>

        {/* Increment selector */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Bid Increment</p>
          <div className="grid grid-cols-4 gap-2">
            {bidIncrements.map((inc) => (
              <Button
                key={inc.multiplier}
                variant={selectedIncrement === inc.multiplier ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedIncrement(inc.multiplier)}
                disabled={!isMyTurn || isProcessing}
              >
                {inc.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Next bid preview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm">Your Bid:</span>
          </div>
          <span className="font-bold text-lg text-primary">
            {formatPrice(nextBid)}
          </span>
        </div>

        {/* Budget warning */}
        {!canAfford && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Insufficient budget!</span>
          </div>
        )}

        {/* Remaining budget */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Coins className="h-4 w-4" />
            Your Budget
          </span>
          <span className={`font-semibold ${canAfford ? "" : "text-destructive"}`}>
            {formatPrice(remainingBudget)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onPass}
            disabled={!isMyTurn || isProcessing}
            className="h-12"
          >
            <Hand className="h-4 w-4 mr-2" />
            Pass
          </Button>
          <motion.div whileHover={isMyTurn && canAfford ? { scale: 1.02 } : {}}>
            <Button
              onClick={() => onBid(nextBid)}
              disabled={!isMyTurn || !canAfford || isProcessing}
              className="w-full h-12 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              <Gavel className="h-4 w-4 mr-2" />
              {isProcessing ? "Bidding..." : `Bid ${formatPrice(nextBid)}`}
            </Button>
          </motion.div>
        </div>

        {/* Status indicator */}
        {isMyTurn ? (
          <Badge className="w-full justify-center py-1.5 bg-green-500/20 text-green-600 border-green-500/30">
            It's your turn to bid!
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full justify-center py-1.5">
            Waiting for other bidders...
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
