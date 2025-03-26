import { lazy, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  BookOpenIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { booksAPI, usersAPI, categoriesAPI } from "../../services/api";
import manProfilePic from "../../assets/man.png";
import womanProfilePic from "../../assets/woman.png";

const AdminLayout = lazy(() => import("../../layouts/AdminLayout"));

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
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
  </div>
);

const RecentBookItem = ({ book }) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const defaultImagePath = "/book.png";

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const response = await booksAPI.getCover(book.id);
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = URL.createObjectURL(blob);
        setCoverUrl(url);
      } catch (error) {
        console.error("Error loading cover:", error);
        setCoverUrl(defaultImagePath);
      }
    };

    fetchCover();

    return () => {
      if (coverUrl && coverUrl !== defaultImagePath) {
        URL.revokeObjectURL(coverUrl);
      }
    };
  }, [book.id, coverUrl]);

  return (
    <Link
      key={book.id}
      to={`/books/${book.id}`}
      className="block hover:bg-gray-50 -mx-4 px-4 py-2"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <img
            src={coverUrl || defaultImagePath}
            alt={book.title}
            className="w-10 h-10 object-cover rounded"
            onError={(e) => {
              e.target.src = defaultImagePath;
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{book.title}</p>
          <p className="text-sm text-gray-500">{book.author}</p>
        </div>
      </div>
    </Link>
  );
};

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
  const adminCount = users.filter((user) => user.role === "admin").length;

  const stats = [
    {
      id: 1,
      title: "Librarian",
      value: adminCount,
      icon: UsersIcon,
    },
    {
      id: 2,
      title: "Readers",
      value: readerCount,
      icon: UsersIcon,
    },
    {
      id: 3,
      title: "Total Books",
      value: books.length,
      icon: BookOpenIcon,
    },
    {
      id: 4,
      title: "Categories",
      value: categories.length,
      icon: FolderIcon,
    },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
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
                  {books
                    .slice(0, 5)
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((book) => (
                      <RecentBookItem key={book.id} book={book} />
                    ))}
                </div>
              </div>

              {/* Recent Readers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recently Registered Readers
                </h3>
                <div className="space-y-4">
                  {users
                    .filter((user) => user.role !== "admin")
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .slice(0, 5)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center -mx-4 px-4 py-2"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={
                              user?.gender === "female"
                                ? womanProfilePic
                                : manProfilePic
                            }
                            alt="Profile"
                            className="w-8 h-8 rounded-full
                          object-cover border-2 border-blue-100"
                          />
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
