import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, CornerDownRight, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

export default function CommentItem({ comment, allComments, depth = 0, onReply, isPending }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const replies = allComments.filter((c) => c.parent_comment_id === comment.id);

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyName.trim() || !replyContent.trim()) return;
    onReply({ parent_comment_id: comment.id, author_name: replyName.trim(), content: replyContent.trim() });
    setReplyName("");
    setReplyContent("");
    setShowReplyForm(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-foreground/90">{comment.author_name}</span>
            <span className="text-[10px] text-muted-foreground">
              {comment.created_date ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true }) : "Just now"}
            </span>
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed break-words">{comment.content}</p>
          {depth < 2 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-2 transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              Reply
            </button>
          )}
        </div>
      </motion.div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-3 ml-11 space-y-2 rounded-lg p-3 border bg-muted/20 border-border/30">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Replying to {comment.author_name}</span>
            <button type="button" onClick={() => setShowReplyForm(false)}>
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <Input
            placeholder="Your name"
            value={replyName}
            onChange={(e) => setReplyName(e.target.value)}
            className="bg-background/50 text-sm h-8"
            maxLength={60}
          />
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="bg-background/50 text-sm min-h-[60px] resize-none"
            maxLength={2000}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !replyName.trim() || !replyContent.trim()} size="sm" className="h-8 gap-2">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Reply
            </Button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className={`mt-3 ${depth < 2 ? "ml-11 pl-4 border-l border-border/30" : ""} space-y-3`}>
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} allComments={allComments} depth={depth + 1} onReply={onReply} isPending={isPending} />
          ))}
        </div>
      )}
    </div>
  );
}
