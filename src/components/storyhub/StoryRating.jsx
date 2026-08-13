import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

// Persist a unique anonymous token per browser
function getReaderToken() {
  let token = localStorage.getItem("andromeda_reader_token");
  if (!token) {
    token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("andromeda_reader_token", token);
  }
  return token;
}

export default function StoryRating({ storyId }) {
  const qc = useQueryClient();
  const readerToken = getReaderToken();
  const [hover, setHover] = useState(0);

  const { data: allRatings = [] } = useQuery({
    queryKey: ["ratings", storyId],
    queryFn: () => base44.entities.StoryRating.filter({ story_id: storyId }),
  });

  const myRating = allRatings.find((r) => r.reader_token === readerToken);
  const avgRating = allRatings.length
    ? (allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length).toFixed(1)
    : null;

  const { mutate: submitRating } = useMutation({
    mutationFn: async (stars) => {
      if (myRating) {
        await base44.entities.StoryRating.update(myRating.id, { rating: stars });
      } else {
        await base44.entities.StoryRating.create({ story_id: storyId, reader_token: readerToken, rating: stars });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ratings", storyId] }),
  });

  const display = hover || myRating?.rating || 0;

  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submitRating(star)}
            className="p-0.5 transition-colors"
            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= display
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/40"
              }`}
            />
          </motion.button>
        ))}
      </div>

      {avgRating ? (
        <span className="text-sm text-muted-foreground">
          <span className="text-accent font-semibold">{avgRating}</span>
          <span className="text-xs ml-1">({allRatings.length} rating{allRatings.length !== 1 ? "s" : ""})</span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground italic">Be the first to rate</span>
      )}

      {myRating && (
        <span className="text-[10px] text-primary/60 italic">your rating</span>
      )}
    </div>
  );
}
