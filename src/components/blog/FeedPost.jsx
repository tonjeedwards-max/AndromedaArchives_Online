import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function FeedPost({ post, index, showReadMore = true, onTagClick }) {
  const blogId = post?.blog_id ?? post?.id;
  const blogPath = blogId != null ? `/blog/${blogId}` : "/blog";
  const displayDate = post?.published_date || post?.publish_date || post?.published_at || post?.created_at || post?.created_date;
  const tags = Array.isArray(post?.tags) ? post.tags : [];

  return (
    <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.08 }} className="bg-card/70 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-3 px-5 pt-4"><div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-border/40 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4 text-accent" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground/80">The Andromeda Archive</p><span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{displayDate ? format(new Date(displayDate), "MMM d, yyyy") : "Recent"}</span></div></div>
      {post.cover_image && <div className="mt-3 overflow-hidden"><img src={post.cover_image} alt={post.title} className="w-full max-h-96 object-cover" /></div>}
      <div className="px-5 py-4">
        <Link to={blogPath}><h2 className="font-heading text-xl font-semibold mb-2 hover:text-accent transition-colors">{post.title}</h2></Link>
        {post.excerpt && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{post.excerpt}</p>}
        {tags.length > 0 && <div className="flex items-center gap-2 mt-3 flex-wrap"><Tag className="w-3.5 h-3.5 text-accent" />{tags.slice(0, 8).map((tag) => onTagClick ? <button type="button" key={tag} onClick={() => onTagClick(tag)} className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-[10px] text-muted-foreground capitalize hover:bg-accent/15 hover:text-accent transition-colors">#{tag}</button> : <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 bg-muted/60 text-muted-foreground border-0">{tag}</Badge>)}</div>}
        {showReadMore && <Link to={blogPath} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors mt-4">Read more<ArrowRight className="w-3.5 h-3.5" /></Link>}
      </div>
    </motion.article>
  );
}
