import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { Search, BookOpen, FileText, Newspaper, MessageSquare, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

const iconMap = {
  story: { Icon: BookOpen, color: "text-primary", label: "Story" },
  chapter: { Icon: FileText, color: "text-primary", label: "Chapter" },
  blog: { Icon: Newspaper, color: "text-accent", label: "Blog Post" },
  comment: { Icon: MessageSquare, color: "text-primary", label: "Comment" },
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(query);

  const { data: stories = [] } = useQuery({
    queryKey: ["search-stories"],
    queryFn: () => base44.entities.Story.list(),
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["search-chapters"],
    queryFn: () => base44.entities.Chapter.filter({ published: true }),
  });
  const { data: posts = [] } = useQuery({
    queryKey: ["search-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, "-created_date", 50),
  });
  const { data: comments = [] } = useQuery({
    queryKey: ["search-comments"],
    queryFn: () => base44.entities.Comment.list("-created_date", 50),
  });

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const storyResults = stories
      .filter((s) => !s.hidden && (s.title?.toLowerCase().includes(q) || s.synopsis?.toLowerCase().includes(q) || s.tags?.some((t) => t.toLowerCase().includes(q))))
      .map((s) => ({ type: "story", title: s.title, subtitle: s.tags?.slice().sort().slice(0, 3).join(", "), link: `/story/${s.story_code}` }));

    const chapterResults = chapters
      .filter((c) => c.title?.toLowerCase().includes(q) || c.content?.toLowerCase().includes(q))
      .map((c) => {
        const story = stories.find((s) => s.id === c.story_id);
        return { type: "chapter", title: c.title, subtitle: story?.title, link: `/story/${c.story_id}/chapter/${c.id}` };
      });

    const postResults = posts
      .filter((p) => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q))
      .map((p) => ({ type: "blog", title: p.title, subtitle: p.excerpt, link: `/blog/${p.id}` }));

    const commentResults = comments
      .filter((c) => c.content?.toLowerCase().includes(q) || c.author_name?.toLowerCase().includes(q))
      .map((c) => {
        if (c.story_id) return { type: "comment", title: c.content?.slice(0, 100), subtitle: `by ${c.author_name}`, link: `/story/${c.story_id}` };
        if (c.chapter_id) return { type: "comment", title: c.content?.slice(0, 100), subtitle: `by ${c.author_name}`, link: "/stories" };
        return null;
      })
      .filter(Boolean);

    return [...storyResults, ...chapterResults, ...postResults, ...commentResults];
  }, [query, stories, chapters, posts, comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {});
  };

  return (
    <div className="pt-8 max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-6">Search the Archive</h1>

      <form onSubmit={handleSubmit} className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search stories, chapters, blog posts, comments..."
          className="h-12 pl-12 text-base"
          autoFocus
        />
      </form>

      {query.trim() ? (
        results.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-light text-lg">
            No results found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {results.map((r, i) => {
                const { Icon, color, label } = iconMap[r.type];
                return (
                  <Link
                    key={i}
                    to={r.link}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="mt-0.5 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
                      <p className="text-sm font-medium text-foreground/90 truncate group-hover:text-accent transition-colors">
                        {r.title}
                      </p>
                      {r.subtitle && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{r.subtitle}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )
      ) : (
        <p className="text-center text-muted-foreground py-12 font-light">
          Start typing above to search across stories, chapters, blog posts, and comments.
        </p>
      )}
    </div>
  );
}
