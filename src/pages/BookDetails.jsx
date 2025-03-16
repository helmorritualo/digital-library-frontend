import { useState, useEffect, lazy } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookmarkIcon as BookmarkOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolid } from "@heroicons/react/24/solid";
import { booksAPI, bookmarksAPI } from "../services/api";
import toast from "react-hot-toast";

const Button = lazy(() => import("../components/Button"));

const BookDetails = () => {
  const { id } = useParams();
  const [showContent, setShowContent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const {
    data: book,
    isLoading: isLoadingBook,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => booksAPI.getById(id).then((res) => res.data.book),
    retry: false,
    enabled: !!id,
  });

  const { data: bookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => bookmarksAPI.getAll().then((res) => res.data.books),
  });

  const isBookmarked = bookmarks.some((b) => b.id === Number(id));

  // Clean up the object URL when component unmounts or when we hide content
  useEffect(() => {
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [pdfObjectUrl]);

  // Reset PDF state when toggling content visibility
  useEffect(() => {
    if (!showContent && pdfObjectUrl) {
      URL.revokeObjectURL(pdfObjectUrl);
      setPdfObjectUrl(null);
      setPdfBlob(null);
    }
  }, [showContent, pdfObjectUrl]);

  // Fetch PDF when showing content
  useEffect(() => {
    if (showContent && book?.file_path && !pdfBlob) {
      fetchPdf();
    }
  }, [showContent, book?.file_path, pdfBlob]);

  const fetchPdf = async () => {
    try {
      setPdfError(null);
      const response = await booksAPI.download(id);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create an object URL from the blob
      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfObjectUrl(url);
    } catch (error) {
      console.error("Failed to fetch PDF:", error);
      setPdfError("Failed to load PDF. Try downloading instead.");
      toast.error("Failed to load PDF. Try downloading instead.");
    }
  };

  const handleToggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await bookmarksAPI.remove(id);
        toast.success("Book removed from bookmarks");
      } else {
        await bookmarksAPI.add(id);
        toast.success("Book added to bookmarks");
      }
      refetchBookmarks();
    } catch (error) {
      toast.error(`Failed to update bookmark${error}`);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // If we already have the blob, use it directly
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${book.title}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Download started successfully");
        setIsDownloading(false);
        return;
      }

      // Otherwise, fetch the PDF
      const response = await booksAPI.download(id);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get the filename from Content-Disposition header or fallback to book title
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `${book.title}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Download started successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.response?.data?.error || "Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoadingBook) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-gray-600">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Book not found
          </h2>
          <p className="text-gray-600 mb-8">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Book Cover */}
          <div className="md:w-1/3">
            <div className="aspect-[3/4] relative">
              <img
                src={book.cover_image_path || "/placeholder-book.jpg"}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-book.jpg";
                  e.target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* Book Info */}
          <div className="p-6 md:w-2/3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              </div>
              <button
                onClick={handleToggleBookmark}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isBookmarked ? (
                  <BookmarkSolid className="w-6 h-6 text-blue-600" />
                ) : (
                  <BookmarkOutline className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Details
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Category
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {book.category_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Added on
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(book.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="pt-4 space-x-4">
                <Button onClick={() => setShowContent(!showContent)}>
                  {showContent ? "Hide Content" : "Read Book"}
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="outline"
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom PDF Viewer */}
        {showContent && book.file_path && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">PDF Viewer</div>
            </div>
            <div className="flex justify-center">
              {pdfError ? (
                <div className="p-8 text-center text-red-600">
                  {pdfError}
                  <div className="mt-4">
                    <Button onClick={fetchPdf} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : !pdfObjectUrl ? (
                <div className="p-8 text-center">
                  <div className="mb-4">Loading PDF...</div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {/* PDF Viewer */}
                  <div className="w-full max-w-4xl h-screen max-h-[600px] border border-gray-300 rounded">
                    <iframe
                      src={pdfObjectUrl}
                      className="w-full h-full"
                      title={`${book.title} PDF`}
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    If the PDF doesn't display correctly, try using the download
                    button.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
