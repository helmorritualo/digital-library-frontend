import { useState, lazy } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Input = lazy(() => import("../components/Input"));
const Button = lazy(() => import("../components/Button"));

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    gender: "",
    role: "reader", // Automatically set role to reader for new registrations
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Username validation (5-50 characters)
    if (
      !formData.username ||
      formData.username.length < 5 ||
      formData.username.length > 50
    ) {
      newErrors.username = "Username must be between 5 and 50 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (min 8 characters)
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = "Full name is required";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(formData);
      if (!success) {
        setErrors({ submit: "Registration failed. Please try again." });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Create a username (5-50 characters)"
              minLength={5}
              maxLength={50}
              error={errors.username}
            />

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
              />
              <button
                type="button"
                className="absolute right-2 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <Input
              label="Full Name"
              id="full_name"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name (e.g. John Doe)"
              error={errors.full_name}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="gender"
                id="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.gender
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
