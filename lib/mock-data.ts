/**
 * Mock data for running the app without TMDB or GitHub.
 * Used when TMDB_API_KEY is not set or USE_MOCK_DATA=true.
 */

export const MOCK_MOVIES = [
  {
    id: "m1",
    tmdbId: "m1",
    type: "movie" as const,
    title: "The Shawshank Redemption",
    posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    releaseDate: "1994-09-23",
    overview: "Framed for murder, banker Andy Dufresne finds himself in Shawshank prison.",
    runtime: 142,
  },
  {
    id: "m2",
    tmdbId: "m2",
    type: "movie" as const,
    title: "The Godfather",
    posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    releaseDate: "1972-03-14",
    overview: "The aging patriarch of an organized crime dynasty transfers control to his son.",
    runtime: 175,
  },
  {
    id: "m3",
    tmdbId: "m3",
    type: "movie" as const,
    title: "Inception",
    posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Hu4.jpg",
    releaseDate: "2010-07-15",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    runtime: 148,
  },
  {
    id: "m4",
    tmdbId: "m4",
    type: "movie" as const,
    title: "Pulp Fiction",
    posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    releaseDate: "1994-09-10",
    overview: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine.",
    runtime: 154,
  },
  {
    id: "m5",
    tmdbId: "m5",
    type: "movie" as const,
    title: "The Dark Knight",
    posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    releaseDate: "2008-07-16",
    overview: "Batman must accept one of the greatest psychological tests to fight injustice.",
    runtime: 152,
  },
  {
    id: "m6",
    tmdbId: "m6",
    type: "movie" as const,
    title: "Bridesmaids",
    posterPath: "/7f53XAE4nPi3wxROgMPzFSgHl9h.jpg",
    releaseDate: "2011-05-13",
    overview: "Competition between the maid of honor and a bridesmaid over who is the bride's best friend.",
    runtime: 125, /* 2h 5m */
  },
];

export const MOCK_TWEETS: Array<{
  titleTmdbId: string;
  timecodeSeconds: number;
  content: string;
  username: string;
}> = [
  { titleTmdbId: "m1", timecodeSeconds: 120, content: "That scene gets me every time 🎬", username: "alice" },
  { titleTmdbId: "m1", timecodeSeconds: 300, content: "Best escape sequence in cinema history", username: "bob" },
  { titleTmdbId: "m1", timecodeSeconds: 450, content: "The ending tho 👏", username: "alice" },
  { titleTmdbId: "m2", timecodeSeconds: 60, content: "The wedding sequence is perfection", username: "bob" },
  { titleTmdbId: "m2", timecodeSeconds: 1800, content: "I love the smell of napalm in the morning... wait wrong movie", username: "alice" },
  { titleTmdbId: "m3", timecodeSeconds: 0, content: "Here we go again!", username: "bob" },
  { titleTmdbId: "m3", timecodeSeconds: 3600, content: "That spinning top...", username: "alice" },
  { titleTmdbId: "m4", timecodeSeconds: 600, content: "Say what again. I dare you.", username: "bob" },
  { titleTmdbId: "m5", timecodeSeconds: 720, content: "Why so serious? 🔥", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 0, content: "Here we go! Love this opening", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 120, content: "The jewelry store scene is too real 😭", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 240, content: "Helen's house lmao", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 360, content: "The dress fitting scene 😂", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 480, content: "Ribbon store vibes", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 660, content: "That bridal shower speech tho", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 900, content: "I'm not doing well", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 1140, content: "THE AIRPLANE SCENE", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 1320, content: "Help I'm poor 😂", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 1560, content: "Cookie decorating disaster incoming", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 1800, content: "This bathroom scene 💀", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 2100, content: "Megan is an icon", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 2400, content: "Vegas energy", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 2700, content: "That engagement party toast 😬", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 3000, content: "She's not even your friend", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 3300, content: "Annie and Rhodes 🥺", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 3600, content: "The cupcake shop moment", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 3900, content: "Making things right 💕", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 4200, content: "The dress!!", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 4500, content: "Lillian and Annie reconciliation", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 4800, content: "Wedding vibes", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 5100, content: "This ending gets me every time", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 5340, content: "This movie holds up so well", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 5580, content: "The reception entrance 👀", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 5820, content: "Helen and Annie finally talking", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 6060, content: "That bridesmaid speech 💕", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 6300, content: "Ted and Annie in the street", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 6540, content: "Rhodes showing up 🥹", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 6780, content: "The final wedding scene", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 7020, content: "Everyone dancing together", username: "alice" },
  { titleTmdbId: "m6", timecodeSeconds: 7260, content: "Perfect ending", username: "bob" },
  { titleTmdbId: "m6", timecodeSeconds: 7440, content: "Credits - what a ride 🎬", username: "alice" },
];

export function isMockMode(): boolean {
  return (
    process.env.USE_MOCK_DATA === "true" ||
    !process.env.TMDB_API_KEY
  );
}
