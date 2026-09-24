import React from "react";
import { Play, Pause, Podcast as PodcastIcon } from "lucide-react";
import { usePodcastPlayer } from "./PodcastPlayerContext";

function fmt(time) {
  if (!time || !isFinite(time)) return "0:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({ episode }) {
  const { currentEpisode, isPlaying, currentTime, duration, play, togglePlay, seek } = usePodcastPlayer();
  const isActive = currentEpisode?.id === episode.id;
  const shownTime = isActive ? currentTime : 0;
  const shownDuration = isActive ? duration : 0;
  const progress = shownDuration > 0 ? (shownTime / shownDuration) * 100 : 0;
  const showPause = isActive && isPlaying;

  return (
    <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
          {episode.cover_image ? (
            <img src={episode.cover_image} alt={episode.title} className="w-full h-full rounded-xl object-cover shadow-lg" />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-lg">
              <PodcastIcon className="w-16 h-16 text-accent" />
            </div>
          )}
          <button
            type="button"
            onClick={() => (isActive ? togglePlay() : play(episode))}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 rounded-xl transition-colors"
            aria-label={showPause ? "Pause" : "Play"}
          >
            <span className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl backdrop-blur-sm">
              {showPause ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </span>
          </button>
        </div>

        <div className="text-center">
          {episode.episode_number != null && <p className="text-xs text-accent uppercase tracking-wider font-medium mb-1">Episode {episode.episode_number}</p>}
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold">{episode.title}</h1>
        </div>

        <div className="w-full max-w-md">
          <div
            className="h-1.5 bg-border rounded-full overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (!isActive || !shownDuration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * shownDuration);
            }}
          >
            <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground tabular-nums">
            <span>{fmt(shownTime)}</span>
            <span>{isActive ? fmt(shownDuration) : episode.duration || "—"}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (isActive ? togglePlay() : play(episode))}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
        >
          {showPause ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span className="font-medium">{showPause ? "Pause" : "Play episode"}</span>
        </button>
      </div>
    </div>
  );
}
