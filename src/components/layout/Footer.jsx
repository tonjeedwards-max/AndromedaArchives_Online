import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";
import SubscribeForm from "@/components/shared/SubscribeForm";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        {/* Subscribe */}
        <div className="hidden lg:flex lg:flex-row items-center justify-between gap-4 pb-8 border-b border-border/30">
          <div className="text-center md:text-left">
            <h3 className="font-heading text-lg font-semibold mb-1">
              Subscribe to The Andromeda Archive
            </h3>
            <p className="text-sm text-muted-foreground font-light">
              Get notified when new chapters and posts arrive.
            </p>
          </div>
          <SubscribeForm />
        </div>

        {/* Links + brand */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-display text-xl font-semibold text-shimmer">The Andromeda Archive</span>
          </div>

          <div className="hidden lg:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/stories" className="hover:text-foreground transition-colors">Stories</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/library" className="hover:text-foreground transition-colors">Library</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-secondary" /> by <span className="text-accent font-medium">essieworld07</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
