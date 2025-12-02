import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AuthModal } from "@/components/AuthModal";
import { PageBanner, PlaceholderSection } from "@/components/PageBanner";
import { useSiteContent, usePageBanners } from "@/hooks/useSiteContent";
import { Trophy, Clock, Users, DollarSign, ArrowRight, Timer } from "lucide-react";

export default function Bounties() {
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { getValue } = useSiteContent("bounties");
  const { banners: topBanners } = usePageBanners("bounties", "top");
  const { banners: middleBanners } = usePageBanners("bounties", "middle");

  useEffect(() => {
    fetchBounties();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const categories = [...new Set(bounties.map((b: any) => b.category))];

  const filteredBounties = bounties.filter(
    (bounty: any) =>
      (category === "All" || bounty.category === category) &&
      (bounty.title.toLowerCase().includes(search.toLowerCase()) ||
        bounty.description.toLowerCase().includes(search.toLowerCase()))
  );

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">
            {getValue("hero", "title", "Earn with Bounties")}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {getValue("hero", "subtitle", "Complete challenges, showcase your skills, and earn real money")}
        </p>
      </div>

      {/* Top Banner/Promo Section */}
      <div className="mb-8">
        {topBanners.length > 0 ? (
          <PageBanner page="bounties" position="top" />
        ) : (
          <PlaceholderSection id="bounties-top-banner" />
        )}
      </div>

      <div className="space-y-6 mb-8">
        <SearchBar
          placeholder="Search bounties..."
          value={search}
          onChange={setSearch}
        />
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {/* Middle Banner/Promo Section */}
      <div className="mb-8">
        {middleBanners.length > 0 ? (
          <PageBanner page="bounties" position="middle" />
        ) : (
          <PlaceholderSection id="bounties-middle-banner" />
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bounties...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map((bounty: any) => {
            const daysLeft = getDaysRemaining(bounty.deadline);
            return (
              <Card
                key={bounty.id}
                className="group overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all cursor-pointer border-2 hover:border-primary/50"
                onClick={() => handleBountyClick(bounty.id)}
              >
                {bounty.banner_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={bounty.banner_url}
                      alt={bounty.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Badge variant="secondary">{bounty.category}</Badge>
                    <Badge
                      variant={daysLeft > 7 ? "outline" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      <Timer className="h-3 w-3" />
                      {daysLeft}d left
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {bounty.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {bounty.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Prize Pool</span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {bounty.prize_currency} {bounty.prize_amount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{bounty.total_participants} participants</span>
                      </div>
                      <Badge variant="outline">{bounty.difficulty}</Badge>
                    </div>

                    <Button className="w-full group-hover:bg-primary/90" size="lg">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filteredBounties.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No bounties found. Check back soon for new opportunities!
          </p>
        </div>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => fetchBounties()}
      />
    </div>
  );
}
