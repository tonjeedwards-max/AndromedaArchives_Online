import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import HomeSidebar from "@/components/home/HomeSidebar";
import FeedPost from "@/components/blog/FeedPost";
import { requireSupabase } from "@/api/supabaseClient";

const POSTS_PER_PAGE = 5;

export default function Blog() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts-all"],
    queryFn: async () => {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from("blogs")
        .select("blog_id,title,excerpt,content,tags,published,published_date,published_at,created_at,updated_at")
        .eq("published", true)
        .order("published_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map((post) => ({
        ...post,
        id: String(post.blog_id),
        blog_id: String(post.blog_id),
        publish_date: post.published_date || post.published_at,
        created_date: post.created_at,
        updated_date: post.updated_at,
        tags: Array.isArray(post.tags) ? post.tags : [],
      }));
    },
    initialData: [],
  });

  const sortedPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.publish_date || b.created_date) - new Date(a.publish_date || a.created_date)
    );
  }, [posts]);

  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
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

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-accent/60" />
              <Sparkles className="w-4 h-4 text-accent" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-accent/60" />
            </div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">The Archive Journal</h2>
            <p className="text-sm text-muted-foreground font-light mt-1">
              updates, reflections, and musings from the author's desk
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-light">No posts yet. The cosmos is still writing...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6">
                {paginatedPosts.map((post, i) => (
                  <FeedPost key={post.id} post={post} index={i} showReadMore={true} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Newer
                  </button>
                  <span className="text-sm text-muted-foreground font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Older <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
