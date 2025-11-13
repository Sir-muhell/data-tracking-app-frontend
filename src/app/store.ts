import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import personsReducer from "../features/persons/personsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persons: personsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, persons: PersonsState}
export type AppDispatch = typeof store.dispatch;
