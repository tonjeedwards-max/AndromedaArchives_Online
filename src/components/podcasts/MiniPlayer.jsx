import React from "react";
import { Play, Pause, X, Podcast as PodcastIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { usePodcastPlayer } from "./PodcastPlayerContext";

function fmt(time) {
  if (!time || !isFinite(time)) return "0:00";
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const { currentEpisode, isPlaying, currentTime, duration, togglePlay, seek, stop } = usePodcastPlayer();
  const location = useLocation();

  if (!currentEpisode || /^\/podcasts\/[\w-]+$/.test(location.pathname)) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-40 px-3 pb-2 lg:pb-3">
      <div className="max-w-2xl mx-auto bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden">
        <div
          className="h-1 bg-border/40 cursor-pointer"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * duration);
          }}
        >
          <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>

        <div className="px-3 py-2 flex items-center gap-3">
          {currentEpisode.cover_image ? (
            <img src={currentEpisode.cover_image} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
              <PodcastIcon className="w-5 h-5 text-accent" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentEpisode.title}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{fmt(currentTime)} <span className="opacity-50">/</span> {fmt(duration)}</p>
          </div>

          <button type="button" onClick={togglePlay} className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button type="button" onClick={stop} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label="Close player">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
