import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusInfo } from "@/lib/storyStatus";

export default function RecommendedStory({ story, index }) {
  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm border border-primary/30 rounded-xl overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-2 px-5 pt-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 border border-accent/40 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-medium text-accent">Recommended for You</p>
          <p className="text-xs text-muted-foreground">Based on your reading history</p>
        </div>
      </div>

      <Link to={`/story/${story.story_code}`} className="flex gap-4 p-5 hover:bg-primary/5 transition-colors group">
        {story.cover_image && (
          <div className="w-16 sm:w-20 shrink-0">
            <img src={story.cover_image} alt={story.title} className="w-full aspect-[2/3] object-cover rounded-lg shadow-md" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-lg font-semibold group-hover:text-accent transition-colors">{story.title}</h2>
          {story.tags?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {story.tags.slice().sort().slice(0, 3).join(" · ")}
            </p>
          )}
          {story.synopsis && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{story.synopsis}</p>
          )}
          {story.status && (
            <Badge className={`text-[10px] mt-2 border ${getStatusInfo(story.status).badgeClass}`}>
              {getStatusInfo(story.status).label}
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
