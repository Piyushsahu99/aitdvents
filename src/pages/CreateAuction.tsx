import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/data/iplPlayers";
import {
  ArrowLeft,
  Gavel,
  Loader2,
  Trophy,
  Users,
  Coins,
  Timer,
  Flag,
} from "lucide-react";

export default function CreateAuction() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    seasonName: "IPL 2025",
    initialBudget: 85, // in Crores
    maxTeams: 8,
    minTeamSize: 11,
    maxTeamSize: 25,
    maxOverseas: 8,
    bidIncrement: 5, // in Lakhs
    timePerPlayer: 30, // seconds
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter an auction title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to create an auction",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("ipl_auctions")
        .insert({
          title: formData.title,
          season_name: formData.seasonName,
          created_by: user.id,
          initial_budget: formData.initialBudget * 10000000, // Convert Cr to actual value
          max_teams: formData.maxTeams,
          min_team_size: formData.minTeamSize,
          max_team_size: formData.maxTeamSize,
          max_overseas: formData.maxOverseas,
          bid_increment: formData.bidIncrement * 100000, // Convert L to actual value
          time_per_player: formData.timePerPlayer,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Auction created! 🏏",
        description: `Join code: ${data.join_code}`,
      });

      navigate(`/ipl-auction?code=${data.join_code}`);
    } catch (error) {
      console.error("Error creating auction:", error);
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-500/10 via-background to-cyan-500/10 py-4 sm:py-6">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/ipl-auction">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Gavel className="h-6 w-6 text-blue-500" />
              Create Auction
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up your own IPL auction room
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Auction Settings</CardTitle>
                  <CardDescription>Configure your auction parameters</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Auction Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., College Premier League 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* Season */}
              <div className="space-y-2">
                <Label htmlFor="season">Season Name</Label>
                <Input
                  id="season"
                  placeholder="e.g., IPL 2025"
                  value={formData.seasonName}
                  onChange={(e) => setFormData({ ...formData, seasonName: e.target.value })}
                />
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    Team Budget
                  </Label>
                  <span className="text-lg font-bold text-primary">
                    ₹{formData.initialBudget} Crore
                  </span>
                </div>
                <Slider
                  value={[formData.initialBudget]}
                  onValueChange={([value]) => setFormData({ ...formData, initialBudget: value })}
                  min={50}
                  max={150}
                  step={5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₹50 Cr</span>
                  <span>₹150 Cr</span>
                </div>
              </div>

              {/* Max Teams */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Maximum Teams
                  </Label>
                  <span className="text-lg font-bold">{formData.maxTeams}</span>
                </div>
                <Slider
                  value={[formData.maxTeams]}
                  onValueChange={([value]) => setFormData({ ...formData, maxTeams: value })}
                  min={2}
                  max={12}
                  step={1}
                />
              </div>

              {/* Team Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Squad Size</Label>
                  <Input
                    type="number"
                    value={formData.minTeamSize}
                    onChange={(e) => setFormData({ ...formData, minTeamSize: parseInt(e.target.value) || 11 })}
                    min={11}
                    max={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Squad Size</Label>
                  <Input
                    type="number"
                    value={formData.maxTeamSize}
                    onChange={(e) => setFormData({ ...formData, maxTeamSize: parseInt(e.target.value) || 25 })}
                    min={15}
                    max={30}
                  />
                </div>
              </div>

              {/* Overseas Limit */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-green-500" />
                    Overseas Player Limit
                  </Label>
                  <span className="text-lg font-bold">{formData.maxOverseas}</span>
                </div>
                <Slider
                  value={[formData.maxOverseas]}
                  onValueChange={([value]) => setFormData({ ...formData, maxOverseas: value })}
                  min={4}
                  max={12}
                  step={1}
                />
              </div>

              {/* Bid Increment */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Bid Increment
                </Label>
                <div className="flex gap-2">
                  {[5, 10, 20, 25, 50].map((value) => (
                    <Button
                      key={value}
                      variant={formData.bidIncrement === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, bidIncrement: value })}
                    >
                      ₹{value}L
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time per player */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-500" />
                    Time Per Player
                  </Label>
                  <span className="text-lg font-bold">{formData.timePerPlayer}s</span>
                </div>
                <Slider
                  value={[formData.timePerPlayer]}
                  onValueChange={([value]) => setFormData({ ...formData, timePerPlayer: value })}
                  min={15}
                  max={60}
                  step={5}
                />
              </div>

              {/* Create button */}
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formData.title.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    Create Auction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
