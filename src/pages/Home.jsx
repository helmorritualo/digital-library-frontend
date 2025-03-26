import { useState, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { booksAPI, categoriesAPI, bookmarksAPI } from "../services/api";
import toast from "react-hot-toast";

const BookCard = lazy(() => import("../components/BookCard"));
const Button = lazy(() => import("../components/Button"));
const Input = lazy(() => import("../components/Input"));

const ITEMS_PER_PAGE = 12;

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: booksData = { books: [] }, isLoading: isLoadingBooks } =
    useQuery({
      queryKey: ["books", currentPage, searchQuery, selectedCategory],
      queryFn: async () => {
        try {
          if (searchQuery || selectedCategory) {
            return booksAPI.search(searchQuery, selectedCategory);
          }
          return booksAPI.getAll(currentPage, ITEMS_PER_PAGE);
        } catch {
          return { books: [] }; // Return default structure on error
        }
      },
      keepPreviousData: true,
    });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const { data: bookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => bookmarksAPI.getAll().then((res) => res.data.books),
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleToggleBookmark = async (bookId) => {
    try {
      const isBookmarked = bookmarks.some((book) => book.id === bookId);
      if (isBookmarked) {
        await bookmarksAPI.remove(bookId);
        toast.success("Book removed from bookmarks");
      } else {
        await bookmarksAPI.add(bookId);
        toast.success("Book added to bookmarks");
      }
      refetchBookmarks();
    } catch {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {/* Categories */}
      <Suspense fallback={<div>Loading categories...</div>}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCategory ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory("");
                setCurrentPage(1);
              }}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.category_name
                    ? "primary"
                    : "outline"
                }
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.category_name);
                  setCurrentPage(1);
                }}
              >
                {category.category_name}
              </Button>
            ))}
          </div>
        </div>
      </Suspense>

      {/* Books Grid */}
      <Suspense fallback={<div>Loading books...</div>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingBooks ? (
            <div className="col-span-full text-center py-12">
              Loading books...
            </div>
          ) : !booksData?.books?.length ? (
            <div className="col-span-full text-center py-12">
              No books found. Try adjusting your search or filters.
            </div>
          ) : (
            booksData.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={bookmarks.some((b) => b.id === book.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!isLoadingBooks && booksData?.books?.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={booksData?.books?.length < ITEMS_PER_PAGE}
            >
              Next
            </Button>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default Home;
