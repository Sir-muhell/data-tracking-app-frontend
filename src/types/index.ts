// --- Backend Data Interfaces ---

// Interface for the User object returned upon login
export interface IAuthUser {
  id: string;
  username: string;
  role: "user" | "admin";
}

// Interface for the successful Login API response
export interface ILoginResponse {
  token: string;
  user: IAuthUser;
}

// Interface for a Person entry
export interface IPerson {
  _id: string;
  name: string;
  phone: string;
  address: string;
  inviter: string;
  notes: string;
  createdBy: string | IAuthUser; // Can be ObjectId string or populated User object
  createdAt: string;
  updatedAt: string;
}

// Interface for a Weekly Report entry
export interface IWeeklyReport {
  _id: string;
  person: string | IPerson;
  contacted: boolean;
  response: string;
  weekOf: string;
  reportedBy: string | IAuthUser;
  createdAt: string;
  updatedAt: string;
}

// --- Redux State Interface ---

// Interface for the Auth State slice
export interface IAuthState {
  token: string | null;
  user: IAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Add this interface to src/types/index.ts
export interface IPersonsState {
  persons: IPerson[];
  allReports: IWeeklyReport[]; // Used only by admin
  isLoading: boolean;
  error: string | null;
}
