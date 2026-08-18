import React, { useEffect, useState } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/comments/CommentItem";
import { claimReaderUsername, getReaderToken, getSavedUsername, saveUsername } from "@/lib/readerIdentity";

export default function StoryCommentBox({ storyId }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(getSavedUsername());
  const [content, setContent] = useState("");
  const [nameError, setNameError] = useState("");
  const [generalError, setGeneralError] = useState("");

  useEffect(() => { setName(getSavedUsername()); }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["story-comments", storyId],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("comments").select("*").eq("story_id", storyId).order("created_at", { ascending: true });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(storyId),
  });

  const { mutate: postComment, isPending } = useMutation({
    mutationFn: async ({ parent_comment_id = null, author_name, content: body }) => {
      const identity = await claimReaderUsername(author_name);
      const { error } = await requireSupabase().from("comments").insert({ story_id: storyId, parent_comment_id, author_name: identity.username, author_token: getReaderToken(), content: body });
      if (error) throw error;
    },
    onSuccess: () => { setContent(""); setNameError(""); setGeneralError(""); queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] }); },
    onError: (error) => { if (error.message === "username_taken") setNameError("That username is already taken. Please choose another."); else setGeneralError("Couldn't post your comment. Please try again."); },
  });

  const handleSubmit = (e) => { e.preventDefault(); if (!name.trim() || !content.trim()) return; postComment({ author_name: name.trim(), content: content.trim() }); };

  return <section>
    <div className="flex items-center gap-2 mb-6"><MessageCircle className="w-5 h-5 text-primary" /><h3 className="font-heading text-xl font-semibold">Comments {comments.length > 0 && <span className="text-muted-foreground font-light text-base">({comments.length})</span>}</h3></div>
    <form onSubmit={handleSubmit} className="rounded-xl p-5 mb-8 space-y-3 border bg-muted/30 border-border/40">
      <Input placeholder="Username" value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} className="bg-background/50 border-border/40 text-sm" maxLength={40} />
      {nameError && <p className="text-xs text-destructive">{nameError}</p>}
      <Textarea placeholder="Share your thoughts on this story..." value={content} onChange={(e) => setContent(e.target.value)} className="bg-background/50 border-border/40 text-sm min-h-[100px] resize-none" maxLength={2000} />
      {generalError && <p className="text-xs text-destructive">{generalError}</p>}
      <div className="flex justify-end"><Button type="submit" disabled={isPending || !name.trim() || !content.trim()} size="sm" className="bg-primary hover:bg-primary/80 gap-2">{isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}Post Comment</Button></div>
    </form>
    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : comments.length === 0 ? <p className="text-center text-muted-foreground font-light py-8 text-sm">No comments yet. Be the first to share what you think! ✨</p> : <div className="space-y-4">{comments.filter((c) => !c.parent_comment_id).map((comment) => <CommentItem key={comment.id} comment={comment} allComments={comments} onReply={postComment} isPending={isPending} />)}</div>}
  </section>;
}
