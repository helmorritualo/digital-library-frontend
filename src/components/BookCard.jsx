import { memo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { booksAPI } from "../services/api";

const BookCard = memo(({ book, isBookmarked, onToggleBookmark }) => {
  const { id, title, author, category_name } = book;
  const [coverUrl, setCoverUrl] = useState(null);
  const defaultImagePath = "/book.png";

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const response = await booksAPI.getCover(id);
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = URL.createObjectURL(blob);
        setCoverUrl(url);
      } catch (error) {
        console.error("Error loading cover:", error);
        setCoverUrl(defaultImagePath);
      }
    };

    fetchCover();

    return () => {
      if (coverUrl && coverUrl !== defaultImagePath) {
        URL.revokeObjectURL(coverUrl);
      }
    };
  }, [id, coverUrl]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/books/${id}`} className="block">
        <div className="aspect-w-3 aspect-h-4 relative">
          <img
            src={coverUrl || defaultImagePath}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={(e) => {
              e.target.src = defaultImagePath;
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="p-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-gray-500">{author}</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category_name}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-2 pb-1.5">
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleBookmark(id);
          }}
          className="text-gray-500 hover:text-blue-600 transition-colors"
          aria-label={
            isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
          }
        >
          {isBookmarked ? (
            <BookmarkSolid className="h-4 w-4" />
          ) : (
            <BookmarkOutline className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
});

BookCard.displayName = "BookCard";

export default BookCard;
