import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleFavorite } from "@/store/favoritesSlice";
import Image from "next/image";

import {
  fetchTrendingMovies,
  searchMovies,
  fetchMoviesByFilters,
  TMDB_IMAGE_BASE_URL,
} from "@/lib/tmdb";

import SearchBar from "@/components/home/SearchBar";
import Footer from "@/components/layout/Footer";
import { countries, genres, years } from "@/data/filterOption";

const MoviesPage = () => {
  const router = useRouter();
  const searchQuery = router.query.search as string | undefined;

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState(searchQuery || "");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);

  /* ================= LOAD MOVIES ================= */
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        setPage(1);

        // FILTER MODE
        if (selectedCountry || selectedGenre || selectedYear) {
          const data = await fetchMoviesByFilters({
            country: selectedCountry,
            genre: selectedGenre,
            year: selectedYear,
          });
          setMovies(data.results || []);
          setHasMore(!!data.results?.length);
          return;
        }

        // SEARCH MODE
        if (searchQuery) {
          const data = await searchMovies(searchQuery);
          setMovies(data.results || []);
          setHasMore(!!data.results?.length);
          return;
        }

        // TRENDING
        const data = await fetchTrendingMovies();
        setMovies(data.results || []);
        setHasMore(true);
      } catch (err) {
        console.error("Failed to load movies", err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [searchQuery, selectedCountry, selectedGenre, selectedYear]);

  /* ================= LOAD MORE ================= */
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
      } else if (searchQuery) {
        data = await searchMovies(searchQuery, nextPage);
      } else {
        data = await fetchTrendingMovies(nextPage);
      }

      if (!data?.results?.length) {
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

  /* ================= SEARCH ================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/movies?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center px-6 py-4 shadow-md">
        <button onClick={() => router.back()} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-2xl font-bold">Movies</h1>
      </div>

      {/* Search & Filters */}
      <div className="px-6 py-6 max-w-7xl mx-auto bg-gray-800 rounded-lg mt-6">
        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSubmit} />

        <div className="flex gap-2 mt-4 flex-wrap">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {loading ? (
          <p>Loading movies...</p>
        ) : movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => {
              const isFavorite = favorites.some(
                (item) => item.id === movie.id && item.media_type === "movie",
              );

              return (
                <div
                  key={movie.id}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {movie.poster_path && (
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      width={300}
                      height={450}
                      className="object-cover"
                    />
                  )}

                  <div className="p-2 flex justify-between items-center">
                    <div>
                      <Link
                        href={`/movies/${movie.id}`}
                        className="font-semibold hover:underline"
                      >
                        {movie.title}
                      </Link>
                      <p className="text-sm text-gray-400">
                        {movie.release_date?.split("-")[0]}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        dispatch(
                          toggleFavorite({
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path,
                            media_type: "movie",
                          }),
                        )
                      }
                    >
                      {isFavorite ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreMovies}
              disabled={loadingMore}
              className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More Movies"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MoviesPage;
