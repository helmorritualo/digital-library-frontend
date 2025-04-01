import { useState, Suspense, lazy, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { booksAPI, categoriesAPI, bookmarksAPI } from "../services/api";
import toast from "react-hot-toast";

const BookCard = lazy(() => import("../components/BookCard"));
const Button = lazy(() => import("../components/Button"));
const Input = lazy(() => import("../components/Input"));

const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: booksData = { books: [] }, isLoading: isLoadingBooks } =
    useQuery({
      queryKey: ["books", searchQuery, selectedCategory],
      queryFn: async () => {
        try {
          if (selectedCategory && !searchQuery) {
            // Use the category-specific endpoint
            return categoriesAPI
              .getBooks(selectedCategory)
              .then((res) => res.data);
          } else if (searchQuery) {
            // Use search endpoint with optional category parameter
            return booksAPI
              .search(searchQuery, selectedCategory)
              .then((res) => res.data);
          } else {
            // Get all books
            return booksAPI.getAll().then((res) => res.data);
          }
        } catch (error) {
          console.error("Error fetching books:", error);
          return { books: [] }; // Return default structure on error
        }
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000, // Data remains fresh for 1 minute
    });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
    refetchOnWindowFocus: false,
    staleTime: 300000, // Categories data remains fresh for 5 minutes
  });

  const { data: bookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () =>
      bookmarksAPI.getAll().then((res) => {
        // Ensure we extract the books array properly
        return res.data.books || [];
      }),
    refetchOnWindowFocus: false,
    staleTime: 60000, // Bookmarks data remains fresh for 1 minute
  });

  const bookmarkedBooks = Array.isArray(bookmarks) ? bookmarks : [];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(inputValue);
  };

  const handleCategorySelect = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
  }, []);

  const handleToggleBookmark = async (bookId) => {
    try {
      const isBookmarked = bookmarkedBooks.some((book) => book.id === bookId);
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
              onClick={() => handleCategorySelect("")}
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
                onClick={() => handleCategorySelect(category.category_name)}
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
                isBookmarked={bookmarkedBooks.some((b) => b.id === book.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default Home;
