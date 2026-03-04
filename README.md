# Movie Twitter

Timecoded posts for movies and TV. Sync a timer with your video, post at specific moments, and see others' posts as you watch.

## Quick Start (no API keys)

Runs with mock data, SQLite, and demo login—no TMDB or GitHub setup.

```bash
cp .env.example .env   # already has mock defaults
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Sign in → "Sign in as Demo" (demo / demo) → Search for "Shawshank" or "Godfather".

## Full Setup (real APIs)

1. Copy `.env.example` to `.env` and switch to PostgreSQL + real APIs.

2. **TMDB** — Get a free [API key](https://www.themoviedb.org/settings/api).

3. **Auth** — Create a [GitHub OAuth App](https://github.com/settings/developers):
   - Homepage: `http://localhost:3000`
   - Callback: `http://localhost:3000/api/auth/callback/github`
   - Add `GITHUB_ID` and `GITHUB_SECRET` to `.env`
   - Remove `USE_MOCK_DATA` so GitHub login is used.

4. **Database** — For production, use PostgreSQL (Docker, Neon, etc.).

5. **Migrations**: `npx prisma migrate dev`

6. **Run**: `npm run dev`

## Prisma 6

This project uses **Prisma 6**. If the Prisma VS Code extension shows "url is no longer supported" warnings (Prisma 7 rules), use **Cmd/Ctrl+Shift+P → "Pin to Prisma 6"** so validation matches this version.

## Tech

- Next.js 16 (App Router)
- Prisma + PostgreSQL
- NextAuth (GitHub)
- TMDB API
- Tailwind CSS
