import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

export const FloatingTelegram = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("telegram-fab-dismissed") === "true";
  });

  if (isDismissed) {
    return (
      <a
        href="https://t.me/aitdevent"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-[#0088cc] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="Join Telegram"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </a>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Card */}
      <div
        className={`absolute bottom-16 right-0 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          isExpanded ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-r from-[#0088cc] to-[#00a2ed] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              <span className="font-semibold text-white">Join Our Community</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Get daily updates on events, hackathons, jobs & exclusive opportunities!
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>1000+ tech enthusiasts</span>
          </div>

          <div className="flex gap-2">
            <a
              href="https://t.me/aitdevent"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
              </svg>
              Join Now
            </a>
            <button
              onClick={() => {
                setIsDismissed(true);
                localStorage.setItem("telegram-fab-dismissed", "true");
              }}
              className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative flex items-center justify-center h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isExpanded 
            ? "bg-muted text-muted-foreground hover:bg-muted/80" 
            : "bg-[#0088cc] text-white hover:scale-110 animate-pulse"
        }`}
        aria-label="Toggle Telegram popup"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full border-2 border-background" />
          </>
        )}
      </button>
    </div>
  );
};
