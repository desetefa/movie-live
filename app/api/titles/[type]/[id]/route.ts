import { NextRequest, NextResponse } from "next/server";
import { getMovieDetails, getTvEpisodeDetails } from "@/lib/tmdb";
import { prisma } from "@/lib/db";
import { MOCK_MOVIES, isMockMode } from "@/lib/mock-data";

type TitleType = "movie" | "episode";

function parseEpisodeId(id: string): { showId: string; season: number; episode: number } | null {
  // Format: showId-s1-e2 or showId-1-2
  const parts = id.split("-");
  if (parts.length >= 3) {
    const showId = parts[0];
    const season = parseInt(parts[1], 10);
    const episode = parseInt(parts[2], 10);
    if (!isNaN(season) && !isNaN(episode)) return { showId, season, episode };
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  if (type !== "movie" && type !== "episode") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (isMockMode() && type === "episode") {
    return NextResponse.json(
      { error: "Episodes not available in mock mode. Search for movies only." },
      { status: 400 }
    );
  }
  try {
    let meta;
    const mockMovie = type === "movie" ? MOCK_MOVIES.find((m) => m.tmdbId === id) : null;
    const useMock = (isMockMode() || mockMovie) && type === "movie";
    if (useMock) {
      if (!mockMovie) {
        return NextResponse.json({ error: "Title not found" }, { status: 404 });
      }
      meta = {
        id: mockMovie.tmdbId,
        tmdbId: mockMovie.tmdbId,
        type: "movie" as const,
        title: mockMovie.title,
        runtimeSeconds: mockMovie.runtime * 60,
        posterPath: mockMovie.posterPath,
        overview: mockMovie.overview,
        releaseDate: mockMovie.releaseDate,
      };
    } else if (type === "movie") {
      meta = await getMovieDetails(id);
    } else {
      const parsed = parseEpisodeId(id);
      if (!parsed)
        return NextResponse.json({ error: "Invalid episode id format" }, { status: 400 });
      meta = await getTvEpisodeDetails(
        parsed.showId,
        parsed.season,
        parsed.episode
      );
    }

    const metadata: Record<string, unknown> = {
      posterPath: meta.posterPath,
      backdropPath: meta.backdropPath,
      overview: meta.overview,
      releaseDate: meta.releaseDate,
      showName: meta.showName,
      seasonNumber: meta.seasonNumber,
      episodeNumber: meta.episodeNumber,
    };
    if (type === "episode" && parseEpisodeId(id)) {
      metadata.showId = parseEpisodeId(id)!.showId;
    }

    const title = await prisma.title.upsert({
      where: {
        type_tmdbId: { type: meta.type as TitleType, tmdbId: meta.tmdbId },
      },
      create: {
        tmdbId: meta.tmdbId,
        type: meta.type,
        title: meta.title,
        runtimeSeconds: meta.runtimeSeconds,
        metadata: metadata as object,
      },
      update: {
        title: meta.title,
        runtimeSeconds: meta.runtimeSeconds,
        metadata: metadata as object,
      },
    });

    return NextResponse.json({
      id: title.id,
      tmdbId: title.tmdbId,
      type: title.type,
      title: title.title,
      runtimeSeconds: title.runtimeSeconds,
      metadata: title.metadata as Record<string, unknown>,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch title" },
      { status: 500 }
    );
  }
}
