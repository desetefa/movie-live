"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [useMockAuth, setUseMockAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setUseMockAuth(d.mockMode ?? false))
      .catch(() => setUseMockAuth(false))
      .finally(() => setLoading(false));
  }, []);

  const handleDemoLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDemoError(null);
    const res = await signIn("credentials", {
      username: "demo",
      password: "demo",
      redirect: false,
    });
    if (res?.error) {
      setDemoError("Login failed. Make sure you've run: npx prisma db seed");
      return;
    }
    if (res?.ok) window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-6">
      <h1 className="text-2xl font-bold text-white">Movie Twitter</h1>
      <p className="text-zinc-400">Sign in to start watching and posting</p>

      {useMockAuth && (
        <form
          onSubmit={handleDemoLogin}
          className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <h2 className="text-sm font-medium text-zinc-400">Demo (no API keys)</h2>
          <input
            type="text"
            defaultValue="demo"
            readOnly
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
          />
          <input
            type="password"
            defaultValue="demo"
            readOnly
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
          />
          {demoError && (
            <p className="text-sm text-amber-400">{demoError}</p>
          )}
          <button
            type="submit"
            className="rounded-full bg-amber-500 px-6 py-3 text-black font-medium hover:bg-amber-400"
          >
            Sign in as Demo
          </button>
        </form>
      )}

      {loading && (
        <p className="text-sm text-zinc-500">Loading…</p>
      )}
      {!loading && !useMockAuth && (
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="rounded-full bg-white px-6 py-3 text-black font-medium hover:bg-zinc-200 transition-colors"
        >
          Sign in with GitHub
        </button>
      )}
    </div>
  );
}
