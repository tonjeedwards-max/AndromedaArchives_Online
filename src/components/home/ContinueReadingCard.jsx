import React from "react";
import { Link } from "react-router-dom";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ContinueReadingCard() {
  const { history } = useReaderPrefs();
  const entries = Object.values(history || {});
  if (entries.length === 0) return null;

  const latest = [...entries].sort((a, b) => new Date(b.readAt) - new Date(a.readAt))[0];
  if (!latest?.chapterId) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden mb-6">
      <Link
        to={`/story/${latest.storyId}/chapter/${latest.chapterId}`}
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 hover:border-primary/50 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Continue reading</p>
          <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{latest.storyTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{latest.title}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
}
