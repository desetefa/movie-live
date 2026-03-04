"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{
      id: string;
      type: string;
      title?: string;
      name?: string;
      posterPath?: string | null;
      releaseDate?: string | null;
      firstAirDate?: string | null;
      _type: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const search = async () => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/titles?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  const getTitleLink = (item: (typeof results)[0]) => {
    if (item._type === "movie") {
      return `/title/movie/${item.id}`;
    }
    if (item._type === "tv") {
      return `/title/episode/${item.id}-1-1`;
    }
    return "#";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="text-lg font-bold">Movie Twitter</h1>
          {status === "authenticated" ? (
            <Link
              href="/profile"
              className="text-sm text-zinc-400 hover:text-white"
            >
              {session?.user?.name ?? "Profile"}
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm text-amber-500 hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 p-4">
        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">
            Search movies & TV
          </h2>
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={search}
              disabled={loading}
              className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </section>

        {results.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-medium text-zinc-400">
              Results
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((item) => {
                const link = getTitleLink(item);
                const name = item.title ?? item.name ?? "Unknown";
                const date =
                  item.releaseDate ?? item.firstAirDate ?? "";
                return (
                  <Link
                    key={`${item._type}-${item.id}`}
                    href={link}
                    className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700"
                  >
                    {item.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                        alt=""
                        width={56}
                        height={80}
                        className="h-20 w-14 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-zinc-800 text-zinc-500 text-xs">
                        —
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{name}</p>
                      <p className="text-xs text-zinc-500">
                        {item._type === "movie" ? "Movie" : "TV"}
                        {date ? ` · ${date.slice(0, 4)}` : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
