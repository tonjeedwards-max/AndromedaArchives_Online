import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ChapterList({ chapters, storyId }) {
  if (!chapters || chapters.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10 font-light">
        Good stuff coming soon!
      </p>
    );
  }

  const sorted = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);

  return (
    <div className="space-y-2">
      {sorted.map((ch, i) => (
        <motion.div
          key={ch.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/story/${storyId}/chapter/${ch.chapter_number}`}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 hover:bg-card/80 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                {ch.chapter_number}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-sm group-hover:text-accent transition-colors truncate">
                  {ch.title}
                </p>
                {ch.word_count && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ch.word_count.toLocaleString()} words
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {ch.created_date && (
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {format(new Date(ch.created_date), "MMM d")}
                </span>
              )}
              <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
