"use client";

import { useState } from "react";
import { formatTime } from "./video-timer";
import { PostItem, type Post } from "./post-item";

export const PIXELS_PER_SECOND = 4;

interface PostListProps {
  posts: Post[];
  currentTime: number;
  runtimeSeconds?: number;
  isPlaying?: boolean;
  blurFutureWhileActive?: boolean;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  onCommentAdded?: (postId: string) => void;
  isAuthenticated: boolean;
}

export function PostList({
  posts,
  currentTime,
  runtimeSeconds = 4 * 60 * 60,
  isPlaying = false,
  blurFutureWhileActive = true,
  onLike,
  onUnlike,
  onCommentAdded,
  isAuthenticated,
}: PostListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalHeight = runtimeSeconds * PIXELS_PER_SECOND;

  if (posts.length === 0) {
    return (
      <div
        className="flex min-h-full items-center justify-center"
        style={{ minHeight: totalHeight }}
      >
        <p className="text-center text-zinc-500">
          No posts yet. Be the first to post at this timestamp!
        </p>
      </div>
    );
  }

  const sortedPosts = [...posts].sort(
    (a, b) => a.timecodeSeconds - b.timecodeSeconds
  );

  return (
    <div
      className="relative"
      style={{ height: totalHeight }}
    >
      {sortedPosts.map((post) => (
        <div
          key={post.id}
          id={`post-${post.id}`}
          className="absolute left-0 right-0 border-t border-zinc-800"
          style={{ top: post.timecodeSeconds * PIXELS_PER_SECOND }}
        >
          <PostItem
            post={post}
            isBlurred={blurFutureWhileActive && post.timecodeSeconds > currentTime}
            isExpanded={expandedId === post.id}
            onToggleExpand={() =>
              setExpandedId((id) => (id === post.id ? null : post.id))
            }
            onLike={onLike}
            onUnlike={onUnlike}
            onCommentAdded={onCommentAdded}
            isAuthenticated={isAuthenticated}
          />
        </div>
      ))}
    </div>
  );
}
