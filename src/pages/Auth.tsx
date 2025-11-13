import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";

// Restored Redux imports
import {
  loginFailure,
  loginSuccess,
  setLoading,
  clearError, // Added utility for clearing errors
} from "../features/auth/authSlice";

// Restored service import
import { loginUser, registerUser, loginWithGoogle } from "../api/authService";
// import type { ILoginResponse } from "../types"; // ILoginResponse is now implicitly handled by authService

// Extend the global Window object to include the Google Identity Services object
declare global {
  interface Window {
    google: any;
  }
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // --- Google Sign-In Handler ---
  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;

    if (!idToken) {
      dispatch(loginFailure("Google Sign-In failed to return a token."));
      return;
    }

    dispatch(setLoading(true));
    dispatch(clearError()); // Clear any previous errors

    try {
      // 3. Send the ID Token to your external backend for verification
      const loginResponse = await loginWithGoogle(idToken);
      dispatch(loginSuccess(loginResponse));
      setSuccessMessage("Google Sign-In successful!");
    } catch (err: any) {
      console.error("Google login error:", err);
      // Determine the error message from the response structure
      const errorMessage =
        err.response?.data?.message ||
        "Failed to verify Google token with backend.";
      dispatch(loginFailure(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handles traditional navigation after a successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // --- Initialize Google Sign-In ---
  useEffect(() => {
    // Only initialize and render the button if we are in Login mode and the Google script is loaded
    if (isLogin && typeof window.google !== "undefined") {
      // 1. Initialize the Google client
      window.google.accounts.id.initialize({
        // ⚠️ IMPORTANT: USING YOUR PROVIDED CLIENT ID ⚠️
        client_id:
          "874119917776-50gdl2f2css4r8tdou6rvggm3hrfviqn.apps.googleusercontent.com",
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      // 2. Render the Google button into the container element
      window.google.accounts.id.renderButton(
        document.getElementById("google-sign-in-button"),
        {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "round", // Use a defined shape
          width: "auto", // Define a width
        }
      );
    }

    return () => {
      if (typeof window.google !== "undefined") {
        window.google.accounts.id.cancel();
      }
    };
  }, [isLogin, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearError());
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const response = await loginUser({ username, password });
        dispatch(loginSuccess(response));
      } else {
        await registerUser({ username, password });
        setSuccessMessage("Registration successful! Please log in.");
        setIsLogin(true);
        setUsername("");
        setPassword("");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An unexpected error occurred. Please check your network.";
      dispatch(loginFailure(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8 transform hover:scale-[1.01] transition-transform duration-300 border border-gray-200 dark:border-gray-700">
        <h2 className="text-4xl font-extrabold text-center text-indigo-600 dark:text-indigo-400 mb-8">
          {isLogin ? "Welcome Back" : "Start Tracking"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message Display */}
          {successMessage && (
            <div className="p-4 text-sm text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-100 rounded-lg flex justify-between items-center transition-opacity duration-300">
              {successMessage}
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-700 dark:text-green-100 font-bold ml-4"
              >
                &times;
              </button>
            </div>
          )}

          {/* Input: Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
              required
            />
          </div>

          {/* Input: Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition duration-200"
              required
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-100 rounded-lg">
              Error: {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg shadow-lg text-lg font-semibold text-white transition duration-300 transform ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            }`}
          >
            {isLoading
              ? isLogin
                ? "Signing In..."
                : "Creating Account..."
              : isLogin
              ? "Sign In"
              : "Register"}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Need an account?" : "Have an account already?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                dispatch(clearError()); // Clear error on switch
                setSuccessMessage(null);
                setUsername("");
                setPassword("");
              }}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none"
            >
              {isLogin ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Google Login Section (Renders the GIS button) */}
        {isLogin && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  OR
                </span>
              </div>
            </div>
            {/* Placeholder Div: GIS will render the button here */}

            <div
              id="google-sign-in-button"
              className="w-full flex justify-center"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
