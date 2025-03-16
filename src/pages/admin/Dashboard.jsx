import { lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  BookOpenIcon,
  FolderIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { booksAPI, usersAPI, categoriesAPI } from "../../services/api";

const AdminLayout = lazy(() => import("../../layouts/AdminLayout"));

const StatCard = ({ title, value, icon: Icon, to }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="ml-5">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="mt-1">
          <p className="text-2xl font-semibold text-blue-600">{value}</p>
        </div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersAPI.getAll().then((res) => res.data.users),
  });

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: () => booksAPI.getAll().then((res) => res.data.books),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.getAll().then((res) => res.data.categories),
  });

  const readerCount = users.filter((user) => user.role === "reader").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: UsersIcon,
      to: "/admin/users",
    },
    {
      title: "Total Books",
      value: books.length,
      icon: BookOpenIcon,
      to: "/admin/books",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: FolderIcon,
      to: "/admin/categories",
    },
    {
      title: "Readers",
      value: readerCount,
      icon: ChartBarIcon,
      to: "/admin/users",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Books */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recently Added Books
                </h3>
                <div className="space-y-4">
                  {books.slice(0, 5).map((book) => (
                    <Link
                      key={book.id}
                      to={`/books/${book.id}`}
                      className="block hover:bg-gray-50 -mx-4 px-4 py-2"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            src={book.cover_image_path}
                            alt={book.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {book.title}
                          </p>
                          <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recently Registered Users
                </h3>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center -mx-4 px-4 py-2"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
