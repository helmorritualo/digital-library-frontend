import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { lazy } from "react";

// Layouts
const MainLayout = lazy(() => import("./layouts/MainLayout"));

// Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminBooks = lazy(() => import("./pages/admin/Books"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));

import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
      refetchOnMount: "always",
      suspense: true, // Enable React Suspense mode
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="profile" element={<Profile />} />

              {/* Admin Routes */}
              <Route path="admin">
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
