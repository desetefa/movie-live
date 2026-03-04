import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const userId = (session.user as { id: string }).id;

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, username: true },
    }),
    prisma.timecodedTweet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        title: { select: { id: true, title: true, type: true } },
      },
    }),
  ]);

  if (!user) redirect("/auth/signin");

  const displayName = user.username ?? user.name ?? "User";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← Home
          </Link>
          <Link href="/auth/signout" className="text-sm text-zinc-400 hover:text-white">
            Sign out
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-4">
        <div className="flex items-center gap-4">
          {user.image && (
            <Image
              src={user.image}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">@{displayName}</h1>
            {user.name && (
              <p className="text-zinc-400">{user.name}</p>
            )}
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">
            Recent posts
          </h2>
          {posts.length === 0 ? (
            <p className="text-zinc-500">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((t) => (
                <Link
                  key={t.id}
                  href={`/t/${t.titleId}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                >
                  <p className="text-zinc-100">{t.content}</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {t.title.title} · {Math.floor(t.timecodeSeconds / 60)}:
                    {(t.timecodeSeconds % 60).toString().padStart(2, "0")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
