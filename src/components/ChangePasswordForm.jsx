import { useState } from "react";
import { profileAPI } from "../services/api";
import Input from "./Input";
import Button from "./Button";
import toast from "react-hot-toast";

const ChangePasswordForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password || formData.new_password.length < 8) {
      newErrors.new_password = "New password must be at least 8 characters";
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
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
      await profileAPI.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      toast.success("Password updated successfully");
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update password";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {errors.submit}
        </div>
      )}

      <Input
        label="Current Password"
        id="current_password"
        name="current_password"
        type="password"
        required
        value={formData.current_password}
        onChange={handleChange}
        error={errors.current_password}
      />

      <Input
        label="New Password"
        id="new_password"
        name="new_password"
        type="password"
        required
        minLength={8}
        value={formData.new_password}
        onChange={handleChange}
        error={errors.new_password}
      />

      <Input
        label="Confirm New Password"
        id="confirm_password"
        name="confirm_password"
        type="password"
        required
        value={formData.confirm_password}
        onChange={handleChange}
        error={errors.confirm_password}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
