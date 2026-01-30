const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const BASE_URL = "https://api.themoviedb.org/3";

export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const fetchTrendingMovies = async (page: number = 1) => {
  if (!API_KEY) {
    throw new Error("TMDB API key is missing");
  }

  const res = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch trending movies");
  }

  return res.json();
};

export const fetchMovieDetails = async (id: string) => {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,reviews`
  );
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return res.json();
};
export const searchMovies = async (query: string, page: number = 1) => {
  if (!query) return { results: [] };
  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
  const data = await res.json();
  return data;
};

export const fetchMoviesByFilters = async ({
  genre,
  year,
  country,
  page = 1,
}: {
  genre?: string;
  year?: string;
  country?: string;
  page?: number;
}) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=${
      process.env.NEXT_PUBLIC_TMDB_API_KEY
    }&sort_by=popularity.desc&page=${page}
     ${genre ? `&with_genres=${genre}` : ""}
     ${year ? `&primary_release_year=${year}` : ""}
     ${country ? `&region=${country}` : ""}`
  );

  return res.json();
};



