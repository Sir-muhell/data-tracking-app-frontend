import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { IPerson, IWeeklyReport, IPersonsState } from "../../types";

const initialState: IPersonsState = {
  persons: [],
  allReports: [],
  isLoading: false,
  error: null,
};

export const personsSlice = createSlice({
  name: "persons",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Action after successfully fetching all persons (user or admin view)
    setPersons: (state, action: PayloadAction<IPerson[]>) => {
      state.persons = action.payload;
      state.isLoading = false;
    },
    // Action after successfully creating a new person
    addPerson: (state, action: PayloadAction<IPerson>) => {
      state.persons.unshift(action.payload); // Add to the beginning
      state.isLoading = false;
    },
    // Action to fetch all reports (Admin only)
    setAllReports: (state, action: PayloadAction<IWeeklyReport[]>) => {
      state.allReports = action.payload;
      state.isLoading = false;
    },
    // A placeholder for adding a report (client-side update is complex, often requires re-fetch)
    // For simplicity now, we rely on the backend to confirm success.
    clearData: (state) => {
      state.persons = [];
      state.allReports = [];
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setPersons,
  addPerson,
  setAllReports,
  clearData,
} = personsSlice.actions;

export default personsSlice.reducer;
