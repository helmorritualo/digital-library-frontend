import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { profileAPI } from "../services/api";
import axios from "axios";
import LoadingAnimation from "../components/LoadingAnimation";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        const response = await axios.post(
          "http://localhost/digital_books/auth/login",
          {
            username,
            password,
          }
        );

        if (response.data.success) {
          const { user: userData, token } = response.data;
          localStorage.setItem("token", token);

          // Fetch complete user profile after successful login
          const profileResponse = await profileAPI.getUserProfile(userData.id, userData);

          const completeUserData = profileResponse.data.user || userData;
          localStorage.setItem("user", JSON.stringify(completeUserData));
          setUser(completeUserData);

          if (completeUserData.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
          return true;
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Login failed");
        return false;
      }
    }, 
    [navigate]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const response = await axios.post(
          "http://localhost/digital_books/auth/register",
          userData
        );

        if (response.data.success) {
          toast.success(
            response.message || "Registration successful! Please login."
          );
          navigate("/login");
          return true;
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Registration failed");
        return false;
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const updateProfile = useCallback(
    async (userId, userData) => {
      try {
        const response = await profileAPI.update(userId, userData);

        if (response.data.success) {
          const updatedUser = { ...user, ...userData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          toast.success(response.message || "Profile updated successfully");
          return true;
        }
        return false;
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to update profile");
        return false;
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, login, register, logout, updateProfile]
  );

  if (loading) {
    return <LoadingAnimation/>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
