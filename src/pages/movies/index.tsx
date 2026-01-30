import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { fetchTrendingMovies, searchMovies, fetchMoviesByFilters, TMDB_IMAGE_BASE_URL, } from "@/lib/tmdb";
import SearchBar from "@/components/home/SearchBar";
import Footer from "@/components/layout/Footer";
import { countries,genres,years } from "@/data/filterOption";

const MoviesPage = () => {
  const router = useRouter();
  const searchQuery = router.query.search as string | undefined;

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState(searchQuery || "");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
const [selectedGenre, setSelectedGenre] = useState("");
const [selectedYear, setSelectedYear] = useState("");

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favoriteMovies");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteMovies", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (movieId: number) => {
    setFavorites((prev) =>
      prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]
    );
  };

  // Load trending or search movies
  useEffect(() => {
  const loadMovies = async () => {
    try {
      setLoading(true);
      setPage(1);

      // ✅ FILTER MODE
      if (selectedCountry || selectedGenre || selectedYear) {
        const data = await fetchMoviesByFilters({
          country: selectedCountry,
          genre: selectedGenre,
          year: selectedYear,
        });
        setMovies(data.results || []);
        setHasMore(data.results?.length > 0);
        return;
      }

      // 🔍 SEARCH MODE
      if (searchQuery) {
        const data = await searchMovies(searchQuery);
        setMovies(data.results);
        setHasMore(data.results.length > 0);
        return;
      }

      // 🔥 TRENDING MODE
      const data = await fetchTrendingMovies();
      setMovies(data.results);
      setHasMore(true);
    } catch (err) {
      console.error("Failed to load movies", err);
    } finally {
      setLoading(false);
    }
  };

  loadMovies();
}, [searchQuery, selectedCountry, selectedGenre, selectedYear]);


  const loadMoreMovies = async () => {
  if (loadingMore) return;
  setLoadingMore(true);

  try {
    const nextPage = page + 1;
    let data;

    if (selectedCountry || selectedGenre || selectedYear) {
      data = await fetchMoviesByFilters({
        country: selectedCountry,
        genre: selectedGenre,
        year: selectedYear,
        page: nextPage,
      });
    } else if (query.trim()) {
      data = await searchMovies(query, nextPage);
    } else {
      data = await fetchTrendingMovies(nextPage);
    }

    if (!data.results || data.results.length === 0) {
      setHasMore(false);
      return;
    }

    setMovies((prev) => [...prev, ...data.results]);
    setPage(nextPage);
  } catch (err) {
    console.error("Failed to load more movies", err);
  } finally {
    setLoadingMore(false);
  }
};
useEffect(() => {
  setPage(1);
}, [selectedCountry, selectedGenre, selectedYear]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center px-6 py-4 shadow-md">
        <button onClick={() => router.back()} className="text-white text-2xl font-bold mr-4">
          ←
        </button>
        <h1 className="text-2xl font-bold">Movies</h1>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-6 max-w-7xl mx-auto bg-gray-800 rounded-lg mt-6">
        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSubmit} />

        <div className="flex gap-2 mt-4 flex-wrap">
  {/* Countries */}
  <select
    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
    value={selectedCountry}
    onChange={(e) => setSelectedCountry(e.target.value)}
  >
    <option value="">All Countries</option>
    {countries.map((country) => (
      <option key={country.code} value={country.code}>
        {country.name}
      </option>
    ))}
  </select>

  {/* Genres */}
  <select
    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
    value={selectedGenre}
    onChange={(e) => setSelectedGenre(e.target.value)}
  >
    <option value="">All Genres</option>
    {genres.map((genre) => (
      <option key={genre.id} value={genre.id}>
        {genre.name}
      </option>
    ))}
  </select>

  {/* Years */}
  <select
    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
  >
    <option value="">All Years</option>
    {years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
  <button
  onClick={() => {
    setSelectedCountry("");
    setSelectedGenre("");
    setSelectedYear("");
  }}
  className="bg-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-500"
>
  Clear Filters
</button>

</div>

      </div>

      {/* Movie Grid */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        <h2 className="font-bold text-2xl mb-4">
          {query ? `Search Results for "${query}"` : "Trending Movies"}
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="text-gray-400">No movies found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="group bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-72 w-full">
                  <Image
                    src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 px-2 py-2">
                  <div className="flex flex-col">
                    <Link
                      href={`/movies/${movie.id}`}
                      className="font-semibold text-white hover:underline truncate"
                    >
                      {movie.title}
                    </Link>
                    <span className="text-gray-400 text-sm">
                      {movie.release_date?.split("-")[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(movie.id)}
                    className={`ml-2 flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold transition ${
                      favorites.includes(movie.id)
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                  >
                    {favorites.includes(movie.id) ? "Added" : "Add"} ❤️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreMovies}
              disabled={loadingMore}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : "Load More Movies ..."}
            </button>
          </div>
        )}
      </div>
      
<div className="bg-white">
      <Footer />
      </div>
    </div>
  );
};

export default MoviesPage;
