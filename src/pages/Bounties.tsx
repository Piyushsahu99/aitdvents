import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { AuthModal } from "@/components/AuthModal";
import { POINT_VALUES } from "@/hooks/useEarnCoins";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Trophy, 
  Clock, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Filter,
  Grid3X3,
  List,
  Award,
  Coins,
  Instagram,
  Github,
  Youtube,
  Send,
  Linkedin,
  Twitter,
  Star,
  ExternalLink,
  Gift,
  CheckCircle2,
  Zap
} from "lucide-react";

interface Bounty {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  prize_amount: string;
  prize_currency: string;
  deadline: string;
  total_participants: number;
  task_type: string;
  tags: string[];
  banner_url?: string;
}

interface EarningTask {
  id: string;
  title: string;
  description: string;
  brand_name: string;
  brand_logo_url: string | null;
  task_type: string;
  platform: string | null;
  action_required: string;
  task_url: string;
  reward_amount: number;
  reward_currency: string;
  max_completions: number | null;
  current_completions: number;
  bonus_pool: number;
  top_performers_count: number;
  difficulty: string;
  verification_type: string;
  instructions: string | null;
  deadline: string | null;
  is_featured: boolean;
}

export default function Bounties() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [earningTasks, setEarningTasks] = useState<EarningTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<EarningTask | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userCompletions, setUserCompletions] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBounties();
    fetchEarningTasks();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCompletions(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserCompletions(session.user.id);
      } else {
        setUserCompletions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchBounties = async () => {
    try {
      const { data, error } = await supabase
        .from("bounties")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBounties(data || []);
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("earning_tasks")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEarningTasks(data || []);
    } catch (error) {
      console.error("Error fetching earning tasks:", error);
    }
  };

  const fetchUserCompletions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("task_completions")
        .select("task_id")
        .eq("user_id", userId);

      if (error) throw error;
      setUserCompletions(data?.map(c => c.task_id) || []);
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  };

  const handleTaskSubmit = async () => {
    if (!user || !selectedTask) {
      setShowAuthModal(true);
      return;
    }

    if (!proofUrl.trim()) {
      toast.error("Please provide proof of completion");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("task_completions")
        .insert({
          task_id: selectedTask.id,
          user_id: user.id,
          proof_url: proofUrl,
          status: "pending"
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("You've already submitted this task");
        } else {
          throw error;
        }
      } else {
        toast.success("Task submitted for verification! Coins will be awarded upon approval.");
        setUserCompletions([...userCompletions, selectedTask.id]);
        setSelectedTask(null);
        setProofUrl("");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: string | null) => {
    switch (platform?.toLowerCase()) {
      case "instagram": return <Instagram className="h-5 w-5 text-pink-500" />;
      case "github": return <Github className="h-5 w-5" />;
      case "youtube": return <Youtube className="h-5 w-5 text-red-500" />;
      case "telegram": return <Send className="h-5 w-5 text-blue-500" />;
      case "linkedin": return <Linkedin className="h-5 w-5 text-blue-600" />;
      case "twitter": return <Twitter className="h-5 w-5 text-sky-500" />;
      default: return <Star className="h-5 w-5 text-yellow-500" />;
    }
  };

  const categories = ["All", ...new Set(bounties.map((b) => b.category))];

  const filteredBounties = bounties.filter(
    (bounty) =>
      (category === "All" || bounty.category === category) &&
      (bounty.title.toLowerCase().includes(search.toLowerCase()) ||
        bounty.description.toLowerCase().includes(search.toLowerCase()))
  );

  const featuredBounties = bounties.slice(0, 2);

  const handleBountyClick = (bountyId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/bounty/${bountyId}`);
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getStatusBadge = (deadline: string) => {
    const days = getDaysRemaining(deadline);
    if (days === 0) return { text: "Ended", color: "bg-gray-500" };
    if (days <= 3) return { text: `${days}d left`, color: "bg-red-500" };
    if (days <= 7) return { text: `${days}d left`, color: "bg-orange-500" };
    return { text: "In Review", color: "bg-amber-500" };
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Content: "bg-blue-100 text-blue-700 border-blue-200",
      Marketing: "bg-purple-100 text-purple-700 border-purple-200",
      Research: "bg-green-100 text-green-700 border-green-200",
      Development: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[cat] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Bounties & Tasks</h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-3">
            Complete tasks & challenges to earn rewards
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs sm:text-sm">
              <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              +{POINT_VALUES.BOUNTY_SUBMIT} coins/bounty
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs sm:text-sm">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              Instant coins
            </Badge>
          </div>
        </div>
      </section>

      {/* Earning Tasks Section */}
      {earningTasks.length > 0 && (
        <section className="py-6 sm:py-8 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                <h2 className="text-lg sm:text-xl font-bold">Earning Tasks</h2>
                <Badge variant="secondary" className="text-[10px] sm:text-xs">New</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Complete simple tasks & earn!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {earningTasks.map((task) => {
                const isCompleted = userCompletions.includes(task.id);
                return (
                  <Card 
                    key={task.id} 
                    className={`group overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                      isCompleted ? "opacity-60" : ""
                    } ${task.is_featured ? "ring-2 ring-emerald-500/50" : ""}`}
                    onClick={() => !isCompleted && setSelectedTask(task)}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center flex-shrink-0">
                          {getPlatformIcon(task.platform)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{task.brand_name}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {task.is_featured && (
                          <Badge className="bg-emerald-500 text-white border-0 text-[10px]">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {task.action_required}
                        </Badge>
                        {task.bonus_pool > 0 && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                            <Trophy className="h-2.5 w-2.5 mr-1" />
                            +{task.bonus_pool} Bonus
                          </Badge>
                        )}
                      </div>

                      {/* Reward */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-emerald-600">+{task.reward_amount}</span>
                          <span className="text-xs text-muted-foreground">coins</span>
                        </div>
                        {isCompleted ? (
                          <Badge className="bg-emerald-500 text-white border-0 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            Complete <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Bounties */}
      {featuredBounties.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold">Featured Opportunities</h2>
              </div>
              <Button variant="link" className="text-primary gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredBounties.map((bounty, index) => {
                const status = getStatusBadge(bounty.deadline);
                return (
                  <Card
                    key={bounty.id}
                    className="group overflow-hidden hover:shadow-xl transition-all cursor-pointer border-t-4"
                    style={{ borderTopColor: index === 0 ? '#F59E0B' : '#10B981' }}
                    onClick={() => handleBountyClick(bounty.id)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <Award className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                              {bounty.title}
                            </h3>
                            <Badge className="bg-amber-500 text-white border-0 flex-shrink-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-primary font-medium">{bounty.task_type || 'Bounty'}</span>
                            <span className="text-muted-foreground">•</span>
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(bounty.category)}`}>
                              {bounty.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {bounty.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{bounty.prize_amount} {bounty.prize_currency}</p>
                            <p className="text-xs text-muted-foreground">Reward</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{status.text}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-6 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <SearchBar
                placeholder="Search listings, organisations, or topics..."
                value={search}
                onChange={setSearch}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Bounties */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-12 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : filteredBounties.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No bounties found. Check back soon for new opportunities!
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredBounties.map((bounty) => {
                const status = getStatusBadge(bounty.deadline);
                const daysLeft = getDaysRemaining(bounty.deadline);

                if (viewMode === 'list') {
                  return (
                    <Card
                      key={bounty.id}
                      className="group hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleBountyClick(bounty.id)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {bounty.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(bounty.category)}`}>
                              {bounty.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {bounty.total_participants} submissions
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{bounty.prize_amount} {bounty.prize_currency}</p>
                          <p className="text-xs text-muted-foreground">{daysLeft}d left</p>
                        </div>
                      </div>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={bounty.id}
                    className="group overflow-hidden hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-primary/50"
                    onClick={() => handleBountyClick(bounty.id)}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {bounty.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-primary font-medium">{bounty.task_type || 'Bounty'}</span>
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(bounty.category)}`}>
                              {bounty.category}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {bounty.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{bounty.total_participants} submissions</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bounty.difficulty}
                        </Badge>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-bold">{bounty.prize_amount} {bounty.prize_currency}</p>
                            <p className="text-xs text-muted-foreground">Reward</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-medium">{status.text}</span>
                        </div>
                      </div>

                      {/* Button */}
                      <Button variant="outline" className="w-full mt-4">
                        View Details
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => fetchBounties()}
      />

      {/* Task Completion Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask && getPlatformIcon(selectedTask.platform)}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Complete this task and earn <span className="font-bold text-emerald-600">+{selectedTask?.reward_amount} coins</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Instructions:</p>
              <p className="text-muted-foreground whitespace-pre-line">{selectedTask?.instructions || selectedTask?.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <a href={selectedTask?.task_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Task Link
                </Button>
              </a>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proof">Proof of Completion</Label>
              <Input
                id="proof"
                placeholder="Enter screenshot URL or username..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Paste a screenshot link or relevant proof</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button onClick={handleTaskSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}