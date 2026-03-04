import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tweetId = searchParams.get("tweetId");
  if (!tweetId) {
    return NextResponse.json({ error: "tweetId required" }, { status: 400 });
  }

  const comments = await prisma.tweetComment.findMany({
    where: { tweetId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return NextResponse.json(
    comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user,
    }))
  );
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const { tweetId, content } = body;
  if (!tweetId || !content) {
    return NextResponse.json(
      { error: "tweetId and content required" },
      { status: 400 }
    );
  }
  if (content.length > 500) {
    return NextResponse.json(
      { error: "Content max 500 characters" },
      { status: 400 }
    );
  }

  const tweet = await prisma.timecodedTweet.findUnique({
    where: { id: tweetId },
  });
  if (!tweet) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.tweetComment.create({
    data: { userId, tweetId, content: content.trim() },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  });

  return NextResponse.json({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    user: comment.user,
  });
}
