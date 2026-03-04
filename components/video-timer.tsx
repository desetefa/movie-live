"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_TIMER_SECONDS = 4 * 60 * 60; // 4 hours

interface VideoTimerProps {
  runtimeSeconds?: number;
  onTimeChange?: (seconds: number) => void;
  defaultPosition?: number;
}

export function VideoTimer({
  runtimeSeconds = MAX_TIMER_SECONDS,
  onTimeChange,
  defaultPosition = 0,
}: VideoTimerProps) {
  const maxSeconds = Math.min(runtimeSeconds || MAX_TIMER_SECONDS, MAX_TIMER_SECONDS);
  const [currentTime, setCurrentTime] = useState(defaultPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    onTimeChange?.(defaultPosition);
  }, [defaultPosition, onTimeChange]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = Math.min(prev + 1, maxSeconds);
          if (next >= maxSeconds) stopInterval();
          onTimeChange?.(next);
          return next;
        });
      }, 1000);
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [isPlaying, maxSeconds, onTimeChange, stopInterval]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const seek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, maxSeconds));
      setCurrentTime(clamped);
      onTimeChange?.(clamped);
    },
    [maxSeconds, onTimeChange]
  );

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    toggle,
    seek,
  };
}

export { MAX_TIMER_SECONDS };

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
