import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeft, Calendar, Loader2, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import BlogShare from "@/components/blog/BlogShare";
import BlogCommentBox from "@/components/blog/BlogCommentBox";
import { requireSupabase } from "@/api/supabaseClient";

export default function BlogPostDetail() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", blogId],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("blogs").select("blog_id,title,excerpt,content,tags,published,published_date,published_at,created_at,updated_at").eq("blog_id", blogId).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!blogId,
  });

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (error || !post) return <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center"><p className="text-muted-foreground font-light">Blog post not found.</p><Link to="/blog" className="text-primary hover:text-accent transition-colors text-sm mt-4 inline-block">← Back to all blogs</Link></div>;

  const displayDate = post.published_date || post.published_at || post.created_at;
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
    <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Return to All Blogs</Link>
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 sm:px-8 pt-6 pb-2"><div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-accent" /><span className="text-xs text-muted-foreground font-light">The Andromeda Archive</span></div><h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">{post.title}</h1>{displayDate && <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{format(new Date(displayDate), "MMMM d, yyyy")}</div>}</div>
      <div className="px-6 sm:px-8 py-6 reader-content"><ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]} components={{ p: ({ children }) => <p className="mb-5 leading-[1.9] text-foreground/85">{children}</p>, h1: ({ children }) => <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">{children}</h2>, h2: ({ children }) => <h2 className="font-heading text-xl font-semibold mt-8 mb-4">{children}</h2>, h3: ({ children }) => <h3 className="font-heading text-lg font-semibold mt-6 mb-3">{children}</h3>, em: ({ children }) => <em className="italic opacity-70">{children}</em>, strong: ({ children }) => <strong className="font-semibold">{children}</strong>, a: ({ href, children }) => <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} className="text-primary underline underline-offset-2 hover:text-accent transition-colors">{children}</a>, ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>, ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>, li: ({ children }) => <li className="leading-[1.8] text-foreground/85">{children}</li>, blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/40 pl-5 my-6 italic opacity-70">{children}</blockquote>, hr: () => <div className="flex items-center justify-center gap-2 my-8"><div className="h-px w-12 bg-primary/20" /><Sparkles className="w-3 h-3 text-accent/50" /><div className="h-px w-12 bg-primary/20" /></div> }}>{post.content || ""}</ReactMarkdown></div>
      {tags.length > 0 && <div className="px-6 sm:px-8 py-5 border-t border-border/30"><div className="flex items-center gap-2 mb-3"><Tag className="w-4 h-4 text-accent" /><span className="text-sm font-medium text-muted-foreground">Tags</span></div><div className="flex flex-wrap gap-2">{tags.map((tag) => <Badge asChild key={tag} variant="secondary" className="text-xs px-2.5 py-1 bg-muted/60 text-muted-foreground border-0 capitalize cursor-pointer hover:bg-accent/15 hover:text-accent"><Link to={`/blog?tag=${encodeURIComponent(String(tag).trim())}`}>#{tag}</Link></Badge>)}</div></div>}
      <div className="px-6 sm:px-8"><BlogShare title={post.title} excerpt={post.excerpt} /></div>
      <div className="px-6 sm:px-8 pb-8"><BlogCommentBox blogId={blogId} /></div>
    </motion.article>
  </div>;
}
