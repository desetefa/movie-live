import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movie Twitter",
    short_name: "Movie Twitter",
    description: "Timecoded posts for movies and TV — watch together, post the moment.",
    start_url: "/",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#f59e0b",
  };
}
