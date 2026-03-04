import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const titleId = searchParams.get("titleId");
  const beforeTime = searchParams.get("beforeTime");
  if (!titleId) {
    return NextResponse.json({ error: "titleId required" }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  const tweets = await prisma.timecodedTweet.findMany({
    where: {
      titleId,
      ...(beforeTime != null
        ? { timecodeSeconds: { lte: parseInt(beforeTime, 10) } }
        : {}),
    },
    orderBy: { timecodeSeconds: "asc" },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const likeIds =
    userId && tweets.length > 0
      ? await prisma.tweetLike.findMany({
          where: {
            userId,
            tweetId: { in: tweets.map((t) => t.id) },
          },
          select: { tweetId: true },
        })
      : [];
  const likedSet = new Set(likeIds.map((l) => l.tweetId));

  const result = tweets.map((t) => ({
    id: t.id,
    content: t.content,
    timecodeSeconds: t.timecodeSeconds,
    user: t.user,
    likeCount: t._count.likes,
    commentCount: t._count.comments,
    hasLiked: likedSet.has(t.id),
  }));

  return NextResponse.json(result);
}

async function getOrCreateAnonymousUser() {
  let user = await prisma.user.findUnique({
    where: { email: "anonymous@movie-twitter.local" },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "anonymous@movie-twitter.local",
        name: "Anonymous",
        username: "anonymous",
      },
    });
  }
  return user.id;
}

export async function POST(request: NextRequest) {
  console.log("[API tweets POST] Request received");
  const session = await getServerSession(authOptions);
  const userId = session?.user
    ? (session.user as { id: string }).id
    : await getOrCreateAnonymousUser();
  const body = await request.json().catch(() => ({}));
  const { titleId, timecodeSeconds, content } = body;
  console.log("[API tweets POST] Body:", { titleId, timecodeSeconds, contentLength: content?.length });

  if (!titleId || typeof timecodeSeconds !== "number" || !content) {
    console.log("[API tweets POST] Validation failed: missing required fields");
    return NextResponse.json(
      { error: "titleId, timecodeSeconds, content required" },
      { status: 400 }
    );
  }
  if (content.length > 280) {
    return NextResponse.json(
      { error: "Content max 280 characters" },
      { status: 400 }
    );
  }

  const title = await prisma.title.findUnique({
    where: { id: titleId },
  });
  if (!title) {
    console.log("[API tweets POST] Title not found:", titleId);
    return NextResponse.json({ error: "Title not found" }, { status: 404 });
  }
  const maxTimecode = Math.min(title.runtimeSeconds, 4 * 60 * 60); // cap at 4 hours
  if (timecodeSeconds < 0 || timecodeSeconds > maxTimecode) {
    console.log("[API tweets POST] Timecode out of range:", { timecodeSeconds, maxTimecode });
    return NextResponse.json(
      { error: "Timecode out of range" },
      { status: 400 }
    );
  }

  console.log("[API tweets POST] Creating tweet...");
  const tweet = await prisma.timecodedTweet.create({
    data: {
      userId,
      titleId,
      timecodeSeconds,
      content: content.trim(),
    },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  console.log("[API tweets POST] Created tweet:", tweet.id);
  return NextResponse.json({
    id: tweet.id,
    content: tweet.content,
    timecodeSeconds: tweet.timecodeSeconds,
    user: tweet.user,
    likeCount: tweet._count.likes,
    commentCount: tweet._count.comments,
    hasLiked: false,
  });
}
