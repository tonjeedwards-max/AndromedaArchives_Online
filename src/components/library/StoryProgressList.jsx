import React from "react";
import { supabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function StoryProgressList({ history }) {
  const storyIds = [...new Set(Object.values(history).map((h) => h.storyId).filter(Boolean))];

  const { data: stories = [] } = useQuery({
    queryKey: ["library-progress-stories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stories").select("id, story_code, title, cover_image").eq("hidden", false);
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: allChapters = [] } = useQuery({
    queryKey: ["library-progress-chapters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("id, story_id, chapter_number, published").eq("published", true);
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
  });

  const chaptersByStory = {};
  allChapters.forEach((chapter) => {
    if (!chaptersByStory[chapter.story_id]) chaptersByStory[chapter.story_id] = [];
    chaptersByStory[chapter.story_id].push(chapter);
  });

  const readingStories = stories.filter((story) => storyIds.includes(story.story_code));

  const lastReadByStory = {};
  Object.values(history).forEach((entry) => {
    if (!entry.storyId || !entry.chapterNumber) return;
    const current = lastReadByStory[entry.storyId];
    if (!current || new Date(entry.readAt) > new Date(current.readAt)) {
      lastReadByStory[entry.storyId] = entry;
    }
  });

  if (readingStories.length === 0) {
    return <p className="text-center text-muted-foreground py-12 font-light">You haven't started reading any stories yet. Explore the catalogue!</p>;
  }

  return (
    <div className="space-y-3">
      {readingStories.map((story, i) => {
        const storyChapters = chaptersByStory[story.id] || [];
        const totalChapters = storyChapters.length;
        const readCount = new Set(
          Object.values(history)
            .filter((entry) => entry.storyId === story.story_code && Number.isInteger(Number(entry.chapterNumber)))
            .map((entry) => Number(entry.chapterNumber))
        ).size;
        const progress = totalChapters > 0 ? Math.min(100, (readCount / totalChapters) * 100) : 0;
        const lastRead = lastReadByStory[story.story_code];
        const destination = lastRead
          ? `/story/${story.story_code}/chapter/${lastRead.chapterNumber}`
          : `/story/${story.story_code}`;

        return (
          <motion.div key={story.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={destination} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 transition-all group">
              {story.cover_image ? (
                <img src={story.cover_image} alt={story.title} width="40" height="64" loading="lazy" className="w-10 h-14 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-primary/50" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{story.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden" aria-label={`${readCount} of ${totalChapters} chapters read`}>
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{readCount}/{totalChapters}</span>
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
