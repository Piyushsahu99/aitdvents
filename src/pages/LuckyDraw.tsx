import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuckyDrawCard } from "@/components/games/LuckyDrawCard";
import { useLuckyDraw, getDemoDraws } from "@/hooks/useLuckyDraw";
import { 
  ArrowLeft, 
  Gift, 
  Loader2, 
  Sparkles, 
  Trophy,
  Calendar,
  CheckCircle2
} from "lucide-react";

export default function LuckyDraw() {
  const {
    draws,
    entries,
    myEntries,
    isLoading,
    isEntering,
    fetchDraws,
    enterDraw,
  } = useLuckyDraw();

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  // Use demo draws if no real draws exist
  const displayDraws = draws.length > 0 ? draws : getDemoDraws();

  const filteredDraws = displayDraws.filter((draw) => {
    if (activeTab === "all") return true;
    if (activeTab === "entered") return myEntries.has(draw.id);
    return draw.status === activeTab;
  });

  const handleEnter = async (drawId: string) => {
    await enterDraw(drawId);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/quiz">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Lucky Draw
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter draws and win amazing prizes!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4 text-center">
              <Gift className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{displayDraws.length}</p>
              <p className="text-xs text-muted-foreground">Active Draws</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{myEntries.size}</p>
              <p className="text-xs text-muted-foreground">Your Entries</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="live">
              <span className="relative flex items-center gap-1">
                Live
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </span>
            </TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="entered">Entered</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Draws Grid */}
        {filteredDraws.length === 0 ? (
          <Card className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No draws found</h3>
            <p className="text-muted-foreground">
              {activeTab === "entered" 
                ? "You haven't entered any draws yet" 
                : "Check back later for new draws"}
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDraws.map((draw, index) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LuckyDrawCard
                  draw={draw}
                  entryCount={entries[draw.id] || 0}
                  hasEntered={myEntries.has(draw.id)}
                  onEnter={() => handleEnter(draw.id)}
                  isEntering={isEntering}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* How it works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">How Lucky Draw Works</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Enter the Draw</p>
                <p className="text-muted-foreground">Click "Enter Draw" on any active draw. Some are free!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Wait for Draw</p>
                <p className="text-muted-foreground">Winners are selected randomly at the scheduled time.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Win Prizes!</p>
                <p className="text-muted-foreground">Winners are announced and prizes are credited automatically.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
