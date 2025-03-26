import axios from "axios";

const BASE_URL = "http://localhost/digital_books";

// Remove unused STORAGE_URL constant
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Helper function to validate API response format
const validateResponse = (response) => {
  const { data } = response;
  if (!data || typeof data.success !== "boolean") {
    throw new Error("Invalid API response format");
  }
  if (!data.success && data.error) {
    throw new Error(data.error);
  }
  return response;
};

// Helper function to construct full URLs for files and images
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  // Extract filename and token
  const filename = path.split("/").pop();
  const token = localStorage.getItem("token");

  // Use the documented API endpoints
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(filename);
  const bookId = path.match(/\/books\/(\d+)\//)?.[1];

  if (!bookId) {
    console.warn("Invalid path format, missing book ID:", path);
    return null;
  }

  const endpoint = isImage
    ? `/books/${bookId}/cover`
    : `/books/${bookId}/download`;

  const fullUrl = `${BASE_URL}${endpoint}`;
  return token ? `${fullUrl}?token=${token}` : fullUrl;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    try {
      // Validate response format except for file downloads
      if (
        !response.config.responseType ||
        response.config.responseType !== "blob"
      ) {
        validateResponse(response);
      }

      // Transform file paths in response
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
    } catch (error) {
      return Promise.reject(error);
    }
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
  getAll: (page = 1, limit = 12) =>
    api.get(`/books/all?page=${page}&limit=${limit}`),
  getById: (id) =>
    api.get(`/books/${id}`).then((res) => {
      if (!res.data || !res.data.book) {
        throw new Error("Book not found");
      }
      return res;
    }),
  search: (query, category) =>
    api.get(
      `/books?q=${encodeURIComponent(query)}${
        category ? `&category=${category}` : ""
      }`
    ),
  create: (formData) => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "book_file" || key === "cover_image") {
          if (value instanceof File) {
            form.append(key, value);
          }
        } else {
          form.append(key, value);
        }
      }
    });
    return api.post("/books", form);
  },
  update: (id, data) => {
    const form = new FormData();

    // Handle regular fields
    const textFields = ["title", "author", "description", "category_id"];
    textFields.forEach((field) => {
      if (
        data[field] !== null &&
        data[field] !== undefined &&
        data[field] !== ""
      ) {
        // Convert to string for consistency
        form.append(field, String(data[field]));
      }
    });

    // Handle file fields
    if (data.book_file instanceof File) {
      form.append("book_file", data.book_file);
    }
    if (data.cover_image instanceof File) {
      form.append("cover_image", data.cover_image);
    }

    // Use the correct endpoint
    return api.put(`/books/${id}`, form);
  },
  delete: (id) => api.delete(`/books/${id}`),
  download: (id) =>
    api
      .get(`/books/${id}/download`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      })
      .then((response) => {
        // Ensure proper content type is set
        if (!response.headers["content-type"]?.includes("application/pdf")) {
          throw new Error("Invalid file format. Expected PDF.");
        }
        return response;
      }),
  getCover: (id) =>
    api.get(`/books/${id}/cover`, {
      responseType: "blob",
      headers: {
        Accept: "image/*",
      },
    }),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getBooks: (categoryName) =>
    api.get(`/categories/books/${encodeURIComponent(categoryName)}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data), // Send data directly without transforming
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
