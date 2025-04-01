import { useState, lazy, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "@heroicons/react/24/outline";
import { booksAPI, categoriesAPI } from "../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const AdminLayout = lazy(() => import("../../layouts/AdminLayout"));
const Button = lazy(() => import("../../components/Button"));
const Input = lazy(() => import("../../components/Input"));

const BookForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    author: initialData?.author || "",
    category_id: initialData?.category_id || "",
    description: initialData?.description || "",
    book_file: null,
    cover_image: null,
  });
  const [errors, setErrors] = useState({});
  const [previewCover, setPreviewCover] = useState(null);

  // Add effect to handle file preview
  useEffect(() => {
    if (formData.cover_image) {
      const objectUrl = URL.createObjectURL(formData.cover_image);
      setPreviewCover(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [formData.cover_image]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const validateForm = () => {
    const newErrors = {};
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const allowedFileTypes = ["application/pdf"];
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!formData.title) {
      newErrors.title = "Title is required";
    }

    if (!formData.author) {
      newErrors.author = "Author is required";
    }

    // Only validate files if they are provided or if this is a new book
    if (!initialData) {
      if (!formData.book_file) {
        newErrors.book_file = "Book file is required";
      }
      if (!formData.cover_image) {
        newErrors.cover_image = "Cover image is required";
      }
    }

    // Validate files if they are provided
    if (formData.book_file) {
      if (formData.book_file.size > maxFileSize) {
        newErrors.book_file = "File size must not exceed 50MB";
      } else if (!allowedFileTypes.includes(formData.book_file.type)) {
        newErrors.book_file = "File must be in PDF";
      }
    }

    if (formData.cover_image) {
      if (formData.cover_image.size > maxImageSize) {
        newErrors.cover_image = "Image size must not exceed 5MB";
      } else if (!allowedImageTypes.includes(formData.cover_image.type)) {
        newErrors.cover_image = "Image must be in JPEG, PNG, or GIF format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const form = new FormData();

      // Always include text fields
      form.append("title", formData.title);
      form.append("author", formData.author);
      form.append("description", formData.description);

      // Make sure category_id is properly handled
      if (formData.category_id) {
        form.append("category_id", formData.category_id);
      }

      // Only append files if they have been changed or if this is a new book
      if (formData.book_file) {
        form.append("book_file", formData.book_file);
      }
      if (formData.cover_image) {
        form.append("cover_image", formData.cover_image);
      }

      // If this is an update, include the ID
      if (initialData) {
        form.append("id", initialData.id);
      }

      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Title"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          error={errors.title}
        />
        <Input
          label="Author"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          error={errors.author}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
        <Input
          label={`Book File ${
            initialData ? "(Leave empty to keep current file)" : ""
          }`}
          id="book_file"
          name="book_file"
          type="file"
          onChange={handleChange}
          accept=".pdf,.epub,.doc,.docx,.mobi,.rtf,.azw"
          required={!initialData}
          error={errors.book_file}
          help="Allowed formats: PDF, EPUB, DOC, MOBI, RTF, AZW (max 50MB)"
        />
        <Input
          label={`Cover Image ${
            initialData ? "(Leave empty to keep current image)" : ""
          }`}
          id="cover_image"
          name="cover_image"
          type="file"
          onChange={handleChange}
          accept="image/*"
          required={!initialData}
          error={errors.cover_image}
          help="Allowed formats: JPEG, PNG, GIF (max 5MB)"
        />
        {previewCover && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Preview
            </label>
            <img
              src={previewCover}
              alt="Cover Preview"
              className="h-20 w-20 rounded object-cover"
            />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Book" : "Add Book"}
        </Button>
      </div>
    </form>
  );
};

const BookTableRow = ({ book, onEdit, onDelete }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const defaultImagePath = "/book.png";

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const response = await booksAPI.getCover(book.id);
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
  }, [book.id, coverUrl]);

  return (
    <tr key={book.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              src={coverUrl || defaultImagePath}
              alt={book.title}
              className="h-10 w-10 rounded object-cover"
              onError={(e) => {
                e.target.src = defaultImagePath;
                e.target.onerror = null;
              }}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {book.title}
            </div>
            <div className="text-sm text-gray-500">{book.author}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {book.category_name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(book.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(book)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(book.id)}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

const Books = () => {
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: () => booksAPI.getAll().then((res) => res.data.books),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const addBookMutation = useMutation({
    mutationFn: (data) => booksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      setIsAddingBook(false);
      toast.success("Book added successfully");
    },
    onError: (error) => {
      console.error("Add Book Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to add book";
      toast.error(errorMessage);
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => booksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      setEditingBook(null);
      toast.success("Book updated successfully");
    },
    onError: (error) => {
      console.error("Update Book Error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update book";
      toast.error(errorMessage);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id) => booksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      Swal.fire({
        title: "Deleted!",
        text: "Book has been deleted.",
        icon: "success",
      });
    },
    onError: (error) => {
      console.error("Delete Book Error:", error);
      toast.error("Failed to delete book");
    },
  });

  const handleDeleteBook = (bookId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBookMutation.mutate(bookId);
      }
    });
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !searchQuery ||
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || book.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.category_name}>
              {category.category_name}
            </option>
          ))}
        </select>
        <Button
          onClick={(e) => {
            e.preventDefault();
            setIsAddingBook(true);
          }}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Add/Edit Book Form */}
      {(isAddingBook || editingBook) && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h2>
          <BookForm
            onSubmit={(data) =>
              editingBook
                ? updateBookMutation.mutate({ id: editingBook.id, data })
                : addBookMutation.mutate(data)
            }
            initialData={editingBook}
            onCancel={() => {
              setIsAddingBook(false);
              setEditingBook(null);
            }}
          />
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading books...
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No books found.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <BookTableRow
                    key={book.id}
                    book={book}
                    onEdit={setEditingBook}
                    onDelete={handleDeleteBook}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Books;
