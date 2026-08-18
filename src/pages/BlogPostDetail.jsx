import React from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
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

export default function BlogPostDetail() {
  const { blogId } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", blogId],
    queryFn: () => base44.entities.BlogPost.get(blogId),
    enabled: !!blogId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <p className="text-muted-foreground font-light">Blog post not found.</p>
        <Link to="/blog" className="text-primary hover:text-accent transition-colors text-sm mt-4 inline-block">
          ← Back to all blogs
        </Link>
      </div>
    );
  }

  const displayDate = post.publish_date || post.created_date;

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Return to All Blogs
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm"
      >
        <div className="px-6 sm:px-8 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground font-light">The Andromeda Archive</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
            {post.title}
          </h1>
          {displayDate && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(displayDate), "MMMM d, yyyy")}
            </div>
          )}
        </div>

        {post.cover_image && (
          <div className="mt-4 overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full max-h-96 object-cover" />
          </div>
        )}

        <div className="px-6 sm:px-8 py-6 reader-content">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              p: ({ children }) => <p className="mb-5 leading-[1.9] text-foreground/85">{children}</p>,
              h1: ({ children }) => <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">{children}</h2>,
              h2: ({ children }) => <h2 className="font-heading text-xl font-semibold mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="font-heading text-lg font-semibold mt-6 mb-3">{children}</h3>,
              em: ({ children }) => <em className="italic opacity-70">{children}</em>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-primary underline underline-offset-2 hover:text-accent transition-colors"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => <ul className="list-disc pl-6 mb-5 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-5 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-[1.8] text-foreground/85">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/40 pl-5 my-6 italic opacity-70">{children}</blockquote>
              ),
              hr: () => (
                <div className="flex items-center justify-center gap-2 my-8">
                  <div className="h-px w-12 bg-primary/20" />
                  <Sparkles className="w-3 h-3 text-accent/50" />
                  <div className="h-px w-12 bg-primary/20" />
                </div>
              ),
            }}
          >
            {post.content || ""}
          </ReactMarkdown>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="px-6 sm:px-8 py-5 border-t border-border/30">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-1 bg-muted/60 text-muted-foreground border-0 capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 sm:px-8">
          <BlogShare title={post.title} excerpt={post.excerpt} />
        </div>

        <div className="px-6 sm:px-8 pb-8">
          <BlogCommentBox blogId={blogId} />
        </div>
      </motion.article>
    </div>
  );
}
