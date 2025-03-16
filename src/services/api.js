import axios from "axios";

const BASE_URL = "http://localhost/digital_books";
const STORAGE_URL = `${BASE_URL}/storage/uploads`;

const api = axios.create({
  baseURL: BASE_URL,
});

// Helper function to construct full URLs for files and images
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // Extract filename from path
  const filename = path.split("/").pop();
  const token = localStorage.getItem("token");

  // Determine if it's a book file or cover image based on file extension
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(filename);

  // Construct the appropriate storage URL with authentication token
  const baseUrl = isImage
    ? `${STORAGE_URL}/book_covers/${filename}`
    : `${STORAGE_URL}/books/${filename}`;

  // Append token as query parameter for authenticated access
  return token ? `${baseUrl}?token=${token}` : baseUrl;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Transform file paths in the response to full URLs
    if (response.data?.book) {
      response.data.book = {
        ...response.data.book,
        cover_image_path: getFullUrl(response.data.book.cover_image_path),
        file_path: getFullUrl(response.data.book.file_path),
      };
    }
    if (response.data?.books) {
      response.data.books = response.data.books.map((book) => ({
        ...book,
        cover_image_path: getFullUrl(book.cover_image_path),
        file_path: getFullUrl(book.file_path),
      }));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const booksAPI = {
  getAll: () => api.get("/books/all"),
  getById: (id) =>
    api.get(`/books/${id}`).then((res) => {
      if (!res.data || !res.data.book) {
        throw new Error("Book not found");
      }
      return { data: { book: res.data.book } };
    }),
  search: (query) => api.get(`/books?q=${encodeURIComponent(query)}`),
  create: (formData) => api.post("/books", formData),
  update: (id, formData) => api.put(`/books/${id}`, formData),
  delete: (id) => api.delete(`/books/${id}`),
  download: (id) =>
    api.get(`/books/${id}/download`, {
      responseType: "blob",
      headers: {
        Accept:
          "application/pdf",
      },
    }),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getBooks: (categoryName) => api.get(`/categories/books/${categoryName}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const bookmarksAPI = {
  getAll: () => api.get("/bookmarks"),
  add: (id) => api.post(`/bookmarks/${id}`),
  remove: (id) => api.delete(`/bookmarks/${id}`),
};

export const usersAPI = {
  getAll: () => api.get("/users"),
  delete: (id) => api.delete(`/users/${id}`),
};

export const profileAPI = {
  getUserProfile: (id, data) => api.get(`/profile/${id}`, data),
  update: (id, data) => api.put(`/profile/${id}`, data),
  changePassword: (data) => api.post("/users/change-password", data),
};

export default api;
