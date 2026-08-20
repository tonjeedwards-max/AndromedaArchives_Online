import React, { useState, useEffect } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BookOpen, Newspaper, X, ChevronRight, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import SearchPanel from "./SearchPanel";

const asArray = (value) => (Array.isArray(value) ? value : []);
const SEEN_KEY = "andromeda-last-seen-updates";

export default function FloatingActions() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(SEEN_KEY);
    return stored ? Number(stored) : 0;
  });
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: postsData = [] } = useQuery({
    queryKey: ["updates-posts"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("blogs")
        .select("blog_id, title, published_date, published_at, created_at")
        .eq("published", true)
        .order("published_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return asArray(data);
    },
    initialData: [],
  });
  const posts = asArray(postsData);

  const { data: chaptersData = [] } = useQuery({
    queryKey: ["updates-chapters"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("chapters")
        .select("id, story_id, chapter_number, title, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return asArray(data);
    },
    initialData: [],
  });
  const chapters = asArray(chaptersData);

  const { data: storiesData = [] } = useQuery({
    queryKey: ["updates-stories"],
    queryFn: async () => {
      const { data, error } = await requireSupabase()
        .from("stories")
        .select("id, story_code, title")
        .eq("hidden", false);
      if (error) throw error;
      return asArray(data);
    },
    initialData: [],
  });
  const stories = asArray(storiesData);
  const storyMap = Object.fromEntries(stories.map((s) => [String(s.id), s]));

  const updates = [
    ...posts.map((p) => ({ type: "blog", date: p.published_at || p.published_date || p.created_at, title: p.title, item: p })),
    ...chapters.map((c) => ({ type: "chapter", date: c.created_at, title: c.title, item: c, story: storyMap[String(c.story_id)] || null })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 8);

  const newestUpdateTime = updates.reduce((max, u) => Math.max(max, new Date(u.date || 0).getTime()), 0);
  const unseenCount = updates.filter((u) => new Date(u.date || 0).getTime() > lastSeen).length;

  const markUpdatesSeen = () => {
    const seenAt = newestUpdateTime || Date.now();
    localStorage.setItem(SEEN_KEY, String(seenAt));
    setLastSeen(seenAt);
  };

  const togglePanel = () => {
    setPanelOpen((open) => !open);
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {showTop && <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-10 h-10 rounded-full bg-card border border-border/50 shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-300 hover:scale-105" title="Back to top"><ArrowUp className="w-4 h-4" /></motion.button>}
        </AnimatePresence>
        <SearchPanel />
        <div className="relative">
          <button onClick={togglePanel} className="relative w-12 h-12 rounded-full bg-card border border-primary/40 shadow-lg shadow-primary/20 flex items-center justify-center hover:border-primary/70 transition-all duration-300 hover:scale-105" aria-label="Latest updates">
            <Bell className="w-5 h-5 text-primary" />
            {unseenCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">{unseenCount}</span>}
          </button>
          <AnimatePresence>
            {panelOpen && <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ duration: 0.2 }} onAnimationComplete={() => {}} className="absolute bottom-16 right-0 w-80 bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40"><div className="flex items-center gap-2"><Bell className="w-4 h-4 text-accent" /><span className="font-heading text-sm font-semibold">Latest Updates</span></div><button onClick={() => { markUpdatesSeen(); setPanelOpen(false); }} className="text-muted-foreground hover:text-foreground" aria-label="Close notifications"><X className="w-4 h-4" /></button></div>
              <div className="max-h-96 overflow-y-auto">
                {updates.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8 font-light">Nothing yet...</p> : updates.map((u, i) => (
                  <motion.div key={`${u.type}-${u.item.id ?? u.item.blog_id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    {u.type === "chapter" ? <Link to={u.story?.story_code && Number.isInteger(Number(u.item.chapter_number)) ? `/story/${u.story.story_code}/chapter/${Number(u.item.chapter_number)}` : "/stories"} onClick={() => { markUpdatesSeen(); setPanelOpen(false); }} className="flex items-start gap-3 px-4 py-3 hover:bg-primary/5 border-b border-border/20 transition-colors group">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><BookOpen className="w-3.5 h-3.5 text-primary" /></div>
                      <div className="flex-1 min-w-0"><p className="text-[10px] uppercase tracking-wider text-primary font-semibold">New Chapter</p><p className="text-xs text-primary font-medium">{u.story?.title || "Story Update"}</p><p className="text-sm font-medium text-foreground/90 truncate group-hover:text-accent transition-colors">Ch. {u.item.chapter_number}: {u.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{u.date ? formatDistanceToNow(new Date(u.date), { addSuffix: true }) : "Recently"}</p></div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent mt-1 flex-shrink-0" />
                    </Link> : <Link to={`/blog/${u.item.blog_id}`} onClick={() => { markUpdatesSeen(); setPanelOpen(false); }} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/5 border-b border-border/20 transition-colors group">
                      <div className="mt-0.5 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><Newspaper className="w-3.5 h-3.5 text-accent" /></div>
                      <div className="flex-1 min-w-0"><p className="text-[10px] uppercase tracking-wider text-accent font-semibold">New Blog Post</p><p className="text-sm font-medium text-foreground/90 truncate group-hover:text-accent transition-colors">{u.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{u.date ? formatDistanceToNow(new Date(u.date), { addSuffix: true }) : "Recently"}</p></div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent mt-1 flex-shrink-0" />
                    </Link>}
                  </motion.div>
                ))}
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
