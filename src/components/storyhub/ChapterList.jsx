import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

export default function ChapterList({ chapters, storyCode }) {
  const { isChapterRead } = useReaderPrefs();
  if (!Array.isArray(chapters) || chapters.length === 0) return <p className="text-center text-muted-foreground py-10 font-light">Good stuff coming soon!</p>;
  const sorted = [...chapters].sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number));
  return <div className="space-y-2">
    {sorted.map((ch, i) => {
      const read = isChapterRead(storyCode, ch.chapter_number);
      return <motion.div key={ch.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
        <Link to={`/story/${storyCode}/chapter/${ch.chapter_number}`} className={`flex items-center justify-between gap-4 px-5 py-4 rounded-lg border transition-all duration-300 group ${read ? "bg-muted/30 border-border/20 opacity-60 hover:opacity-80" : "bg-card/40 border-border/30 hover:border-primary/40 hover:bg-card/80"}`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{read ? <Check className="w-3.5 h-3.5" aria-label="Read" /> : ch.chapter_number}</span>
            <div className="min-w-0"><p className={`font-medium text-sm transition-colors truncate ${read ? "text-muted-foreground line-through decoration-muted-foreground/40" : "group-hover:text-accent"}`}>{ch.title}</p>{ch.word_count && <p className="text-xs text-muted-foreground mt-0.5">{Number(ch.word_count).toLocaleString()} words</p>}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">{read && <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">Read</span>}{ch.created_at && <span className="text-xs text-muted-foreground hidden sm:block">{format(new Date(ch.created_at), "MMM d")}</span>}<BookOpen className={`w-4 h-4 ${read ? "text-muted-foreground/60" : "text-muted-foreground group-hover:text-accent"}`} /></div>
        </Link>
      </motion.div>;
    })}
  </div>;
}
