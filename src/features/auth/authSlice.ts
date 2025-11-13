import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { IAuthState, ILoginResponse } from "../../types";

// Initial state, checking localStorage for a persisted token/user
const getInitialState = (): IAuthState => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
    const persistedState: IAuthState = JSON.parse(serializedState);
    return {
      ...persistedState,
      isLoading: false, // Ensure loading is false on startup
      error: null, // Clear any previous error
      isAuthenticated: !!persistedState.token, // Revalidate auth based on token existence
    };
  } catch (e) {
    console.error("Could not load state from localStorage", e);
    return {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
};

const initialState: IAuthState = getInitialState();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to handle successful login (traditional or OAuth)
    loginSuccess: (state, action: PayloadAction<ILoginResponse>) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem("authState", JSON.stringify(state));
    },

    // Action to set loading state (e.g., while waiting for API response)
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Action to handle login failure
    loginFailure: (state, action: PayloadAction<string>) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
      localStorage.removeItem("authState");
    },

    // ACTION ADDED: To clear any stored error message
    clearError: (state) => {
      state.error = null;
    },

    // Action to handle logout
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("authState");
    },
  },
});

export const { loginSuccess, setLoading, loginFailure, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
