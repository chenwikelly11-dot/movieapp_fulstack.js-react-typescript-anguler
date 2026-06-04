import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

const FALLBACK_MOVIES = [
  {
    Title: "Inception",
    Year: "2010",
    imdbID: "tt1375666",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    Rated: "PG-13",
    Released: "16 Jul 2010",
    Runtime: "148 min",
    Genre: "Action, Sci-Fi, Adventure",
    Director: "Christopher Nolan",
    Writer: "Christopher Nolan",
    Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    Language: "English, Japanese, French",
    Country: "USA, UK",
    Awards: "Won 4 Oscars. 159 wins & 220 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.8/10" },
      { Source: "Rotten Tomatoes", Value: "87%" },
      { Source: "Metacritic", Value: "74/100" }
    ],
    Metascore: "74",
    imdbRating: "8.8",
    imdbVotes: "2,415,000"
  },
  {
    Title: "Interstellar",
    Year: "2014",
    imdbID: "tt0816692",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    Rated: "PG-13",
    Released: "07 Nov 2014",
    Runtime: "169 min",
    Genre: "Adventure, Drama, Sci-Fi",
    Director: "Christopher Nolan",
    Writer: "Jonathan Nolan, Christopher Nolan",
    Actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    Plot: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space in an attempt to ensure humanity's survival.",
    Language: "English",
    Country: "USA, UK, Canada",
    Awards: "Won 1 Oscar. 44 wins & 148 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.7/10" },
      { Source: "Rotten Tomatoes", Value: "73%" },
      { Source: "Metacritic", Value: "74/100" }
    ],
    Metascore: "74",
    imdbRating: "8.7",
    imdbVotes: "1,950,000"
  },
  {
    Title: "The Dark Knight",
    Year: "2008",
    imdbID: "tt0468569",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop&q=80",
    Rated: "PG-13",
    Released: "18 Jul 2008",
    Runtime: "152 min",
    Genre: "Action, Crime, Drama",
    Director: "Christopher Nolan",
    Writer: "Jonathan Nolan, Christopher Nolan, David S. Goyer",
    Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
    Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    Language: "English, Mandarin",
    Country: "USA, UK",
    Awards: "Won 2 Oscars. 162 wins & 163 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.0/10" },
      { Source: "Rotten Tomatoes", Value: "94%" },
      { Source: "Metacritic", Value: "84/100" }
    ],
    Metascore: "84",
    imdbRating: "9.0",
    imdbVotes: "2,730,000"
  },
  {
    Title: "The Matrix",
    Year: "1999",
    imdbID: "tt0133093",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "31 Mar 1999",
    Runtime: "136 min",
    Genre: "Action, Sci-Fi",
    Director: "Lana Wachowski, Lilly Wachowski",
    Writer: "Lana Wachowski, Lilly Wachowski",
    Actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    Plot: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
    Language: "English",
    Country: "USA",
    Awards: "Won 4 Oscars. 42 wins & 51 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.7/10" },
      { Source: "Rotten Tomatoes", Value: "88%" },
      { Source: "Metacritic", Value: "73/100" }
    ],
    Metascore: "73",
    imdbRating: "8.7",
    imdbVotes: "1,970,000"
  },
  {
    Title: "Pulp Fiction",
    Year: "1994",
    imdbID: "tt0110912",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "14 Oct 1994",
    Runtime: "154 min",
    Genre: "Crime, Drama",
    Director: "Quentin Tarantino",
    Writer: "Quentin Tarantino, Roger Avary",
    Actors: "John Travolta, Uma Thurman, Samuel L. Jackson",
    Plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    Language: "English, Spanish, French",
    Country: "USA",
    Awards: "Won 1 Oscar. 73 wins & 75 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.9/10" },
      { Source: "Rotten Tomatoes", Value: "92%" },
      { Source: "Metacritic", Value: "95/100" }
    ],
    Metascore: "95",
    imdbRating: "8.9",
    imdbVotes: "2,110,000"
  },
  {
    Title: "Avatar",
    Year: "2009",
    imdbID: "tt0499549",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80",
    Rated: "PG-13",
    Released: "18 Dec 2009",
    Runtime: "162 min",
    Genre: "Action, Adventure, Fantasy",
    Director: "James Cameron",
    Writer: "James Cameron",
    Actors: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
    Plot: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    Language: "English, Spanish",
    Country: "USA",
    Awards: "Won 3 Oscars. 91 wins & 131 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "7.8/10" },
      { Source: "Rotten Tomatoes", Value: "82%" },
      { Source: "Metacritic", Value: "83/100" }
    ],
    Metascore: "83",
    imdbRating: "7.8",
    imdbVotes: "1,350,000"
  },
  {
    Title: "Spirited Away",
    Year: "2001",
    imdbID: "tt0245429",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
    Rated: "PG",
    Released: "20 Jul 2001",
    Runtime: "125 min",
    Genre: "Animation, Adventure, Family",
    Director: "Hayao Miyazaki",
    Writer: "Hayao Miyazaki",
    Actors: "Daveigh Chase, Suzanna Pleshette, Jason Marsden",
    Plot: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    Language: "Japanese, English",
    Country: "Japan",
    Awards: "Won 1 Oscar. 57 wins & 31 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.6/10" },
      { Source: "Rotten Tomatoes", Value: "96%" },
      { Source: "Metacritic", Value: "96/100" }
    ],
    Metascore: "96",
    imdbRating: "8.6",
    imdbVotes: "800,000"
  },
  {
    Title: "Gladiator",
    Year: "2000",
    imdbID: "tt0172495",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "05 May 2000",
    Runtime: "155 min",
    Genre: "Action, Adventure, Drama",
    Director: "Ridley Scott",
    Writer: "David Franzoni, John Logan, William Nicholson",
    Actors: "Russell Crowe, Joaquin Phoenix, Connie Nielsen",
    Plot: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    Language: "English",
    Country: "USA, UK, Malta, Morocco",
    Awards: "Won 5 Oscars. 60 wins & 104 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.5/10" },
      { Source: "Rotten Tomatoes", Value: "80%" },
      { Source: "Metacritic", Value: "67/100" }
    ],
    Metascore: "67",
    imdbRating: "8.5",
    imdbVotes: "1,540,000"
  },
  {
    Title: "Dune: Part Two",
    Year: "2024",
    imdbID: "tt15239678",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    Rated: "PG-13",
    Released: "01 Mar 2024",
    Runtime: "166 min",
    Genre: "Action, Adventure, Sci-Fi",
    Director: "Denis Villeneuve",
    Writer: "Denis Villeneuve, Jon Spaihts, Frank Herbert",
    Actors: "Timothée Chalamet, Zendaya, Rebecca Ferguson",
    Plot: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    Language: "English, Fremen",
    Country: "USA, Canada",
    Awards: "Nominated for multiple awards. Massive box office sweep.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.6/10" },
      { Source: "Rotten Tomatoes", Value: "92%" }
    ],
    Metascore: "79",
    imdbRating: "8.6",
    imdbVotes: "450,000"
  },
  {
    Title: "Spider-Man: Into the Spider-Verse",
    Year: "2018",
    imdbID: "tt4633694",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    Rated: "PG",
    Released: "14 Dec 2018",
    Runtime: "117 min",
    Genre: "Animation, Action, Adventure",
    Director: "Bob Persichetti, Peter Ramsey, Rodney Rothman",
    Writer: "Phil Lord, Rodney Rothman",
    Actors: "Shameik Moore, Jake Johnson, Hailee Steinfeld",
    Plot: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat to all realities.",
    Language: "English, Spanish",
    Country: "USA",
    Awards: "Won 1 Oscar. 84 wins & 58 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.4/10" },
      { Source: "Rotten Tomatoes", Value: "97%" }
    ],
    Metascore: "87",
    imdbRating: "8.4",
    imdbVotes: "630,000"
  },
  {
    Title: "The Godfather",
    Year: "1972",
    imdbID: "tt0068646",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "24 Mar 1972",
    Runtime: "175 min",
    Genre: "Crime, Drama",
    Director: "Francis Ford Coppola",
    Writer: "Mario Puzo, Francis Ford Coppola",
    Actors: "Marlon Brando, Al Pacino, James Caan",
    Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    Language: "English, Italian, Latin",
    Country: "USA",
    Awards: "Won 3 Oscars. 32 wins & 30 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.2/10" },
      { Source: "Rotten Tomatoes", Value: "97%" }
    ],
    Metascore: "100",
    imdbRating: "9.2",
    imdbVotes: "1,980,000"
  },
  {
    Title: "The Shawshank Redemption",
    Year: "1994",
    imdbID: "tt0111161",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "14 Oct 1994",
    Runtime: "142 min",
    Genre: "Drama",
    Director: "Frank Darabont",
    Writer: "Stephen King, Frank Darabont",
    Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
    Plot: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
    Language: "English",
    Country: "USA",
    Awards: "Nominated for 7 Oscars. 21 wins & 43 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "9.3/10" },
      { Source: "Rotten Tomatoes", Value: "98%" }
    ],
    Metascore: "82",
    imdbRating: "9.3",
    imdbVotes: "2,840,000"
  },
  {
    Title: "Parasite",
    Year: "2019",
    imdbID: "tt6751668",
    Type: "movie" as const,
    Poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&auto=format&fit=crop&q=80",
    Rated: "R",
    Released: "30 May 2019",
    Runtime: "132 min",
    Genre: "Drama, Thriller",
    Director: "Bong Joon Ho",
    Writer: "Bong Joon Ho, Han Jin-won",
    Actors: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
    Plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    Language: "Korean, English",
    Country: "South Korea",
    Awards: "Won 4 Oscars. 308 wins & 270 nominations total.",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.5/10" },
      { Source: "Rotten Tomatoes", Value: "99%" }
    ],
    Metascore: "96",
    imdbRating: "8.5",
    imdbVotes: "910,000"
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Movies search or browsing
  app.get("/api/movies/search", async (req, res) => {
    const query = (req.query.s as string || "").trim();
    if (!query) {
      return res.json({
        Search: FALLBACK_MOVIES.map(m => ({
          Title: m.Title,
          Year: m.Year,
          imdbID: m.imdbID,
          Type: m.Type,
          Poster: m.Poster
        })),
        totalResults: String(FALLBACK_MOVIES.length),
        Response: "True"
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Offline fallback filtration
      const results = FALLBACK_MOVIES.filter(m =>
        m.Title.toLowerCase().includes(query.toLowerCase()) ||
        m.Genre.toLowerCase().includes(query.toLowerCase()) ||
        m.Actors.toLowerCase().includes(query.toLowerCase())
      );

      return res.json({
        Search: results.map(m => ({
          Title: m.Title,
          Year: m.Year,
          imdbID: m.imdbID,
          Type: m.Type,
          Poster: m.Poster
        })),
        totalResults: String(results.length),
        Response: results.length > 0 ? "True" : "False",
        Error: results.length > 0 ? undefined : "Movie not found!"
      });
    }

    try {
      const prompt = `You are a movie information proxy service in JSON schema mode.
Generate a search result list for the search query: "${query}" in the style of the OMDb API.
Format the output EXACTLY as this JSON structure:
{
  "Search": [
    {
      "Title": "Movie Title Here",
      "Year": "Release Year e.g. 2021",
      "imdbID": "ttUnique7DigitID",
      "Type": "movie",
      "Poster": "A valid public high quality poster or cinematic scenery image URL from Unsplash. For imagery, use high resolution URLs such as 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&q=80' or similar beautiful stock photos."
    }
  ],
  "totalResults": "Number of results found",
  "Response": "True"
}

If no movies found or query is gibberish, return:
{
  "Response": "False",
  "Error": "Movie not found!"
}

Only return realistic and real-world movies related to the keyword "${query}".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Gemini Search Error, using local fallback:", err);
      // Fallback filter
      const results = FALLBACK_MOVIES.filter(m =>
        m.Title.toLowerCase().includes(query.toLowerCase())
      );
      res.json({
        Search: results.map(m => ({
          Title: m.Title,
          Year: m.Year,
          imdbID: m.imdbID,
          Type: m.Type,
          Poster: m.Poster
        })),
        totalResults: String(results.length),
        Response: results.length > 0 ? "True" : "False",
        Error: results.length > 0 ? undefined : "Movie not found!"
      });
    }
  });

  // API Route: Movie detail
  app.get("/api/movies/detail", async (req, res) => {
    const imdbID = req.query.i as string || "";
    const title = req.query.t as string || "";

    if (!imdbID && !title) {
      return res.status(400).json({ Response: "False", Error: "Parameter 'i' (imdbID) or 't' (title) is required." });
    }

    // First search in fallback list
    const foundLocal = FALLBACK_MOVIES.find(m =>
      (imdbID && m.imdbID === imdbID) ||
      (title && m.Title.toLowerCase() === title.toLowerCase())
    );

    if (foundLocal) {
      return res.json({ ...foundLocal, Response: "True" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        Response: "False",
        Error: "Offline Mode: Movie instructions not cached."
      });
    }

    const queryKey = imdbID ? `IMDb ID ${imdbID}` : `Title "${title}"`;

    try {
      const prompt = `You are a movie information proxy service in JSON schema mode.
Generate complete OMDb-compliant metadata for: ${queryKey}.
Format the output EXACTLY as this JSON structure:
{
  "Title": "Movie Name",
  "Year": "Release Year e.g. 2022",
  "Rated": "PG-13, R, PG, etc.",
  "Released": "Exact date e.g. 15 Nov 2022",
  "Runtime": "Duration in minutes e.g. 124 min",
  "Genre": "Genres separated by comma",
  "Director": "Director name(s)",
  "Writer": "Writer name(s)",
  "Actors": "Principal actors separated by comma",
  "Plot": "A highly readable, engaging 2-3 sentence overview of the movie plot.",
  "Language": "Languages separated by comma",
  "Country": "Countries separated by comma",
  "Awards": "Nominations or wins description",
  "Poster": "A beautiful cinematic photo URL from Unsplash (e.g., 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80')",
  "Ratings": [{"Source": "Internet Movie Database", "Value": "8.1/10"}, {"Source": "Rotten Tomatoes", "Value": "88%"}],
  "Metascore": "82",
  "imdbRating": "8.1",
  "imdbVotes": "520,300",
  "imdbID": "${imdbID || 'tt1234567'}",
  "Type": "movie",
  "Response": "True"
}

If you do not recognize this movie or it doesn't exist, generate standard fictional but realistic details using the query as the title, so that the client application always receives valid movie details.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Gemini Detail Error:", err);
      res.status(500).json({ Response: "False", Error: "Failed to generate movie details: " + err.message });
    }
  });

  // API Route: Similar recommendations based on active movie
  app.get("/api/movies/recommend", async (req, res) => {
    const genre = req.query.genre as string || "";
    const title = req.query.title as string || "";

    const ai = getGeminiClient();
    if (!ai) {
      // Local filter recommendations
      const results = FALLBACK_MOVIES.filter(m =>
        m.Title.toLowerCase() !== title.toLowerCase() &&
        (genre ? m.Genre.split(",").some(g => genre.includes(g.trim())) : true)
      ).slice(0, 4);

      return res.json({
        Search: results.map(m => ({
          Title: m.Title,
          Year: m.Year,
          imdbID: m.imdbID,
          Type: m.Type,
          Poster: m.Poster
        })),
        Response: "True"
      });
    }

    try {
      const prompt = `You are a movie recommendation service in JSON schema mode.
Provide a list of 4 highly similar movie recommendations for the movie "${title}" which has genres "${genre}".
Format the output EXACTLY as this JSON structure:
{
  "Search": [
    {
      "Title": "Movie Title Here",
      "Year": "Release Year",
      "imdbID": "ttUnique7DigitID",
      "Type": "movie",
      "Poster": "A valid public high quality poster or cinematic scenery image URL from Unsplash."
    }
  ],
  "Response": "True"
}
Only recommend movies that are real. Ensure the recommended list does not include the movie "${title}".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Gemini Recommendation Error:", err);
      // fallback
      const results = FALLBACK_MOVIES.filter(m => m.Title.toLowerCase() !== title.toLowerCase()).slice(0, 4);
      res.json({
        Search: results.map(m => ({
          Title: m.Title,
          Year: m.Year,
          imdbID: m.imdbID,
          Type: m.Type,
          Poster: m.Poster
        })),
        Response: "True"
      });
    }
  });

  // Vite middleware in dev, static output in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (Node Runtime)`);
  });
}

startServer();
