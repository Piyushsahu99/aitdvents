import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Target, Trophy, Timer, Zap, Award, Coins, Flame, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface TargetType {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

type Difficulty = "easy" | "medium" | "hard" | "expert";

const DIFFICULTY_SETTINGS = {
  easy: { duration: 45, spawnInterval: 1500, targetLifetime: 3000, multiplier: 1 },
  medium: { duration: 30, spawnInterval: 1000, targetLifetime: 2000, multiplier: 1.5 },
  hard: { duration: 20, spawnInterval: 700, targetLifetime: 1500, multiplier: 2 },
  expert: { duration: 15, spawnInterval: 500, targetLifetime: 1000, multiplier: 3 },
};

export default function TargetMaster() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const settings = DIFFICULTY_SETTINGS[difficulty];

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn targets
    const spawnInterval = setInterval(() => {
      spawnTarget();
    }, settings.spawnInterval);

    return () => {
      clearInterval(timerInterval);
      clearInterval(spawnInterval);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    };
  }, [gameStarted, gameOver, difficulty]);

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;

    const settings = DIFFICULTY_SETTINGS[difficulty];
    const area = gameAreaRef.current.getBoundingClientRect();
    const targetTypes = [
      { size: 60, points: 10, color: "bg-red-500" },
      { size: 40, points: 25, color: "bg-orange-500" },
      { size: 30, points: 50, color: "bg-yellow-500" },
      { size: 20, points: 100, color: "bg-green-500" },
    ];

    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const maxX = area.width - type.size;
    const maxY = area.height - type.size;

    const newTarget: TargetType = {
      id: targetIdRef.current++,
      x: Math.max(20, Math.random() * maxX),
      y: Math.max(20, Math.random() * maxY),
      size: type.size,
      points: type.points,
      color: type.color,
    };

    setTargets((prev) => [...prev, newTarget]);

    // Auto-remove based on difficulty
    setTimeout(() => {
      setTargets((prev) => {
        const stillExists = prev.find((t) => t.id === newTarget.id);
        if (stillExists) {
          setMisses((m) => m + 1);
          setCombo(0);
          if (comboTimerRef.current) {
            clearTimeout(comboTimerRef.current);
            comboTimerRef.current = null;
          }
        }
        return prev.filter((t) => t.id !== newTarget.id);
      });
    }, settings.targetLifetime);
  };

  const createParticles = (x: number, y: number, color: string) => {
    const particleCount = 8;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        color,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  };

  const handleTargetClick = (target: TargetType, event: React.MouseEvent) => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const newCombo = combo + 1;
    setCombo(newCombo);
    setBestCombo((prev) => Math.max(prev, newCombo));

    // Combo multiplier: +10% per hit, max 3x
    const comboMultiplier = Math.min(1 + newCombo * 0.1, 3);
    const finalPoints = Math.round(
      target.points * settings.multiplier * comboMultiplier
    );

    setScore((prev) => prev + finalPoints);
    setHits((prev) => prev + 1);
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    // Create particle effect
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      createParticles(x, y, target.color.replace('bg-', ''));
    }

    // Reset combo timer
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
      comboTimerRef.current = null;
    }, 1500);

    // Show combo feedback
    if (newCombo >= 5 && newCombo % 5 === 0) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
      });

      toast({
        title: `🔥 ${newCombo}x COMBO!`,
        description: `+${finalPoints} points! Combo multiplier: ${comboMultiplier.toFixed(1)}x`,
        duration: 1500,
      });
    } else {
      toast({
        title: `+${finalPoints} points! 🎯`,
        description: newCombo > 1 ? `${newCombo}x Combo! ${comboMultiplier.toFixed(1)}x` : "Great shot!",
        duration: 800,
      });
    }
  };

  const handleAreaClick = () => {
    setMisses((prev) => prev + 1);
    setCombo(0);
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = null;
    }
  };

  const startGame = (selectedDifficulty?: Difficulty) => {
    if (selectedDifficulty) setDifficulty(selectedDifficulty);
    const diff = selectedDifficulty || difficulty;
    const settings = DIFFICULTY_SETTINGS[diff];

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setCombo(0);
    setBestCombo(0);
    setTargets([]);
    setParticles([]);
    setTimeLeft(settings.duration);
    targetIdRef.current = 0;
    particleIdRef.current = 0;
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);

    toast({
      title: "Game Started! 🎯",
      description: `${diff.toUpperCase()} Mode - ${settings.multiplier}x points!`,
    });
  };

  const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : "0";
  const coinsEarned = Math.floor(score / 10);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 py-4 sm:py-8 px-2 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20">
              <div className="bg-gradient-to-r from-red-500 to-rose-400 p-6 sm:p-8 text-white text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Target className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Target Master</h1>
                <p className="text-sm sm:text-base md:text-lg opacity-90">Test Your Reaction Speed!</p>
              </div>

              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Difficulty Selection */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Select Difficulty</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((diff) => {
                      const settings = DIFFICULTY_SETTINGS[diff];
                      return (
                        <motion.div
                          key={diff}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              difficulty === diff
                                ? "bg-gradient-to-br from-red-500 to-rose-400 border-white/50"
                                : "bg-white/5 hover:bg-white/10 border-white/20"
                            }`}
                            onClick={() => setDifficulty(diff)}
                          >
                            <CardContent className="p-3 sm:p-4 text-center">
                              <div className="text-base sm:text-lg font-bold text-white mb-1 capitalize">
                                {diff}
                              </div>
                              <div className="text-[10px] sm:text-xs text-white/80">
                                {settings.duration}s • {settings.multiplier}x
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* How to Play */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">How to Play</h2>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <div className="bg-red-500/20 p-2 rounded-full shrink-0">
                          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Click Targets</h3>
                          <p className="text-xs sm:text-sm text-white/70">
                            Tap targets before they disappear!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <div className="bg-yellow-500/20 p-2 rounded-full shrink-0">
                          <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Build Combos</h3>
                          <p className="text-xs sm:text-sm text-white/70">
                            Hit streaks multiply your score!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full shrink-0">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Score Points</h3>
                          <p className="text-xs sm:text-sm text-white/70">
                            Smaller targets = More points!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
                          <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm sm:text-base">Beat The Clock</h3>
                          <p className="text-xs sm:text-sm text-white/70">
                            Time limit varies by difficulty!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => startGame()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500 text-base sm:text-lg font-bold"
                  >
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Start Game
                  </Button>
                </motion.div>

                <Button
                  variant="outline"
                  onClick={() => navigate("/games")}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border-white/30 text-sm sm:text-base"
                >
                  Back to Games
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 py-4 sm:py-8 px-2 sm:px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <div className="bg-gradient-to-r from-red-500 to-rose-400 p-6 sm:p-8 text-white text-center">
                <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 1 }}>
                  <Trophy className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4" />
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Game Over!</h1>
                <p className="text-sm sm:text-base">Final Results - {difficulty.toUpperCase()} Mode</p>
              </div>

              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* Main Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                      <CardContent className="p-3 sm:p-4 md:pt-6 text-center">
                        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-yellow-400 mb-1 sm:mb-2" />
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{score}</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Total Score</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
                      <CardContent className="p-3 sm:p-4 md:pt-6 text-center">
                        <Target className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-purple-400 mb-1 sm:mb-2" />
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{accuracy}%</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Accuracy</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30 col-span-2 md:col-span-1">
                      <CardContent className="p-3 sm:p-4 md:pt-6 text-center">
                        <Flame className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-orange-400 mb-1 sm:mb-2" />
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{bestCombo}x</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Best Combo</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-400">{hits}</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Hits</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">{misses}</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Misses</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/20">
                      <CardContent className="p-2 sm:p-4 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{hits + misses}</div>
                        <div className="text-[10px] sm:text-xs text-white/70">Total</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rewards */}
                  <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <Coins className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-yellow-400 mb-2 sm:mb-3" />
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white">You Earned</h3>
                      <div className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">
                        +{coinsEarned} AITD Coins
                      </div>
                      <p className="text-xs sm:text-sm text-white/70">
                        Based on your performance
                      </p>
                    </CardContent>
                  </Card>

                  {/* Performance Badge */}
                  <div className="text-center">
                    {bestCombo >= 10 ? (
                      <Badge className="text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Combo Master! 🔥
                      </Badge>
                    ) : accuracy >= 80 ? (
                      <Badge className="text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 bg-green-500">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Sharpshooter! 🎯
                      </Badge>
                    ) : accuracy >= 60 ? (
                      <Badge className="text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 bg-blue-500">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Great Aim! 👍
                      </Badge>
                    ) : (
                      <Badge className="text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2 bg-orange-500">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Keep Practicing! 💪
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/30"
                      onClick={() => startGame()}
                    >
                      Play Again
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500"
                      onClick={() => navigate("/games")}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      More Games
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-rose-900 py-2 sm:py-4 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        {/* HUD */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-4"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-[10px] sm:text-xs text-white/70">Score</div>
            </CardContent>
          </Card>
          <Card
            className={`bg-white/10 backdrop-blur-md border-white/20 ${
              timeLeft <= 5 ? "animate-pulse border-red-500" : ""
            }`}
          >
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <div
                className={`text-xl sm:text-2xl font-bold ${
                  timeLeft <= 5 ? "text-red-400" : "text-white"
                }`}
              >
                {timeLeft}s
              </div>
              <div className="text-[10px] sm:text-xs text-white/70">Time</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{hits}</div>
              <div className="text-[10px] sm:text-xs text-white/70">Hits</div>
            </CardContent>
          </Card>
          <Card
            className={`bg-white/10 backdrop-blur-md ${
              combo > 0 ? "border-orange-400 animate-pulse" : "border-white/20"
            }`}
          >
            <CardContent className="p-2 sm:p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                {combo > 0 && <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />}
                <div className="text-xl sm:text-2xl font-bold text-orange-400">
                  {combo > 0 ? `${combo}x` : "0x"}
                </div>
              </div>
              <div className="text-[10px] sm:text-xs text-white/70">Combo</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Area */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20">
            <div
              ref={gameAreaRef}
              onClick={handleAreaClick}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 cursor-crosshair touch-none"
              style={{ height: "clamp(400px, 70vh, 600px)" }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Target className="h-48 w-48 sm:h-64 sm:w-64 text-white" />
                </div>
              </div>

              {/* Particles */}
              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ scale: 1, opacity: 1, x: particle.x, y: particle.y }}
                    animate={{
                      scale: 0,
                      opacity: 0,
                      x: particle.x + (Math.random() - 0.5) * 100,
                      y: particle.y + (Math.random() - 0.5) * 100,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: particle.color,
                      boxShadow: `0 0 10px ${particle.color}`,
                    }}
                  />
                ))}
              </AnimatePresence>

              {/* Targets */}
              <AnimatePresence>
                {targets.map((target) => (
                  <motion.button
                    key={target.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTargetClick(target, e);
                    }}
                    className={`absolute rounded-full ${target.color} animate-pulse shadow-lg border-2 border-white/50 active:scale-75 transition-all`}
                    style={{
                      left: `${target.x}px`,
                      top: `${target.y}px`,
                      width: `${target.size}px`,
                      height: `${target.size}px`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-bold text-[10px] sm:text-xs drop-shadow-lg">
                        {target.points}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative">
                  <div className="absolute w-6 sm:w-8 h-0.5 bg-red-500/30 -left-3 sm:-left-4" />
                  <div className="absolute w-6 sm:w-8 h-0.5 bg-red-500/30 -right-3 sm:-right-4" />
                  <div className="absolute h-6 sm:h-8 w-0.5 bg-red-500/30 -top-3 sm:-top-4" />
                  <div className="absolute h-6 sm:h-8 w-0.5 bg-red-500/30 -bottom-3 sm:-bottom-4" />
                </div>
              </div>

              {/* Combo Display */}
              <AnimatePresence>
                {combo > 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                  >
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-base sm:text-lg md:text-xl px-4 sm:px-6 py-2 shadow-2xl">
                      <Flame className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
                      {combo}x COMBO!
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
