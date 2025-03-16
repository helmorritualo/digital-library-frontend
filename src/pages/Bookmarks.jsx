import { useQuery } from "@tanstack/react-query";
import { bookmarksAPI } from "../services/api";
import BookCard from "../components/BookCard";
import toast from "react-hot-toast";

const Bookmarks = () => {
  const {
    data: bookmarks = [],
    isLoading,
    refetch: refetchBookmarks,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => bookmarksAPI.getAll().then((res) => res.data.books),
  });

  const handleToggleBookmark = async (bookId) => {
    try {
      await bookmarksAPI.remove(bookId);
      toast.success("Book removed from bookmarks");
      refetchBookmarks();
    } catch (error) {
      toast.error(`Failed to remove bookmark ${error}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
        <p className="mt-2 text-gray-600">
          Your collection of saved books for quick access.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't bookmarked any books yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse the library and bookmark books you're interested in reading.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isBookmarked={true}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
