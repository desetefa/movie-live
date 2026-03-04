"use client";

import { useCallback, useRef, useState } from "react";
import { formatTime, MAX_TIMER_SECONDS } from "./video-timer";

interface TimelineSliderProps {
  currentTime: number;
  runtimeSeconds?: number;
  onSeek: (seconds: number) => void;
  postMarkers?: number[];
  maxMarkers?: number;
  savedPosition?: number;
  onJumpToSaved?: () => void;
  orientation?: "horizontal" | "vertical";
}

export function TimelineSlider({
  currentTime,
  runtimeSeconds = MAX_TIMER_SECONDS,
  onSeek,
  postMarkers = [],
  maxMarkers = 50,
  savedPosition,
  onJumpToSaved,
  orientation = "vertical",
}: TimelineSliderProps) {
  const maxSec = Math.min(runtimeSeconds, MAX_TIMER_SECONDS);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [dragPct, setDragPct] = useState<number | null>(null);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = parseFloat(e.target.value);
      const pct = orientation === "vertical" ? 100 - raw : raw;
      const sec = Math.round((pct / 100) * maxSec);
      onSeek(sec);
    },
    [maxSec, onSeek, orientation]
  );

  const pct = maxSec > 0 ? (currentTime / maxSec) * 100 : 0;
  const allMarkers = postMarkers.slice(0, maxMarkers);

  const showJumpBack =
    savedPosition !== undefined &&
    onJumpToSaved &&
    Math.abs(currentTime - savedPosition) > 2;

  const updateFromClientY = useCallback(
    (clientY: number, round = true) => {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (!track || maxSec <= 0) return;
      const rect = track.getBoundingClientRect();
      const y = clientY - rect.top;
      const pct = Math.max(0, Math.min(1, y / rect.height));
      const sec = round ? Math.round(pct * maxSec) : pct * maxSec;
      onSeek(sec);
      if (thumb) {
        thumb.style.top = `${pct * 100}%`;
      }
      setDragPct(pct * 100);
    },
    [maxSec, onSeek]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      updateFromClientY(e.clientY, true);

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        ev.preventDefault();
        updateFromClientY(ev.clientY, false);
      };
      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        ev.preventDefault();
        isDraggingRef.current = false;
        setDragPct(null);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove, { passive: false });
      document.addEventListener("pointerup", onUp, { passive: false });
    },
    [maxSec, onSeek, updateFromClientY]
  );

  if (orientation === "vertical") {
    const thumbTopPct = dragPct ?? pct;

    return (
      <div
        className="relative flex h-full min-h-0 w-12 shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900/50"
      >
        <div className="absolute bottom-12 left-0 right-0 top-0 flex flex-col pt-12 pb-8">
          <div
            ref={trackRef}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={maxSec}
            aria-valuenow={Math.round(currentTime)}
            aria-label="Timeline position"
            tabIndex={0}
            className="relative flex-1 min-h-[100px] flex flex-col items-center cursor-pointer select-none touch-none"
            onPointerDown={handlePointerDown}
          >
            <div className="absolute inset-0 flex justify-center">
              <div className="h-full w-1.5 shrink-0 rounded-full bg-zinc-800" />
            </div>
            <div
              ref={thumbRef}
              className="pointer-events-none absolute left-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 shadow-md"
              style={{ top: `${thumbTopPct}%` }}
            />
            {allMarkers.length > 0 && maxSec > 0 && (
              <div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                aria-hidden
              >
                {allMarkers.map((markerSec, i) => {
                  const topPct = (markerSec / maxSec) * 100;
                  const isRevealed = markerSec <= currentTime;
                  return (
                    <div
                      key={`marker-${i}`}
                      className={`absolute left-1/2 h-px w-4 -translate-x-1/2 ${isRevealed ? "bg-amber-500/80" : "bg-amber-500/40"}`}
                      style={{ top: topPct + "%" }}
                      title={formatTime(markerSec)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="relative z-10 shrink-0 border-t border-zinc-800 px-1 py-1.5">
          {showJumpBack ? (
            <button
              type="button"
              onClick={onJumpToSaved}
              className="w-full rounded px-0.5 py-0.5 text-center text-xs text-amber-500 hover:bg-amber-500/20"
              title={`Back to ${formatTime(savedPosition)}`}
            >
              {formatTime(currentTime)}
            </button>
          ) : (
            <span className="block text-center text-xs text-zinc-400 tabular-nums">
              {formatTime(currentTime)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      <div className="relative flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={pct}
          onChange={handleInput}
          className="h-2 w-full flex-1 appearance-none rounded-full bg-zinc-800 accent-amber-500"
        />
        {showJumpBack ? (
          <button
            type="button"
            onClick={onJumpToSaved}
            className="min-w-16 rounded px-2 py-0.5 text-right text-sm text-amber-500 hover:bg-amber-500/20 hover:underline"
            title={`Back to ${formatTime(savedPosition)}`}
          >
            {formatTime(currentTime)}
          </button>
        ) : (
          <span className="min-w-16 text-right text-sm text-zinc-400 tabular-nums">
            {formatTime(currentTime)}
          </span>
        )}
      </div>
      {allMarkers.length > 0 && (
        <div className="relative h-2 w-full">
          {allMarkers.map((markerSec: number, i: number) => {
            const left = maxSec > 0 ? (markerSec / maxSec) * 100 : 0;
            const isRevealed = markerSec <= currentTime;
            return (
              <div
                key={`marker-${i}`}
                className={`absolute top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 ${isRevealed ? "bg-amber-500/80" : "bg-amber-500/40"}`}
                style={{ left: `${left}%` }}
                title={formatTime(markerSec)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
