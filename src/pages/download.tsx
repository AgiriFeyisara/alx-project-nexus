import { useRouter } from "next/router";
import Link from "next/link";

const Download = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center px-6 py-4 shadow-md bg-gray-800">
        <button
          onClick={() => router.back()}
          className="text-white text-2xl font-bold mr-4 hover:opacity-80"
        >
          ←
        </button>
        <h1 className="text-xl md:text-2xl font-bold">
          How to Get Movie Recommendations
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-300 mb-6">
          Follow these simple steps to explore movie and TV show recommendations
          on our platform.
        </p>

        {/* Steps Card */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 font-bold">
                1
              </span>
              <p>
                <strong>Search or Browse:</strong> Use the search bar or browse
                by category to find a movie or TV show.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 font-bold">
                2
              </span>
              <p>
                <strong>Open Details Page:</strong> Click on a movie poster to
                view full details.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 font-bold">
                3
              </span>
              <p>
                <strong>Watch Trailer:</strong> Tap the <em>Watch Trailer</em>{" "}
                button under the poster to be redirected to YouTube.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 font-bold">
                4
              </span>
              <p>
                <strong>Explore Quality:</strong> View different video quality
                options where available.
              </p>
            </li>

            <li className="flex gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 font-bold">
                5
              </span>
              <p>
                <strong>Add to Favorites:</strong> Save movies you like by
                adding them to your favorites list.
              </p>
            </li>
          </ol>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-gray-300">
          Need more assistance? Visit our{" "}
          <Link
            href="/contact"
            className="text-red-500 font-semibold hover:underline"
          >
            Contact Page
          </Link>{" "}
          to send us an email.
        </p>
      </div>
    </div>
  );
};

export default Download;
