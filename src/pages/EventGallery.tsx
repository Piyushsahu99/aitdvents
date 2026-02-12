import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Image as ImageIcon, Lock, ExternalLink, Calendar, Camera, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Gallery {
  id: string;
  event_title: string;
  description: string | null;
  cover_image_url: string | null;
  event_date: string | null;
  photo_count: number;
  // drive_link and password are fetched but hidden until password verified
  drive_link: string;
  password: string;
}

export default function EventGallery() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => { fetchGalleries(); }, []);

  const fetchGalleries = async () => {
    const { data, error } = await supabase
      .from("event_galleries")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!error) setGalleries(data || []);
    setLoading(false);
  };

  const handleUnlock = () => {
    if (!selectedGallery) return;
    if (passwordInput === selectedGallery.password) {
      setUnlocked(true);
      toast({ title: "🎉 Unlocked!", description: "You now have access to the photos" });
    } else {
      toast({ title: "Wrong password", description: "Please try again", variant: "destructive" });
    }
  };

  const openGallery = (g: Gallery) => {
    setSelectedGallery(g);
    setPasswordInput("");
    setUnlocked(false);
    setDialogOpen(true);
  };

  const filtered = galleries.filter(g =>
    g.event_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-12 sm:py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <Camera className="w-3 h-3 mr-1" /> Event Memories
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Event <span className="bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">Photo Gallery</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-6">
            Access photos from our past events. Enter the event password to unlock and download your memories!
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No galleries found</p>
              <p className="text-sm">Check back after our next event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((gallery, index) => (
                <Card
                  key={gallery.id}
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/30 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => openGallery(gallery)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {gallery.cover_image_url ? (
                      <img
                        src={gallery.cover_image_url}
                        alt={gallery.event_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                        index % 3 === 0 ? 'from-primary/30 to-accent/30' :
                        index % 3 === 1 ? 'from-warning/30 to-primary/30' :
                        'from-accent/30 to-warning/30'
                      }`}>
                        <Camera className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-background/80 text-foreground backdrop-blur-sm text-[10px]">
                        <Lock className="h-2.5 w-2.5 mr-1" /> Password Protected
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 drop-shadow-lg">{gallery.event_title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    {gallery.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{gallery.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {gallery.event_date && (
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {gallery.event_date}</span>
                        )}
                        <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {gallery.photo_count} photos</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Password Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setUnlocked(false); setPasswordInput(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {unlocked ? <Camera className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-warning" />}
              {selectedGallery?.event_title}
            </DialogTitle>
            <DialogDescription>
              {unlocked ? "Click below to access the photos" : "Enter the event password to access photos"}
            </DialogDescription>
          </DialogHeader>

          {!unlocked ? (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
              />
              <Button onClick={handleUnlock} className="w-full">
                <Lock className="h-4 w-4 mr-2" /> Unlock Photos
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Password was shared during the event. Contact organizers if you don't have it.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">Access Granted!</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedGallery?.photo_count} photos available
                </p>
                <a href={selectedGallery?.drive_link} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" /> Open in Google Drive
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
