import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LiveChat } from "@/components/LiveChat";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function LiveChatPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                  Live Chat
                </h1>
                <p className="text-xs text-muted-foreground">Connect with students in real-time</p>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              Live
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {!isLoggedIn && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Login to participate</p>
                <p className="text-xs text-muted-foreground">Join the conversation with other students</p>
              </div>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Main Chat */}
          <div className="lg:col-span-3">
            <LiveChat />
          </div>

          {/* Sidebar - Tips */}
          <div className="hidden lg:block space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                Chat Guidelines
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Be respectful to all members</li>
                <li>• No spam or promotional content</li>
                <li>• Help fellow students when you can</li>
                <li>• Keep discussions relevant</li>
                <li>• Report inappropriate behavior</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <h3 className="font-semibold text-sm mb-2">Quick Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Press Enter to send messages</li>
                <li>• Share event links to discuss</li>
                <li>• Ask about hackathons & bounties</li>
                <li>• Find study partners here</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
