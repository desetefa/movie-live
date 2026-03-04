import { NextRequest, NextResponse } from "next/server";
import { searchMovies, searchTvShows } from "@/lib/tmdb";
import { MOCK_MOVIES, isMockMode } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type"); // "movie" | "tv" | "all"
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }
  try {
    if (isMockMode()) {
      const query = q.toLowerCase();
      const filtered = MOCK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          (m.overview && m.overview.toLowerCase().includes(query))
      ).map((m) => ({
        id: m.tmdbId,
        type: "movie",
        title: m.title,
        posterPath: m.posterPath,
        releaseDate: m.releaseDate,
        overview: m.overview,
        _type: "movie",
      }));
      return NextResponse.json({ results: filtered });
    }
    const results: Array<Record<string, unknown>> = [];
    if (type !== "tv") {
      const movies = await searchMovies(q);
      results.push(
        ...movies.map((m: Record<string, unknown>) => ({ ...m, _type: "movie" }))
      );
    }
    if (type !== "movie") {
      const shows = await searchTvShows(q);
      results.push(
        ...shows.map((s: Record<string, unknown>) => ({ ...s, _type: "tv" }))
      );
    }
    return NextResponse.json({ results });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "TMDB search failed" },
      { status: 500 }
    );
  }
}
