import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function StoryProgressList({ history }) {
  const storyIds = [...new Set(Object.values(history).map((h) => h.storyId))];

  const { data: stories = [] } = useQuery({
    queryKey: ["all-stories"],
    queryFn: () => base44.entities.Story.list(),
  });

  const { data: allChapters = [] } = useQuery({
    queryKey: ["all-chapters-progress"],
    queryFn: () => base44.entities.Chapter.filter({ published: true }, "chapter_number"),
  });

  const chaptersByStory = {};
  allChapters.forEach((ch) => {
    if (!chaptersByStory[ch.story_id]) chaptersByStory[ch.story_id] = [];
    chaptersByStory[ch.story_id].push(ch);
  });

  const readingStories = stories.filter((s) => storyIds.includes(s.story_code));

  // Most recently read chapter per story — to resume where the reader left off
  const lastReadByStory = {};
  Object.values(history).forEach((h) => {
    if (!h.storyId || !h.chapterId) return;
    const cur = lastReadByStory[h.storyId];
    if (!cur || new Date(h.readAt) > new Date(cur.readAt)) lastReadByStory[h.storyId] = h;
  });

  if (readingStories.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 font-light">
        You haven't started reading any stories yet. Explore the catalogue!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {readingStories.map((story, i) => {
        const totalChapters = chaptersByStory[story.story_code]?.length || 0;
        const readChapterIds = Object.values(history)
          .filter((h) => h.storyId === story.story_code)
          .map((h) => h.chapterId);
        const readCount = new Set(readChapterIds).size;
        const progress = totalChapters > 0 ? (readCount / totalChapters) * 100 : 0;

        return (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={lastReadByStory[story.story_code] ? `/story/${story.story_code}/chapter/${lastReadByStory[story.story_code].chapterId}` : `/story/${story.story_code}`}
              className="flex items-center gap-4 px-4 py-3 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 transition-all group"
            >
              {story.cover_image ? (
                <img src={story.cover_image} alt={story.title} className="w-10 h-14 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{story.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {readCount}/{totalChapters}
                  </span>
                </div>
              </div>
              <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
