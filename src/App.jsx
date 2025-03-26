import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";

// Layouts
import MainLayout from "./layouts/MainLayout";

const LoadingAnimation = lazy(() => import("./components/LoadingAnimation"));

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminBooks from "./pages/admin/Books";
import AdminCategories from "./pages/admin/Categories";

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
          <Suspense fallback={<LoadingAnimation />}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="bookmarks" element={<Bookmarks />} />
                <Route path="profile" element={<Profile />} />

                <Route path="admin">
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
