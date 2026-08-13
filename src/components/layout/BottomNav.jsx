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

  const openChat = () => window.dispatchEvent(new CustomEvent("andromeda:open-chat"));

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/50 bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-16 max-w-md mx-auto">
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
          onClick={openChat}
          className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">Chat</span>
        </button>
      </div>
    </nav>
  );
}
