import React, { useMemo } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";
import HomeSidebar from "@/components/home/HomeSidebar";
import FeedPost from "@/components/blog/FeedPost";
import ChapterUpdateCard from "@/components/home/ChapterUpdateCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import RecommendedStory from "@/components/home/RecommendedStory";
import ContinueReadingCard from "@/components/home/ContinueReadingCard";

const asArray = (value) => (Array.isArray(value) ? value : []);

export default function Home() {
  const { data: postsData } = useQuery({
    queryKey: ["home-blog-posts"],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("blogs").select("*").eq("published", true).order("published_date", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });
  const posts = asArray(postsData);

  const { data: chaptersData } = useQuery({
    queryKey: ["home-chapters"],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("chapters").select("*").eq("published", true).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });
  const chapters = asArray(chaptersData);

  const { data: storiesData } = useQuery({
    queryKey: ["home-stories"],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("stories").select("*").eq("hidden", false).order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
  const stories = asArray(storiesData);

  const storyMap = useMemo(() => {
    const map = {};
    stories.forEach((story) => {
      if (story?.id != null) map[String(story.id)] = story;
    });
    return map;
  }, [stories]);

  const feed = useMemo(() => {
    const blogItems = posts.map((p) => ({ type: "blog", date: p.published_at || p.published_date || p.created_at, data: p }));
    const chapterItems = chapters.map((c) => ({
      type: "chapter",
      date: c.created_at,
      data: c,
      story: storyMap[String(c.story_id)] || null,
    }));

    return [...blogItems, ...chapterItems]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [posts, chapters, storyMap]);

  const isLoading = postsData === undefined && chaptersData === undefined && storiesData === undefined;
  const recommendation = useRecommendations(stories);

  const renderFeedItem = (item, index) =>
    item.type === "blog" ? (
      <FeedPost key={`blog-${item.data.blog_id}`} post={item.data} index={index} showReadMore={true} />
    ) : (
      <ChapterUpdateCard key={`chapter-${item.data.id}`} chapter={item.data} story={item.story} index={index} />
    );

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <div className="flex gap-6 lg:gap-10">
        <HomeSidebar />
        <main className="flex-1 min-w-0">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-accent/40 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground font-light">welcome to the archives, buddy.</p>
          </div>

          <ContinueReadingCard />

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent/60" />
              <Sparkles className="w-4 h-4 text-accent" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent/60" />
            </div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Latest from the Archive</h2>
            <p className="text-sm text-muted-foreground font-light mt-1">fresh posts & chapters, hot off the cosmic press</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : feed.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-light">No posts yet. The cosmos is still writing...</p>
              <Link to="/stories" className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-accent transition-colors">
                <BookOpen className="w-4 h-4" /> Browse stories instead
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {feed.map((item, index) => (
                <React.Fragment key={`feed-slot-${index}`}>
                  {renderFeedItem(item, index)}
                  {index === 0 && recommendation && (
                    <RecommendedStory story={recommendation} index={index} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
