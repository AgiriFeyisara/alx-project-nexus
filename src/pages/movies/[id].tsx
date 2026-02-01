import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchMovieDetails, TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";

const MovieDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!movie) return;
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(movie.id));
  }, [movie]);

  useEffect(() => {
    if (!id) return;

    const loadMovie = async () => {
      try {
        const data = await fetchMovieDetails(id as string);
        setMovie(data);

        // Grab the first trailer from the videos array
        const trailer = data.videos?.results.find(
          (v: any) => v.type === "Trailer" && v.site === "YouTube",
        );
        if (trailer) setTrailerKey(trailer.key);
      } catch {
        setError("Unable to load movie details");
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const loadMovie = async () => {
      try {
        const data = await fetchMovieDetails(id as string);
        setMovie(data);
      } catch {
        setError("Unable to load movie details");
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading)
    return <p className="p-6 text-gray-400 text-center">Loading movie...</p>;
  if (error) return <p className="p-6 text-red-500 text-center">{error}</p>;
  if (!movie) return null;

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isFavorite) {
      // Remove from favorites
      const updated = favorites.filter((id: number) => id !== movie.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      // Add to favorites
      favorites.push(movie.id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-black px-6 py-4 shadow-md">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl font-bold"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-center flex-1 truncate">
          {movie.title}
        </h1>
        <div className="w-6" />
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row gap-8">
        <div className="flex flex-col w-full md:w-1/3 gap-4">
          <div className="relative w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={
                movie.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                  : "/placeholder.png"
              }
              alt={movie.title}
              fill
              className="object-cover object-top"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              onClick={() => {
                if (trailerKey) {
                  window.open(
                    `https://www.youtube.com/watch?v=${trailerKey}`,
                    "_blank",
                  );
                } else {
                  alert("Trailer not available");
                }
              }}
            >
              Watch Trailer
            </button>
            {/* This is the favorite button icon */}
            <button
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                isFavorite
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
              onClick={toggleFavorite}
            >
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Title & Meta */}
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-gray-400">
            {movie.release_date?.split("-")[0]} • {movie.runtime} mins •{" "}
            {movie.vote_average}/10
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre: any) => (
              <span
                key={genre.id}
                className="bg-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed mt-2">
              {movie.overview}
            </p>
          </div>

          {/* Cast */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <div className="flex gap-4 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                {movie.credits.cast.slice(0, 10).map((cast: any) => (
                  <div key={cast.id} className="flex-shrink-0 w-24">
                    {cast.profile_path ? (
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={`${TMDB_IMAGE_BASE_URL}${cast.profile_path}`}
                          alt={cast.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    <p className="text-sm mt-1 truncate">{cast.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {cast.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews
          {movie.reviews?.results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Reviews</h2>
              <div className="flex flex-col gap-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                {movie.reviews.results.slice(0, 5).map((review: any) => (
                  <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 italic break-words">
                      "{review.content}"
                    </p>
                    <p className="text-gray-400 mt-2 text-sm">- {review.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
