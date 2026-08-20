import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Bookmark, Newspaper, MessageCircle } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { path: "/stories", label: "Stories", icon: BookOpen, match: (p) => p.startsWith("/story") },
  { path: "/library", label: "Library", icon: Bookmark, match: (p) => p === "/library" },
  { path: "/blog", label: "Blog", icon: Newspaper, match: (p) => p.startsWith("/blog") },
];

export default function BottomNav() {
  const location = useLocation();

  // Use the exact same event consumed by the shared ChatWidget.
  // Keeping this as an event (rather than duplicating chat state here) means
  // the hamburger menu and bottom navigation control the same chat instance.
  const toggleChat = () => {
    window.dispatchEvent(new CustomEvent("andromeda-toggle-chat"));
  };

  return (
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
  );
}
