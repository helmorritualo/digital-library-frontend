import { useState, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "@heroicons/react/24/outline";
import { categoriesAPI } from "../../services/api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const AdminLayout = lazy(() => import("../../layouts/AdminLayout"));
const Button = lazy(() => import("../../components/Button"));
const Input = lazy(() => import("../../components/Input"));

const CategoryForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    category_name: initialData?.category_name || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category_name.trim()) {
      newErrors.category_name = "Category name is required";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Category Name"
        id="category_name"
        name="category_name"
        value={formData.category_name}
        onChange={handleChange}
        required
        error={errors.category_name}
      />
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (data) => categoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setIsAddingCategory(false);
      toast.success("Category added successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to add category";
      toast.error(errorMessage);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to update category";
      toast.error(errorMessage);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      Swal.fire({
        title: "Deleted!",
        text: "Category has been deleted.",
        icon: "success",
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to delete category";
      toast.error(errorMessage);
    },
  });

  const handleDeleteCategory = (categoryId) => {
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
        deleteCategoryMutation.mutate(categoryId);
      }
    });
  };

  const filteredCategories = categories.filter(
    (category) =>
      !searchQuery ||
      category.category_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            setIsAddingCategory(true);
          }}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Add/Edit Category Form */}
      {(isAddingCategory || editingCategory) && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <CategoryForm
            onSubmit={(data) =>
              editingCategory
                ? updateCategoryMutation.mutate({
                    id: editingCategory.id,
                    data,
                  })
                : addCategoryMutation.mutate(data)
            }
            initialData={editingCategory}
            onCancel={() => {
              setIsAddingCategory(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.category_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
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

export default Categories;
