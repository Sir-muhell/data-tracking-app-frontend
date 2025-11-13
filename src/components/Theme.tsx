import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Custom hook to manage and persist the dark/light theme state.
 */
const useTheme = () => {
  type Theme = "light" | "dark";

  // Initialize state from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    // Since we cannot rely on local storage access timing in all environments,
    // we'll default to 'light' and let useEffect synchronize on mount.
    // Reading local storage here is usually fine in the browser environment.
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    // Fallback to system preference if no saved theme exists
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Effect to apply the theme class to the document root (<html>)
  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Remove both classes to ensure a clean switch
    root.classList.remove("light", "dark");

    // 2. Add the current theme class
    root.classList.add(theme);

    // 3. Persist the choice
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    // Toggle the theme and trigger the useEffect hook
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};

/**
 * A simple button component to switch between light and dark mode.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-700" />
      )}
    </button>
  );
};

export default ThemeToggle;
