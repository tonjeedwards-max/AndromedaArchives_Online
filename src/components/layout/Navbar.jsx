import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import SubscribeForm from "@/components/shared/SubscribeForm";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const mainNavLinks = [
  { path: "/", label: "Home" },
  { path: "/stories", label: "Stories" },
  { path: "/library", label: "Library" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const collectiveLinks = [
  { path: "/blog", label: "Blog", description: "News, thoughts, and updates from the archive." },
  { path: "/gallery", label: "Gallery", description: "A visual collection from the Andromeda universe." },
  { path: "/podcasts", label: "Podcasts", description: "Listen to Starlight Radio and other archive audio." },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const hideNav = location.pathname === "/" || location.pathname === "/blog";
  const collectiveActive = collectiveLinks.some((link) => location.pathname === link.path);

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
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <Sparkles className="w-5 h-5 text-accent transition-transform group-hover:rotate-12 shrink-0" />
          <span className="font-display text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-shimmer">
            The Andromeda Archive
          </span>
        </Link>

        {!hideNav && (
          <div className="hidden lg:flex items-center gap-2">
            <NavigationMenu>
              <NavigationMenuList>
                {mainNavLinks.slice(0, 2).map((link) => (
                  <NavigationMenuItem key={link.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={link.path}
                        className={`inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium tracking-wider uppercase transition-colors hover:bg-accent/10 hover:text-accent ${
                          location.pathname === link.path
                            ? "text-accent"
                            : "text-foreground/70"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`bg-transparent px-4 text-sm font-medium tracking-wider uppercase hover:bg-accent/10 hover:text-accent focus:bg-accent/10 ${
                      collectiveLinks.some((link) => location.pathname === link.path)
                        ? "text-accent"
                        : "text-foreground/70"
                    }`}
                  >
                    Explore
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="w-[min(90vw,420px)] p-3">
                      <div className="mb-2 px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          The Archive
                        </p>
                      </div>
                      <div className="grid gap-1">
                        {collectiveLinks.map((link) => (
                          <NavigationMenuLink key={link.path} asChild>
                            <Link
                              to={link.path}
                              className="block rounded-lg p-3 transition-colors hover:bg-accent/10"
                            >
                              <div className="text-sm font-medium uppercase tracking-wider">
                                {link.label}
                              </div>
                              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                {link.description}
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {mainNavLinks.slice(2).map((link) => (
                  <NavigationMenuItem key={link.path}>
                    <NavigationMenuLink asChild>
                      <Link
                        to={link.path}
                        className={`inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium tracking-wider uppercase transition-colors hover:bg-accent/10 hover:text-accent ${
                          location.pathname === link.path
                            ? "text-accent"
                            : "text-foreground/70"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setMobileOpen(!mobileOpen);
              if (mobileOpen) setMobileExploreOpen(false);
            }}
            className="lg:hidden text-foreground/80 hover:text-foreground"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-6 py-5 space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => setMobileExploreOpen((open) => !open)}
                  className={`w-full flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
                    collectiveActive || mobileExploreOpen
                      ? "text-accent bg-accent/10"
                      : "text-foreground/80 hover:text-accent hover:bg-accent/10"
                  }`}
                  aria-expanded={mobileExploreOpen}
                >
                  <span>Explore</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileExploreOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {mobileExploreOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 ml-3 border-l border-border/40 pl-3 space-y-1">
                        {collectiveLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileOpen(false)}
                            className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                              location.pathname === link.path
                                ? "text-accent bg-accent/10"
                                : "text-foreground/70 hover:text-accent hover:bg-accent/10"
                            }`}
                          >
                            <span className="font-medium">{link.label}</span>
                            <span className="block mt-0.5 text-xs text-muted-foreground">
                              {link.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-border/30 pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                  Stay connected
                </p>
                <SubscribeForm />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
