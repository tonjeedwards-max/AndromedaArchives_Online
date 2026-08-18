import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ChapterUpdateCard({ chapter, story, index }) {
  if (!chapter) return null;

  const storyCode = story?.story_code || chapter.story_id;
  const chapterNumber = Number(chapter.chapter_number);
  const chapterPath = Number.isInteger(chapterNumber)
    ? `/story/${storyCode}/chapter/${chapterNumber}`
    : `/story/${storyCode}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
    >
      <Link to={chapterPath} className="flex flex-col sm:flex-row">
        {story?.cover_image && (
          <div className="sm:w-32 shrink-0 overflow-hidden bg-muted/30">
            <img src={story.cover_image} alt={story.title} className="w-full h-32 sm:h-full object-cover" />
          </div>
        )}

        <div className="flex-1 p-5 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">
              <BookOpen className="w-2.5 h-2.5 mr-1" />
              New Chapter
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {chapter.created_date ? format(new Date(chapter.created_date), "MMM d, yyyy") : "Recent"}
            </span>
          </div>
          <p className="text-xs text-primary font-medium mb-1">{story?.title || "Story Update"}</p>
          <h2 className="font-heading text-lg font-semibold mb-1 hover:text-accent transition-colors">
            Ch. {chapter.chapter_number}: {chapter.title}
          </h2>
          {chapter.word_count && (
            <p className="text-xs text-muted-foreground">
              {chapter.word_count.toLocaleString()} words · ~{Math.ceil(chapter.word_count / 250)} min read
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
