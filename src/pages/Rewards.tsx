import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Zap, Shirt, Sticker, Package, Trophy, Star, Sparkles, Lock, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserPoints {
  total_points: number;
  shares_count: number;
  referrals_count: number;
  bounties_completed: number;
  courses_completed: number;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
  category: string;
  available: boolean;
}

const rewards: RewardItem[] = [
  {
    id: "stickers",
    name: "AITD Stickers Pack",
    description: "Exclusive AITD Events stickers for your laptop",
    pointsCost: 50,
    icon: <Sticker className="h-8 w-8" />,
    category: "Merchandise",
    available: true,
  },
  {
    id: "tshirt",
    name: "AITD T-Shirt",
    description: "Premium quality t-shirt with AITD branding",
    pointsCost: 150,
    icon: <Shirt className="h-8 w-8" />,
    category: "Merchandise",
    available: true,
  },
  {
    id: "hoodie",
    name: "Premium Hoodie",
    description: "Comfortable hoodie with embroidered AITD logo",
    pointsCost: 300,
    icon: <Package className="h-8 w-8" />,
    category: "Merchandise",
    available: true,
  },
  {
    id: "swag-box",
    name: "Complete Swag Box",
    description: "Hoodie + T-Shirt + Stickers + Surprise gifts",
    pointsCost: 500,
    icon: <Gift className="h-8 w-8" />,
    category: "Premium",
    available: true,
  },
];

export default function Rewards() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchPoints();
  }, []);

  const checkAuthAndFetchPoints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data, error } = await supabase
          .from("user_points")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!error && data) {
          setPoints(data);
        }
      }
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!points || points.total_points < reward.pointsCost) {
      toast.error("Not enough points to redeem this reward");
      return;
    }

    // Open WhatsApp/Telegram for redemption
    const message = encodeURIComponent(
      `Hi! I'd like to redeem: ${reward.name}\nMy Points: ${points.total_points}\nPoints Required: ${reward.pointsCost}`
    );
    window.open(`https://t.me/aitdevents?text=${message}`, "_blank");
    toast.success("Redirecting to claim your reward!");
  };

  const canRedeem = (cost: number) => {
    return points && points.total_points >= cost;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Gift className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Rewards Store
            </h1>
            <p className="text-muted-foreground">Redeem your points for exclusive swags!</p>
          </div>
        </div>
      </div>

      {/* Points Balance Card */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-yellow-500" />
                <span className="text-4xl font-bold">{points?.total_points || 0}</span>
                <span className="text-lg text-muted-foreground">points</span>
              </div>
            </div>
            {!user && (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Login to View Points
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            How to Earn Points
          </CardTitle>
          <CardDescription>Complete activities to earn points and unlock rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">+10</p>
              <p className="text-sm text-muted-foreground">Share Certificate</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/10">
              <p className="text-2xl font-bold text-green-500">+25</p>
              <p className="text-sm text-muted-foreground">Successful Referral</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
              <p className="text-2xl font-bold text-orange-500">+50</p>
              <p className="text-sm text-muted-foreground">Complete Bounty</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-2xl font-bold text-blue-500">+20</p>
              <p className="text-sm text-muted-foreground">Complete Course</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Available Rewards
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const canAfford = canRedeem(reward.pointsCost);
          
          return (
            <Card 
              key={reward.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                canAfford 
                  ? "border-primary/30 hover:border-primary/50" 
                  : "opacity-75"
              }`}
            >
              <CardContent className="p-6">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${
                  canAfford 
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-600" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {reward.icon}
                </div>
                
                <Badge variant="secondary" className="mb-2">
                  {reward.category}
                </Badge>
                
                <h3 className="text-lg font-semibold mb-2">{reward.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{reward.pointsCost}</span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                  {canAfford && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleRedeem(reward)}
                  disabled={!reward.available}
                  className={`w-full ${
                    canAfford 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                      : ""
                  }`}
                  variant={canAfford ? "default" : "outline"}
                >
                  {!user ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Login to Redeem
                    </>
                  ) : canAfford ? (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Now
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {reward.pointsCost - (points?.total_points || 0)} more pts needed
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Join Telegram Banner */}
      <Card className="mt-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Join our Telegram for Updates!</h3>
                <p className="text-sm text-muted-foreground">Get notified about new rewards and earn bonus points</p>
              </div>
            </div>
            <Button 
              onClick={() => window.open("https://t.me/aitdevents", "_blank")}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Telegram
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}