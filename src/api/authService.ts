import axiosInstance from "./axiosInstance";
import type { ILoginResponse, IAuthUser } from "../types";

// Type for the login/register payload
interface IAuthPayload {
  username: string;
  password?: string; // Password is optional for some flows but required for traditional
}

/**
 * Handles the traditional username/password login.
 * @param data - { username, password }
 * @returns ILoginResponse (token and user info)
 */
export const loginUser = async (
  data: IAuthPayload
): Promise<ILoginResponse> => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

/**
 * Handles user registration.
 * @param data - { username, password }
 * @returns Success message
 */
export const registerUser = async (
  data: IAuthPayload
): Promise<{ message: string }> => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

/**
 * Initiates the Google OAuth flow (client-side redirection).
 * Note: The actual redirect is handled by the browser.
 */
export const loginWithGoogle = async (idToken: string) => {
  // 1. Define the API endpoint on your external backend
  const endpoint = "/auth/google/verify-token"; // Choose an appropriate endpoint

  // 2. Make a POST request, sending the ID Token in the request body
  // Your backend will use the Firebase Admin SDK to verify this token.
  try {
    const response = await axiosInstance.post(endpoint, {
      idToken: idToken,
    });

    // The response should contain your external JWT/session data
    return response.data;
  } catch (error) {
    // Re-throw the error so Redux can catch it
    throw error;
  }
};

// You might also need a function to verify the user from the Google callback if you return a JWT
// export const verifyGoogleLogin = async (token: string): Promise<ILoginResponse> => {
//   // Implementation depends on how you handle the backend callback redirect.
//   // If the backend redirects with a token in the URL or a cookie, this function
//   // might not be necessary, or it might just read the token and update Redux.
// };
