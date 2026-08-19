import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getOptimizedCover, COVER_WIDTH, COVER_HEIGHT } from "@/lib/storyCover";

export default function ChapterUpdateCard({ chapter, story, index }) {
  if (!chapter) return null;

  const storyCode = story?.story_code;
  const chapterNumber = Number(chapter.chapter_number);
  const chapterPath = storyCode && Number.isInteger(chapterNumber)
    ? `/story/${storyCode}/chapter/${chapterNumber}`
    : `/stories`;
  const coverSrc = getOptimizedCover(story);

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.08 }} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
      <Link to={chapterPath} className="flex flex-col sm:flex-row">
        {coverSrc && (
          <div className="sm:w-32 shrink-0 overflow-hidden bg-muted/30">
            <img
              src={coverSrc}
              alt={story?.title || "Story cover"}
              width={COVER_WIDTH}
              height={COVER_HEIGHT}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                if (story?.cover_image && event.currentTarget.src !== story.cover_image) {
                  event.currentTarget.src = story.cover_image;
                }
              }}
              className="w-full h-32 sm:h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0"><BookOpen className="w-2.5 h-2.5 mr-1" />New Chapter</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{chapter.created_at ? format(new Date(chapter.created_at), "MMM d, yyyy") : "Recent"}</span>
          </div>
          <p className="text-xs text-primary font-medium mb-1">{story?.title || "Story Update"}</p>
          <h2 className="font-heading text-lg font-semibold mb-1 hover:text-accent transition-colors">Ch. {chapter.chapter_number}: {chapter.title}</h2>
          {chapter.word_count && <p className="text-xs text-muted-foreground">{Number(chapter.word_count).toLocaleString()} words · ~{Math.ceil(Number(chapter.word_count) / 250)} min read</p>}
        </div>
      </Link>
    </motion.article>
  );
}
