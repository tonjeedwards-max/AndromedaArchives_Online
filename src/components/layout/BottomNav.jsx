import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Bookmark, LayoutGrid, MessageCircle, Newspaper, Images, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { path: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { path: "/stories", label: "Stories", icon: BookOpen, match: (p) => p.startsWith("/story") },
  { path: "/library", label: "Library", icon: Bookmark, match: (p) => p === "/library" },
];

const exploreLinks = [
  { path: "/blog", label: "Blog", icon: Newspaper, match: (p) => p.startsWith("/blog") },
  { path: "/gallery", label: "Gallery", icon: Images, match: (p) => p.startsWith("/gallery") },
  { path: "/podcasts", label: "Podcasts", icon: Headphones, match: (p) => p.startsWith("/podcasts") },
];

export default function BottomNav() {
  const location = useLocation();
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    setExploreOpen(false);
  }, [location.pathname]);

  const toggleChat = () => {
    window.dispatchEvent(new CustomEvent("andromeda-toggle-chat"));
  };

  const exploreActive = exploreLinks.some((link) => link.match(location.pathname));

  return (
    <>
      <AnimatePresence>
        {exploreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExploreOpen(false)}
            className="lg:hidden fixed inset-0 z-[105] bg-black/30"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exploreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="lg:hidden fixed bottom-16 inset-x-0 z-[106] px-4 pb-2"
          >
            <div className="max-w-md mx-auto bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl p-3 flex gap-2">
              {exploreLinks.map(({ path, label, icon: Icon, match }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-3 rounded-lg transition-colors ${
                    match(location.pathname)
                      ? "bg-primary/10 text-accent"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium tracking-wide">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-[110] border-t border-border/50 bg-background/85 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around h-16 max-w-md mx-auto relative z-10">
          {tabs.map(({ path, label, icon: Icon, match }) => {
            const active = match(location.pathname);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-colors ${
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setExploreOpen((open) => !open)}
            className={`relative z-10 flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-colors ${
              exploreOpen || exploreActive
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Open Explore menu"
            aria-expanded={exploreOpen}
          >
            <LayoutGrid className={`w-5 h-5 transition-transform ${exploreOpen || exploreActive ? "scale-110" : ""}`} />
            <span className="text-[10px] font-medium tracking-wide">Explore</span>
          </button>

          <button
            type="button"
            onClick={toggleChat}
            onTouchEnd={(event) => {
              event.preventDefault();
              toggleChat();
            }}
            className="relative z-10 flex flex-col items-center justify-center gap-1 flex-1 min-w-0 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
            aria-label="Open or close chat"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-wide">Chat</span>
          </button>
        </div>
      </nav>
    </>
  );
}
