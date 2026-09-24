import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";
import MiniPlayer from "./MiniPlayer";

const PodcastPlayerContext = createContext(null);

export function PodcastPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const shouldAutoPlayRef = useRef(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    audio.src = currentEpisode.audio_url;
    audio.load();
    if (shouldAutoPlayRef.current) {
      audio.play().catch(() => {});
      shouldAutoPlayRef.current = false;
    }
  }, [currentEpisode]);

  const play = useCallback((episode) => {
    if (!episode) return;
    if (currentEpisode?.id === episode.id) {
      if (audioRef.current?.paused) audioRef.current.play().catch(() => {});
    } else {
      shouldAutoPlayRef.current = true;
      setCurrentEpisode(episode);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentEpisode]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [currentEpisode]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrentEpisode(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <PodcastPlayerContext.Provider value={{ currentEpisode, isPlaying, currentTime, duration, play, togglePlay, seek, stop }}>
      {children}
      <audio ref={audioRef} preload="metadata" />
      <MiniPlayer />
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer() {
  return useContext(PodcastPlayerContext);
}
