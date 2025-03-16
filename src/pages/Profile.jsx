import { useState, lazy } from "react";
import { useAuth } from "../contexts/AuthContext";

const Input = lazy(() => import("../components/Input"));
const Button = lazy(() => import("../components/Button"));
const ChangePasswordForm = lazy(() => import("../components/ChangePasswordForm"));

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    full_name: user?.full_name || "",
    gender: user?.gender || "",
    contact_number: user?.contact_number || "",
    address: user?.address || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.username ||
      formData.username.length < 5 ||
      formData.username.length > 50
    ) {
      newErrors.username = "Username must be between 5 and 50 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.full_name) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    // Contact number and address are required for admin users
    if (user?.role === "admin") {
      if (!formData.contact_number) {
        newErrors.contact_number = "Contact number is required for admin users";
      }
      if (!formData.address) {
        newErrors.address = "Address is required for admin users";
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await updateProfile(user.id, formData);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update profile";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            {!isEditing && !isChangingPassword && (
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                >
                  Change Password
                </Button>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Username"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={5}
                  maxLength={50}
                  error={errors.username}
                />
                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={errors.email}
                />
                <Input
                  label="Full Name"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  error={errors.full_name}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
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
                <Input
                  label={`Contact Number${user?.role === "admin" ? " *" : ""}`}
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required={user?.role === "admin"}
                  error={errors.contact_number}
                />
                <Input
                  label={`Address${user?.role === "admin" ? " *" : ""}`}
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required={user?.role === "admin"}
                  error={errors.address}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : isChangingPassword ? (
            <ChangePasswordForm
              onSuccess={() => setIsChangingPassword(false)}
              onCancel={() => setIsChangingPassword(false)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1 text-sm text-gray-900">{user?.full_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Contact Number
                </h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.contact_number ? user.contact_number : "Not provided"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.address ? user.address : "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
