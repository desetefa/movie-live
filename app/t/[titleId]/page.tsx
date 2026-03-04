import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function TitleRedirectPage({
  params,
}: {
  params: Promise<{ titleId: string }>;
}) {
  const { titleId } = await params;
  const title = await prisma.title.findUnique({
    where: { id: titleId },
  });
  if (!title) {
    redirect("/");
  }
  const meta = title.metadata as { showId?: string; seasonNumber?: number; episodeNumber?: number } | null;
  const slug =
    title.type === "episode" && meta?.showId != null
      ? `${meta.showId}-${meta.seasonNumber ?? 1}-${meta.episodeNumber ?? 1}`
      : title.tmdbId;
  redirect(`/title/${title.type}/${slug}`);
}
