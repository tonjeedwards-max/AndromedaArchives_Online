import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getStatusInfo } from "@/lib/storyStatus";

export default function StoryCoverCard({ story, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/story/${story.story_code}`}
        className="group block"
      >
        {/* Book cover container */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg shadow-primary/10 ring-1 ring-border/40 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:ring-primary/40 group-hover:-translate-y-1">
          {/* Cover image */}
          <img
            src={story.cover_image || "/placeholder.png"}
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover overlay with title */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
            <h3 className="font-heading text-lg font-semibold leading-tight text-foreground">
              {story.title}
            </h3>
            {story.tags && story.tags.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 font-light capitalize">
                {story.tags.slice().sort((a, b) => a.localeCompare(b)).slice(0, 3).join(", ")}
              </p>
            )}
          </div>

          {/* Status badge */}
          {story.status && (
            <div className="absolute top-3 right-3">
              <Badge className={`text-[10px] border ${getStatusInfo(story.status).badgeClass}`}>
                {getStatusInfo(story.status).label}
              </Badge>
            </div>
          )}

          {/* Spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent/60 via-primary/40 to-accent/60" />
        </div>

        {/* Title below */}
        <p className="mt-3 text-sm font-medium text-center text-foreground/80 group-hover:text-accent transition-colors duration-300 line-clamp-1">
          {story.title}
        </p>
        {story.tags && story.tags.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-1 capitalize">
            {story.tags.slice().sort((a, b) => a.localeCompare(b)).slice(0, 3).join(" · ")}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
