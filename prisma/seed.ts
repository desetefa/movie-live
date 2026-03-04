import { PrismaClient } from "@prisma/client";
import { MOCK_MOVIES, MOCK_TWEETS } from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@movie-twitter.local" },
    create: {
      email: "demo@movie-twitter.local",
      name: "Demo User",
      username: "demo",
    },
    update: {},
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@movie-twitter.local" },
    create: {
      email: "alice@movie-twitter.local",
      name: "Alice",
      username: "alice",
    },
    update: {},
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@movie-twitter.local" },
    create: {
      email: "bob@movie-twitter.local",
      name: "Bob",
      username: "bob",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "anonymous@movie-twitter.local" },
    create: {
      email: "anonymous@movie-twitter.local",
      name: "Anonymous",
      username: "anonymous",
    },
    update: {},
  });

  const users = { demo: demoUser, alice, bob };

  for (const m of MOCK_MOVIES) {
    await prisma.title.upsert({
      where: { type_tmdbId: { type: "movie", tmdbId: m.tmdbId } },
      create: {
        tmdbId: m.tmdbId,
        type: "movie",
        title: m.title,
        runtimeSeconds: m.runtime * 60,
        metadata: {
          posterPath: m.posterPath,
          overview: m.overview,
          releaseDate: m.releaseDate,
        },
      },
      update: { runtimeSeconds: m.runtime * 60 },
    });
  }

  const titles = await prisma.title.findMany();
  const titleByTmdbId = Object.fromEntries(titles.map((t) => [t.tmdbId, t]));

  await prisma.timecodedTweet.deleteMany({});
  await prisma.tweetLike.deleteMany({});
  await prisma.tweetComment.deleteMany({});

  for (const tw of MOCK_TWEETS) {
    const title = titleByTmdbId[tw.titleTmdbId];
    const user = users[tw.username as keyof typeof users] ?? users.demo;
    if (!title) continue;

    await prisma.timecodedTweet.create({
      data: {
        userId: user.id,
        titleId: title.id,
        timecodeSeconds: tw.timecodeSeconds,
        content: tw.content,
      },
    });
  }

  console.log("Seed complete. Demo user: demo@movie-twitter.local / demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
