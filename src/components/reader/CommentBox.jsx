import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import CommentItem from "@/components/comments/CommentItem";

export default function CommentBox({ chapterId, nightMode = false }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", chapterId],
    queryFn: () => base44.entities.Comment.filter({ chapter_id: chapterId }, "created_date"),
    initialData: [],
  });

  const { mutate: postComment, isPending } = useMutation({
    mutationFn: (data) =>
      base44.entities.Comment.create({ chapter_id: chapterId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    postComment({ author_name: name.trim(), content: content.trim() });
    setContent("");
  };

  return (
    <section className="mt-16 pt-10 border-t border-border/30">
      <div className="flex items-center gap-2 mb-8">
        <MessageCircle className={`w-5 h-5 ${nightMode ? "text-purple-400" : "text-primary"}`} />
        <h3 className="font-heading text-xl font-semibold">
          Comments {comments.length > 0 && <span className="text-muted-foreground font-light text-base">({comments.length})</span>}
        </h3>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className={`rounded-xl p-5 mb-8 space-y-3 border ${nightMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50 border-border/40 text-sm"
          maxLength={60}
        />
        <Textarea
          placeholder="Share your thoughts on this chapter..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-background/50 border-border/40 text-sm min-h-[100px] resize-none"
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !name.trim() || !content.trim()}
            size="sm"
            className="bg-primary hover:bg-primary/80 gap-2"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground font-light py-8 text-sm">
          No comments yet. Be the first to leave a thought among the stars ✨
        </p>
      ) : (
        <div className="space-y-4">
          {comments.filter((c) => !c.parent_comment_id).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
              onReply={postComment}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}
