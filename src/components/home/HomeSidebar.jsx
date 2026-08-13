import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Home as HomeIcon, BookOpen, Library, FileText, Mail, Info } from "lucide-react";

const navLinks = [
  { path: "/", label: "Home", icon: HomeIcon },
  { path: "/stories", label: "Stories", icon: BookOpen },
  { path: "/library", label: "Library", icon: Library },
  { path: "/blog", label: "Blog", icon: FileText },
  { path: "/about", label: "About", icon: Info },
  { path: "/contact", label: "Contact", icon: Mail },
];

export default function HomeSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col gap-6 sticky top-24 self-start w-64 shrink-0">
      {/* Avatar */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-accent/40 flex items-center justify-center mb-3">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed text-center font-light px-2">
        If you enjoy your fries with a side of sci-fi, romance, fantasy, or the occasional dark humor shitpost, welcome to the archives, buddy.
      </p>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname === path
                ? "text-accent bg-muted/60"
                : "text-foreground/70 hover:text-accent hover:bg-muted/60"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
