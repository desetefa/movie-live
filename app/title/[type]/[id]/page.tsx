"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { VideoTimer, MAX_TIMER_SECONDS } from "@/components/video-timer";
import { TimelineSlider } from "@/components/timeline-slider";
import { PostFeed } from "@/components/post-feed";

const POSITION_KEY = (type: string, id: string) => `movie-live:position:${type}:${id}`;

function loadSavedPosition(type: string, id: string, maxSeconds: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const saved = localStorage.getItem(POSITION_KEY(type, id));
    if (saved) {
      const sec = parseInt(saved, 10);
      if (!isNaN(sec) && sec >= 0) return Math.min(sec, maxSeconds);
    }
  } catch {
    // ignore
  }
  return 0;
}

function savePosition(type: string, id: string, seconds: number): void {
  try {
    localStorage.setItem(POSITION_KEY(type, id), String(Math.round(seconds)));
  } catch {
    // ignore
  }
}
type TitleData = {
  id: string;
  tmdbId: string;
  type: string;
  title: string;
  runtimeSeconds: number;
  metadata?: {
    posterPath?: string;
    backdropPath?: string;
    overview?: string;
    showName?: string;
    seasonNumber?: number;
    episodeNumber?: number;
  };
};

type PostData = {
  id: string;
  content: string;
  timecodeSeconds: number;
  user: { name?: string | null; username?: string | null; image?: string | null };
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
};

export default function TitlePage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{
    type: string;
    id: string;
  } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const [title, setTitle] = useState<TitleData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pipMode, setPipMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [savedWatchPosition, setSavedWatchPosition] = useState(0);
  const prevPlayingRef = useRef(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!resolvedParams) return;
    const { type, id } = resolvedParams;
    setLoading(true);
    fetch(`/api/titles/${type}/${id}`)
      .then((r) => r.json())
      .then((t) => {
        setTitle(t);
        if (t?.id) {
          return fetch(`/api/tweets?titleId=${t.id}`)
            .then((r) => (r.ok ? r.json() : []))
            .then(setPosts);
        }
        setPosts([]);
      })
      .catch(() => setTitle(null))
      .finally(() => setLoading(false));
  }, [resolvedParams]);

  useEffect(() => {
    if (!title?.id) return;
    const poll = () => {
      fetch(`/api/tweets?titleId=${title.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((fresh) => {
          const arr = Array.isArray(fresh) ? fresh : [];
          setPosts((prev) => {
            const fromApi = new Set(arr.map((t: { id: string }) => t.id));
            const onlyLocal = prev.filter((t) => !fromApi.has(t.id));
            return [...arr, ...onlyLocal].sort(
              (a: { timecodeSeconds: number }, b: { timecodeSeconds: number }) =>
                a.timecodeSeconds - b.timecodeSeconds
            );
          });
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [title?.id]);

  const runtimeSec =
    title && title.runtimeSeconds > 0
      ? Math.min(title.runtimeSeconds, MAX_TIMER_SECONDS)
      : MAX_TIMER_SECONDS;

  const {
    currentTime: timerTime,
    isPlaying,
    toggle,
    seek,
  } = VideoTimer({
    runtimeSeconds: runtimeSec,
    defaultPosition:
      resolvedParams && title
        ? loadSavedPosition(resolvedParams.type, resolvedParams.id, runtimeSec)
        : 0,
    onTimeChange: setCurrentTime,
  });

  useEffect(() => {
    if (prevPlayingRef.current && !isPlaying) {
      setSavedWatchPosition(timerTime);
      if (resolvedParams && title) {
        savePosition(resolvedParams.type, resolvedParams.id, timerTime);
      }
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying, timerTime, resolvedParams, title]);

  useEffect(() => {
    if (resolvedParams && title) {
      const loaded = loadSavedPosition(resolvedParams.type, resolvedParams.id, runtimeSec);
      setSavedWatchPosition(loaded);
    }
  }, [resolvedParams?.type, resolvedParams?.id, title?.id, runtimeSec]);

  const handleSeek = useCallback((seconds: number) => seek(seconds), [seek]);

  const postMarkers = posts.map((t) => t.timecodeSeconds);

  const handlePost = useCallback(
    async (content: string, timecodeSeconds: number) => {
      if (!title?.id) {
        console.error("[Post] No title.id available, cannot post");
        throw new Error("Movie not loaded yet. Please wait and try again.");
      }
      const payload = { titleId: title.id, timecodeSeconds, content };
      console.log("[Post] Sending:", payload);
      const res = await fetch("/api/tweets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (data?.error as string) || `Post failed (${res.status})`;
        console.error("[Post] API error:", res.status, data);
        throw new Error(msg);
      }
      setPosts((prev) =>
        [...prev, data].sort((a, b) => a.timecodeSeconds - b.timecodeSeconds)
      );
    },
    [title?.id]
  );

  const handleLike = useCallback(async (postId: string) => {
    const res = await fetch(`/api/tweets/${postId}/like`, { method: "POST" });
    if (!res.ok) return;
    setPosts((prev) =>
      prev.map((t) =>
        t.id === postId
          ? { ...t, likeCount: t.likeCount + 1, hasLiked: true }
          : t
      )
    );
  }, []);

  const handleCommentAdded = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((t) =>
        t.id === postId ? { ...t, commentCount: t.commentCount + 1 } : t
      )
    );
  }, []);

  const handleUnlike = useCallback(async (postId: string) => {
    const res = await fetch(`/api/tweets/${postId}/like`, { method: "DELETE" });
    if (!res.ok) return;
    setPosts((prev) =>
      prev.map((t) =>
        t.id === postId
          ? { ...t, likeCount: t.likeCount - 1, hasLiked: false }
          : t
      )
    );
  }, []);

  if (!resolvedParams) return null;

  if (loading && !title) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-zinc-400">Loading…</div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-6">
        <p className="text-zinc-400">Title not found.</p>
        <Link href="/" className="text-amber-500 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex h-dvh flex-col overflow-hidden bg-zinc-950 text-white ${pipMode ? "pt-[180px]" : ""}`}
    >
      <header className="shrink-0 border-b border-zinc-800 px-4 py-2">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-white">
              ←
            </Link>
            <h1 className="truncate text-base font-semibold">{title.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setPipMode((p) => !p)}
              className={`rounded p-1.5 transition-colors ${pipMode ? "bg-amber-500/20 text-amber-500" : "text-zinc-400 hover:text-white"}`}
              aria-label={pipMode ? "Exit PiP mode" : "PiP mode"}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <rect x="14" y="10" width="8" height="12" rx="2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 w-full flex-1 flex-row overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-row overflow-hidden pl-4">
          <div className="flex h-full min-h-0 shrink-0 self-stretch">
            <TimelineSlider
              orientation="vertical"
              currentTime={timerTime}
              runtimeSeconds={
                title.runtimeSeconds > 0
                  ? Math.min(title.runtimeSeconds, MAX_TIMER_SECONDS)
                  : MAX_TIMER_SECONDS
              }
              onSeek={handleSeek}
              postMarkers={postMarkers}
              savedPosition={savedWatchPosition}
              onJumpToSaved={() => handleSeek(savedWatchPosition)}
            />
          </div>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pr-4">
            <PostFeed
              posts={posts}
              currentTime={currentTime}
              timerTime={timerTime}
              runtimeSeconds={
                title.runtimeSeconds > 0
                  ? Math.min(title.runtimeSeconds, MAX_TIMER_SECONDS)
                  : MAX_TIMER_SECONDS
              }
              isPaused={!isPlaying}
              onTogglePlay={toggle}
              onSeek={handleSeek}
              onPost={handlePost}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onCommentAdded={handleCommentAdded}
              isAuthenticated={status === "authenticated"}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
