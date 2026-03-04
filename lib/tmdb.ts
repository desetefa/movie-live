const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TitleType = "movie" | "episode";

export interface TitleMetadata {
  id: string;
  tmdbId: string;
  type: TitleType;
  title: string;
  runtimeSeconds: number;
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  releaseDate?: string;
  showName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

async function tmdbFetch(path: string, params?: Record<string, string>) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is required");
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export function posterUrl(path: string | null | undefined, size = "w342") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export async function searchMovies(query: string) {
  const data = await tmdbFetch("/search/movie", { query });
  return (data.results ?? []).map((m: Record<string, unknown>) => ({
    id: String(m.id),
    type: "movie" as const,
    title: m.title as string,
    posterPath: m.poster_path as string | null,
    releaseDate: m.release_date as string | null,
    overview: m.overview as string | null,
  }));
}

export async function searchTvShows(query: string) {
  const data = await tmdbFetch("/search/tv", { query });
  return (data.results ?? []).map((s: Record<string, unknown>) => ({
    id: String(s.id),
    type: "tv" as const,
    name: s.name as string,
    posterPath: s.poster_path as string | null,
    firstAirDate: s.first_air_date as string | null,
  }));
}

export async function getMovieDetails(tmdbId: string): Promise<TitleMetadata> {
  const m = await tmdbFetch(`/movie/${tmdbId}`);
  const runtime = (m.runtime as number) || 0;
  return {
    id: String(m.id),
    tmdbId: String(m.id),
    type: "movie",
    title: m.title as string,
    runtimeSeconds: runtime * 60,
    posterPath: m.poster_path ?? undefined,
    backdropPath: m.backdrop_path ?? undefined,
    overview: m.overview ?? undefined,
    releaseDate: m.release_date ?? undefined,
  };
}

export async function getTvEpisodeDetails(
  showId: string,
  seasonNum: number,
  episodeNum: number
): Promise<TitleMetadata> {
  const [show, episode] = await Promise.all([
    tmdbFetch(`/tv/${showId}`),
    tmdbFetch(`/tv/${showId}/season/${seasonNum}/episode/${episodeNum}`),
  ]);
  const runtime = (episode.runtime as number) || (show.episode_run_time?.[0] as number) || 45;
  return {
    id: `tv-${showId}-${seasonNum}-${episodeNum}`,
    tmdbId: String(episode.id ?? `${showId}-${seasonNum}-${episodeNum}`),
    type: "episode",
    title: episode.name as string,
    runtimeSeconds: runtime * 60,
    posterPath: (episode.still_path ?? show.poster_path) ?? undefined,
    backdropPath: episode.still_path ?? show.backdrop_path ?? undefined,
    overview: episode.overview ?? undefined,
    releaseDate: episode.air_date ?? undefined,
    showName: show.name as string,
    seasonNumber: seasonNum,
    episodeNumber: episodeNum,
  };
}
