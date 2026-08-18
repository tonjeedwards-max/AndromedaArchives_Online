import React, { useState } from "react";
import { requireSupabase } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { getReaderToken, getSavedUsername, claimReaderUsername } from "@/lib/readerIdentity";

export default function StoryRating({ storyId }) {
  const qc = useQueryClient();
  const readerToken = getReaderToken();
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(getSavedUsername());
  const [nameError, setNameError] = useState("");
  const { data: allRatings = [] } = useQuery({
    queryKey: ["ratings", storyId],
    queryFn: async () => {
      const { data, error } = await requireSupabase().from("story_ratings").select("*").eq("story_id", storyId);
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(storyId),
  });
  const myRating = allRatings.find((r) => r.reader_token === readerToken);
  const avgRating = allRatings.length ? (allRatings.reduce((s, r) => s + Number(r.rating), 0) / allRatings.length).toFixed(1) : null;
  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async (stars) => {
      if (!name.trim()) throw new Error("username_required");
      const identity = await claimReaderUsername(name);
      if (myRating) {
        const { error } = await requireSupabase().from("story_ratings").update({ rating: stars, username: identity.username, updated_at: new Date().toISOString() }).eq("id", myRating.id).eq("reader_token", readerToken);
        if (error) throw error;
      } else {
        const { error } = await requireSupabase().from("story_ratings").insert({ story_id: storyId, reader_token: readerToken, username: identity.username, rating: stars });
        if (error) throw error;
      }
    },
    onSuccess: () => { setNameError(""); qc.invalidateQueries({ queryKey: ["ratings", storyId] }); },
    onError: (error) => setNameError(error.message === "username_taken" ? "That username is already taken. Please choose another." : "Please enter a username to rate this story."),
  });
  const display = hover || Number(myRating?.rating) || 0;
  return <div className="mt-3 space-y-2">
    <div className="flex items-center gap-3"><div className="flex items-center gap-0.5">{[1,2,3,4,5].map((star) => <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => submitRating(star)} disabled={isPending} className="p-0.5 transition-colors" title={`Rate ${star} star${star > 1 ? "s" : ""}`}><Star className={`w-5 h-5 transition-colors ${star <= display ? "fill-accent text-accent" : "text-muted-foreground/40"}`} /></motion.button>)}</div>{avgRating ? <span className="text-sm text-muted-foreground"><span className="text-accent font-semibold">{avgRating}</span><span className="text-xs ml-1">({allRatings.length} rating{allRatings.length !== 1 ? "s" : ""})</span></span> : <span className="text-xs text-muted-foreground italic">Be the first to rate</span>}</div>
    {!myRating && <div className="flex gap-2 items-center"><input value={name} onChange={(e) => { setName(e.target.value); setNameError(""); }} placeholder="Username to rate" maxLength={40} className="h-8 rounded-md border border-border/40 bg-background/50 px-2 text-xs" />{nameError && <span className="text-xs text-destructive">{nameError}</span>}</div>}
    {myRating && <span className="text-[10px] text-primary/60 italic">your rating</span>}
  </div>;
}
