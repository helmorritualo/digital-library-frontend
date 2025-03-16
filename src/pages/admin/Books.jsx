import { useState, lazy } from "react";
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
    category_name: initialData?.category_name || "",
    description: initialData?.description || "",
    book_file: initialData?.book_file || null,
    cover_image: initialData?.cover_image || null,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value);
      }
    });
    onSubmit(data);
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
        />
        <Input
          label="Author"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category_name"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Book File (.pdf)"
          id="book_file"
          name="book_file"
          type="file"
          onChange={handleChange}
          accept=".pdf,.epub,.doc,.mobi,.rtf,.azw"
          required={!initialData}
        />
        <Input
          label="Cover Image (.jpeg, .png, .gif)"
          id="cover_image"
          name="cover_image"
          type="file"
          onChange={handleChange}
          accept="image/*"
          required={!initialData}
        />
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
          required
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
    onError: () => {
      toast.error("Failed to add book");
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => booksAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      setEditingBook(null);
      toast.success("Book updated successfully");
    },
    onError: () => {
      toast.error("Failed to update book");
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id) => booksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
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
        Swal.fire({
          title: "Deleted!",
          text: "Book has been deleted.",
          icon: "success",
        });
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
        <Button onClick={() => setIsAddingBook(true)}>
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
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={book.cover_image_path}
                            alt={book.title}
                            className="h-10 w-10 rounded object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {book.author}
                          </div>
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingBook(book)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
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
