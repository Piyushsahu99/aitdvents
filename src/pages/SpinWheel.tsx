import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpinWheelCanvas } from "@/components/games/SpinWheelCanvas";
import { SpinWheelResult } from "@/components/games/SpinWheelResult";
import { useSpinWheel } from "@/hooks/useSpinWheel";
import { fireConfetti } from "@/components/quiz/ConfettiEffect";
import { 
  ArrowLeft, 
  Coins, 
  Gift, 
  Loader2, 
  RotateCw, 
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";

export default function SpinWheel() {
  const {
    wheel,
    isLoading,
    isSpinning,
    todaySpins,
    selectedSegmentIndex,
    result,
    fetchActiveWheel,
    spin,
    onSpinComplete,
    closeResult,
  } = useSpinWheel();

  useEffect(() => {
    fetchActiveWheel();
  }, [fetchActiveWheel]);

  // Trigger confetti on win
  useEffect(() => {
    if (result) {
      if (result.is_jackpot) {
        fireConfetti("fireworks");
      } else if (result.prize_type === "coins" && result.prize_value > 0) {
        fireConfetti("celebration");
      }
    }
  }, [result]);

  const remainingSpins = wheel ? wheel.daily_spin_limit - todaySpins : 0;
  const canSpin = remainingSpins > 0 && !isSpinning;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-orange-500/10 via-background to-yellow-500/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-500/10 via-background to-yellow-500/10 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/quiz">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Gift className="h-6 w-6 text-orange-500" />
              Spin & Win
            </h1>
            <p className="text-sm text-muted-foreground">
              {wheel?.description || "Spin to win amazing prizes!"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Wheel */}
          <Card className="overflow-hidden border-2 border-orange-500/20">
            <CardContent className="p-6 sm:p-8 flex flex-col items-center">
              {/* Spins remaining */}
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline" className="text-base px-4 py-1.5 border-orange-500/50">
                  <Zap className="h-4 w-4 mr-1 text-orange-500" />
                  {remainingSpins} spins left today
                </Badge>
              </div>

              {/* Wheel */}
              <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] mb-8">
                {wheel && (
                  <SpinWheelCanvas
                    segments={wheel.segments}
                    isSpinning={isSpinning}
                    targetSegmentIndex={selectedSegmentIndex}
                    onSpinComplete={onSpinComplete}
                  />
                )}
              </div>

              {/* Spin Button */}
              <motion.div
                whileHover={canSpin ? { scale: 1.05 } : {}}
                whileTap={canSpin ? { scale: 0.95 } : {}}
              >
                <Button
                  onClick={spin}
                  disabled={!canSpin}
                  size="lg"
                  className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg shadow-orange-500/30"
                >
                  {isSpinning ? (
                    <>
                      <RotateCw className="h-5 w-5 mr-2 animate-spin" />
                      Spinning...
                    </>
                  ) : remainingSpins > 0 ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      SPIN NOW!
                    </>
                  ) : (
                    "No Spins Left"
                  )}
                </Button>
              </motion.div>

              {/* Cost indicator */}
              {wheel && wheel.cost_per_spin > 0 && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  {wheel.cost_per_spin} coins per spin
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sidebar - Prizes */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {wheel?.segments
                  .filter((s) => s.prize_type === "coins" && s.prize_value > 0)
                  .sort((a, b) => b.prize_value - a.prize_value)
                  .map((segment) => (
                    <div
                      key={segment.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        segment.is_jackpot
                          ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className={segment.is_jackpot ? "font-bold" : ""}>
                          {segment.label}
                        </span>
                      </div>
                      {segment.is_jackpot && (
                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                          JACKPOT
                        </Badge>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* How to Play */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Get 3 free spins every day</p>
                <p>• Spin the wheel to win coins</p>
                <p>• Land on the jackpot for 500 coins!</p>
                <p>• Coins are credited instantly</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <SpinWheelResult
        isOpen={!!result}
        onClose={closeResult}
        result={result}
      />
    </div>
  );
}
