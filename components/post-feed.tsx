"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostList, PIXELS_PER_SECOND } from "./post-list";
import type { Post } from "./post-item";

interface PostFeedProps {
  posts: Post[];
  currentTime: number;
  timerTime: number;
  runtimeSeconds?: number;
  isPaused: boolean;
  onTogglePlay: () => void;
  onSeek?: (seconds: number) => void;
  onPost: (content: string, timecodeSeconds: number) => Promise<void>;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  onCommentAdded?: (postId: string) => void;
  isAuthenticated: boolean;
}

export function PostFeed({
  posts,
  currentTime,
  timerTime,
  runtimeSeconds,
  isPaused,
  onTogglePlay,
  onSeek,
  onPost,
  onLike,
  onUnlike,
  onCommentAdded,
  isAuthenticated,
}: PostFeedProps) {
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const seekCameFromScrollRef = useRef(false);
  const [isLingering, setIsLingering] = useState(true);
  const lingerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reportScrollActivity = useCallback(() => {
    setIsLingering(false);
    if (lingerTimeoutRef.current) clearTimeout(lingerTimeoutRef.current);
    lingerTimeoutRef.current = setTimeout(() => {
      lingerTimeoutRef.current = null;
      setIsLingering(true);
    }, 1500);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    const content = draft.slice(0, 280);
    const timecodeSeconds = Math.floor(timerTime);
    setPosting(true);
    setError(null);
    try {
      await onPost(content, timecodeSeconds);
      setDraft("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to post. Please try again.";
      setError(msg);
    } finally {
      setPosting(false);
    }
  };

  const targetScrollTop = timerTime * PIXELS_PER_SECOND;

  useEffect(() => {
    if (seekCameFromScrollRef.current) {
      seekCameFromScrollRef.current = false;
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    reportScrollActivity();
    const maxScroll = el.scrollHeight - el.clientHeight;
    isProgrammaticScrollRef.current = true;
    el.scrollTop = Math.min(maxScroll, Math.max(0, targetScrollTop));
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
    });
  }, [timerTime, targetScrollTop, reportScrollActivity]);

  useEffect(() => {
    return () => {
      if (lingerTimeoutRef.current) clearTimeout(lingerTimeoutRef.current);
    };
  }, []);

  const scrollRafRef = useRef<number | null>(null);
  const handleScroll = () => {
    reportScrollActivity();
    if (isProgrammaticScrollRef.current || !onSeek) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = scrollRef.current;
      if (!el) return;
      seekCameFromScrollRef.current = true;
      const rawTime = el.scrollTop / PIXELS_PER_SECOND;
      const clamped =
        runtimeSeconds != null
          ? Math.min(runtimeSeconds, Math.max(0, rawTime))
          : Math.max(0, rawTime);
      onSeek(Math.round(clamped));
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      >
        <PostList
          posts={posts}
          currentTime={timerTime}
          runtimeSeconds={runtimeSeconds}
          isPlaying={!isPaused}
          blurFutureWhileActive={!isLingering}
          onLike={onLike}
          onUnlike={onUnlike}
          onCommentAdded={onCommentAdded}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="shrink-0 border-t border-zinc-800 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 280))}
            placeholder="Post at this moment..."
            className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            disabled={posting}
            maxLength={280}
            aria-label="Post content"
          />
          <button
            type="button"
            onClick={onTogglePlay}
            className="shrink-0 rounded-full border border-zinc-600 bg-zinc-800 p-2 text-white hover:bg-zinc-700"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            )}
          </button>
          <button
            type="submit"
            disabled={!draft.trim() || posting}
            className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {posting ? "…" : "Post"}
          </button>
        </form>
        {error && (
          <p className="px-4 pb-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
