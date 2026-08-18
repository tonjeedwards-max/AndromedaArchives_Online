import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";
import HomeSidebar from "@/components/home/HomeSidebar";
import FeedPost from "@/components/blog/FeedPost";
import ChapterUpdateCard from "@/components/home/ChapterUpdateCard";
import { useRecommendations } from "@/hooks/useRecommendations";
import RecommendedStory from "@/components/home/RecommendedStory";
import ContinueReadingCard from "@/components/home/ContinueReadingCard";

const toArray = (value) => (Array.isArray(value) ? value : []);

export default function Home() {
  const { data: postsData } = useQuery({
    queryKey: ["home-blog-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, "-created_date", 20),
  });
  const posts = toArray(postsData);

  const { data: chaptersData } = useQuery({
    queryKey: ["home-chapters"],
    queryFn: () => base44.entities.Chapter.filter({ published: true }, "-created_date", 20),
  });
  const chapters = toArray(chaptersData);

  const { data: storiesData } = useQuery({
    queryKey: ["home-stories"],
    queryFn: () => base44.entities.Story.list(),
  });
  const stories = toArray(storiesData);

  const storyMap = useMemo(() => {
    const map = {};
    stories.forEach((s) => {
      if (s?.story_code) map[String(s.story_code)] = s;
    });
    return map;
  }, [stories]);

  const feed = useMemo(() => {
    const blogItems = posts
      .filter((p) => !p?.hidden)
      .map((p) => ({ type: "blog", date: p.publish_date || p.created_date, data: p }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const chapterItems = chapters
      .map((c) => ({
        type: "chapter",
        date: c.created_date,
        data: c,
        story: storyMap[String(c.story_id)] || null,
      }))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const merged = [];
    const a = [...blogItems];
    const b = [...chapterItems];
    let takeBlog = a[0] && b[0] ? new Date(a[0].date || 0) >= new Date(b[0].date || 0) : a.length > 0;

    while (a.length || b.length) {
      const list = takeBlog ? a : b;
      if (list.length) merged.push(list.shift());
      else if (takeBlog && b.length) merged.push(b.shift());
      else if (!takeBlog && a.length) merged.push(a.shift());
      takeBlog = !takeBlog;
    }

    return merged.slice(0, 8);
  }, [posts, chapters, storyMap]);

  const isLoading = postsData === undefined && chaptersData === undefined && storiesData === undefined;
  const recommendation = useRecommendations(stories);

  const feedItems = feed.map((item, i) =>
    item.type === "blog" ? (
      <FeedPost key={`blog-${item.data.id}`} post={item.data} index={i} showReadMore={true} />
    ) : (
      <ChapterUpdateCard key={`chapter-${item.data.id}`} chapter={item.data} story={item.story} index={i} />
    )
  );

  if (recommendation && feedItems.length >= 2) {
    feedItems.splice(2, 0, <RecommendedStory key="recommendation" story={recommendation} index={2} />);
  }

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
            <div className="flex flex-col gap-6">{feedItems}</div>
          )}
        </main>
      </div>
    </div>
  );
}
