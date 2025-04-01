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
  getAll: () => api.get(`/books/all?`),
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

    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      return api.put(`/books/${id}`, data);
    }

    // Otherwise, create new FormData from object
    Object.entries(data).forEach(([key, value]) => {
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
