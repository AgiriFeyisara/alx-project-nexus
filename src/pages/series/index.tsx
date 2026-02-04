import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleFavorite } from "@/store/favoritesSlice";
import Image from "next/image";

import {
  fetchTrendingTV,
  searchTV,
  fetchTVByFilters,
  TMDB_IMAGE_BASE_URL,
} from "@/lib/tmdb";

import SearchBar from "@/components/home/SearchBar";
import Footer from "@/components/layout/Footer";
import { countries, genres, years } from "@/data/filterOption";

const SeriesPage = () => {
  const router = useRouter();
  const searchQuery = router.query.search as string | undefined;

  const [series, setSeries] = useState<any[]>([]);
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

  useEffect(() => {
    const loadSeries = async () => {
      try {
        setLoading(true);
        setPage(1);

        if (selectedCountry || selectedGenre || selectedYear) {
          const data = await fetchTVByFilters({
            country: selectedCountry,
            genre: selectedGenre,
            year: selectedYear,
          });
          setSeries(data.results || []);
          setHasMore(!!data.results?.length);
          return;
        }

        if (searchQuery) {
          const data = await searchTV(searchQuery);
          setSeries(data.results || []);
          setHasMore(!!data.results?.length);
          return;
        }

        const data = await fetchTrendingTV();
        setSeries(data.results || []);
        setHasMore(true);
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [searchQuery, selectedCountry, selectedGenre, selectedYear]);

  const loadMoreSeries = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    let data;

    if (selectedCountry || selectedGenre || selectedYear) {
      data = await fetchTVByFilters({
        country: selectedCountry,
        genre: selectedGenre,
        year: selectedYear,
        page: nextPage,
      });
    } else if (searchQuery) {
      data = await searchTV(searchQuery, nextPage);
    } else {
      data = await fetchTrendingTV(nextPage);
    }

    if (!data?.results?.length) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    setSeries((prev) => [...prev, ...data.results]);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/series?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      <div className="flex items-center px-6 py-4 shadow-md">
        <button onClick={() => router.back()} className="text-2xl mr-4">
          ←
        </button>
        <h1 className="text-2xl font-bold">TV Series</h1>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto bg-gray-800 rounded-lg mt-6">
        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSubmit} />
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {loading ? (
          <p>Loading series...</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {series.map((tv) => {
              const isFavorite = favorites.some(
                (item) => item.id === tv.id && item.media_type === "tv",
              );

              return (
                <div key={tv.id} className="bg-gray-900 rounded-lg">
                  {tv.poster_path && (
                    <Image
                      src={`${TMDB_IMAGE_BASE_URL}${tv.poster_path}`}
                      alt={tv.name}
                      width={300}
                      height={450}
                    />
                  )}

                  <div className="p-2 flex justify-between items-center">
                    <Link href={`/series/${tv.id}`} className="font-semibold">
                      {tv.name}
                    </Link>

                    <button
                      onClick={() =>
                        dispatch(
                          toggleFavorite({
                            id: tv.id,
                            title: tv.name,
                            poster_path: tv.poster_path,
                            media_type: "tv",
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

        {hasMore && !loading && (
          <button
            onClick={loadMoreSeries}
            className="mt-8 block mx-auto bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Load More Series
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SeriesPage;
