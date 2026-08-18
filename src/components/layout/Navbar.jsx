import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import SubscribeForm from "@/components/shared/SubscribeForm";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/stories", label: "Stories" },
  { path: "/library", label: "Library" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const hideNav = location.pathname === "/" || location.pathname === "/blog";

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-accent transition-transform group-hover:rotate-12 shrink-0" />
          <span className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-shimmer">The Andromeda Archive</span>
        </Link>

        {!hideNav && (
          <div className="hidden lg:flex items-center gap-4 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wider uppercase transition-colors duration-300 ${location.pathname === link.path ? "text-accent" : "text-foreground/70 hover:text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="text-foreground/70 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-foreground/80 hover:text-foreground" aria-label="Open menu">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`block text-sm font-medium tracking-wider uppercase py-2 ${location.pathname === link.path ? "text-accent" : "text-foreground/70"}`}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border/30 pt-4 mt-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Subscribe to Andromeda</p>
                <SubscribeForm />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
