import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, Newspaper, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = {
  story: { Icon: BookOpen, color: "text-primary" },
  chapter: { Icon: FileText, color: "text-primary" },
  blog: { Icon: Newspaper, color: "text-accent" },
};

export default function SearchPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: stories = [] } = useQuery({
    queryKey: ["search-stories"],
    queryFn: () => base44.entities.Story.list(),
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ["search-chapters"],
    queryFn: () => base44.entities.Chapter.filter({ published: true }),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["search-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, "-created_date", 20),
  });

  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const storyResults = stories
      .filter((s) => !s.hidden && (s.title?.toLowerCase().includes(q) || s.tags?.some((t) => t.toLowerCase().includes(q))))
      .map((s) => ({ type: "story", title: s.title, subtitle: s.tags?.slice().sort().slice(0, 3).join(", "), link: `/story/${s.story_code}` }));

    const chapterResults = chapters
      .filter((c) => c.title?.toLowerCase().includes(q))
      .map((c) => {
        const story = stories.find((s) => s.id === c.story_id);
        return {
          type: "chapter",
          title: c.title,
          subtitle: story?.title,
          link: `/story/${c.story_id}/chapter/${c.id}`,
        };
      });

    const postResults = posts
      .filter((p) => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q))
      .map((p) => ({ type: "blog", title: p.title, subtitle: p.excerpt, link: `/blog/${p.id}` }));

    return [...storyResults, ...chapterResults, ...postResults];
  }, [query, stories, chapters, posts]);

  const results = allResults.slice(0, 5);
  const hasMore = allResults.length > 5;

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300 hover:scale-105"
        title="Search the archive"
      >
        {open ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 w-80 bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden"
          >
            <div className="p-3 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories, chapters, posts..."
                  className="w-full pl-9 pr-3 h-9 text-sm rounded-lg bg-background/50 border border-border/40 focus:border-primary/50 outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {!query.trim() ? (
                <p className="text-center text-muted-foreground text-xs py-8 font-light">
                  Start typing to search the archive...
                </p>
              ) : results.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8 font-light">
                  No results found.
                </p>
              ) : (
                <>
                  {results.map((r, i) => {
                    const { Icon, color } = iconMap[r.type];
                    return (
                      <Link
                        key={i}
                        to={r.link}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 border-b border-border/20 transition-colors group"
                      >
                        <Icon className={`w-4 h-4 ${color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground/90 truncate group-hover:text-accent transition-colors">
                            {r.title}
                          </p>
                          {r.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                          )}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent shrink-0" />
                      </Link>
                    );
                  })}
                  {hasMore && (
                    <Link
                      to={`/search?q=${encodeURIComponent(query.trim())}`}
                      onClick={close}
                      className="flex items-center justify-center gap-1 px-4 py-3 text-sm text-primary hover:text-accent border-b border-border/20 transition-colors font-medium"
                    >
                      Show all {allResults.length} results
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
