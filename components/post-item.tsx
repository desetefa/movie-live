"use client";

import { useCallback, useState } from "react";
import { formatTime } from "./video-timer";

export interface Post {
  id: string;
  content: string;
  timecodeSeconds: number;
  user: { name?: string | null; username?: string | null; image?: string | null };
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
}

interface PostItemProps {
  post: Post;
  isBlurred?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  onCommentAdded?: (postId: string) => void;
  isAuthenticated: boolean;
}

function displayName(post: Post) {
  return post.user.username ?? post.user.name ?? "Anonymous";
}

export function PostItem({
  post,
  isBlurred = false,
  isExpanded,
  onToggleExpand,
  onLike,
  onUnlike,
  onCommentAdded,
  isAuthenticated,
}: PostItemProps) {
  const [comments, setComments] = useState<
    Array<{
      id: string;
      content: string;
      user: { name?: string | null; username?: string | null };
    }>
  >([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (comments.length > 0) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?tweetId=${post.id}`);
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id, comments.length]);

  const handleExpand = () => {
    onToggleExpand();
    if (!isExpanded) loadComments();
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim() || !isAuthenticated || postingComment) return;
    setPostingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetId: post.id, content: commentDraft }),
      });
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentDraft("");
      onCommentAdded?.(post.id);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <article
      className={`p-4 transition-[filter] duration-300 ${isBlurred ? "blur-sm select-none pointer-events-none" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-white">@{displayName(post)}</span>
          <span>·</span>
          <span className="tabular-nums">{formatTime(post.timecodeSeconds)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-zinc-100">{post.content}</p>
        <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
          <button
            onClick={() => (post.hasLiked ? onUnlike(post.id) : onLike(post.id))}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 transition-colors hover:text-amber-400 ${post.hasLiked ? "text-amber-400" : ""}`}
          >
            ♡ {post.likeCount}
          </button>
          <button
            onClick={handleExpand}
            className="flex items-center gap-1 hover:text-amber-400"
          >
            💬 {post.commentCount}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          {loadingComments ? (
            <p className="text-sm text-zinc-500">Loading comments…</p>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium text-zinc-400">
                    @{c.user.username ?? c.user.name ?? "?"}
                  </span>{" "}
                  <span className="text-zinc-300">{c.content}</span>
                </div>
              ))}
            </div>
          )}
          {isAuthenticated && (
            <form onSubmit={handlePostComment} className="mt-3">
              <div className="flex gap-2">
                <input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value.slice(0, 500))}
                  placeholder="Add a comment..."
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500"
                  disabled={postingComment}
                />
                <button
                  type="submit"
                  disabled={!commentDraft.trim() || postingComment}
                  className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-black disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
