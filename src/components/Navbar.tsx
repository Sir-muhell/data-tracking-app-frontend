import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, LogOut, User as UserIcon, Home } from "lucide-react";
// import ThemeToggle from "./Theme";
import { logout } from "../features/auth/authSlice";
import type { AppDispatch, RootState } from "../app/store";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // Assuming RootState and AppDispatch are correctly defined and imported from '../app/store'
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    // This action requires the path to '../features/auth/authSlice' to be correct
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-xl p-4 md:p-6  border-b-4 border-indigo-500 dark:border-indigo-400 mb-8 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo and App Title */}
        <Link to="/" className="flex items-center space-x-3 group">
          {/* <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:rotate-12" /> */}
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-50 transition-colors duration-300">
            Follow Up
          </h1>
        </Link>

        {/* Navigation and User Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Nav Links (Dashboard Link) */}
          <Link
            to="/"
            className="hidden sm:flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-150"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          {/* Theme Toggle - Requires './ThemeToggle' to be resolved */}
          {/* <ThemeToggle /> */}

          {/* User Info */}
          {user && (
            <div className="hidden sm:flex items-center space-x-2 border-l pl-4 border-gray-200 dark:border-gray-700">
              <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {user.username}
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400">
                  ({user.role})
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full text-white bg-red-600 hover:bg-red-700 transition duration-200 shadow-md transform hover:scale-[1.02] active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
