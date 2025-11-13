import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Users,
  User,
  FileText,
  Search, // <-- IMPORT SEARCH ICON
} from "lucide-react";
import type { AppDispatch, RootState } from "../app/store";
import {
  getUsersWithPeopleRecords,
  fetchPeopleByUserAdmin,
} from "../api/personsService";
import { logout } from "../features/auth/authSlice";
import type { IPerson, IAuthUser } from "../types";
import Navbar from "../components/Navbar";

const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for Step 1: List of users who have created records
  const [users, setUsers] = useState<IAuthUser[]>([]);
  // State for Step 2: People associated with a selected user, stored by userId
  const [peopleByUserId, setPeopleByUserId] = useState<{
    [key: string]: IPerson[];
  }>({});

  // --- NEW: State for search query ---
  const [searchQuery, setSearchQuery] = useState("");

  // UI state for loading and errors
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [loadingPeopleForUser, setLoadingPeopleForUser] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // UI state for expansion and selection
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // --- Authorization Check ---
  if (user?.role !== "admin") {
    // Redirect non-admin users away from this page
    return <Navigate to="/" replace />;
  }

  // --- NEW: Memoized filtering logic for users ---
  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return users;
    }
    return users.filter((u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // --- Handlers ---

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleViewHistory = useCallback(
    (personId: string) => {
      // Navigate to the existing PersonHistoryPage
      navigate(`/persons/${personId}/history`);
    },
    [navigate]
  );

  const toggleUserExpansion = useCallback(
    async (userId: string) => {
      // If the currently expanded user is clicked again, collapse it
      if (expandedUserId === userId) {
        setExpandedUserId(null);
        return;
      }

      setExpandedUserId(userId); // Expand the new user

      // If people for this user haven't been fetched yet, fetch them (Lazy Loading)
      if (!peopleByUserId[userId]) {
        setLoadingPeopleForUser(userId);
        setError(null);
        try {
          // Step 2: Fetch people for the specific user
          const peopleData = await fetchPeopleByUserAdmin(userId);
          setPeopleByUserId((prev) => ({ ...prev, [userId]: peopleData }));
        } catch (err: any) {
          // Axios error handling
          const errorMessage =
            err.response?.data?.message ||
            `Failed to fetch people for user ${userId}.`;
          setError(errorMessage);
        } finally {
          setLoadingPeopleForUser(null);
        }
      }
    },
    [expandedUserId, peopleByUserId]
  );

  // --- Data Fetching (Step 1: Get all users with records) ---
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setError(null);
      try {
        // Step 1: Fetch the list of unique users who manage people
        const usersData = await getUsersWithPeopleRecords();
        setUsers(usersData);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch users who manage records.";
        setError(errorMessage);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // Only load users once on component mount
    if (user?.role === "admin" && users.length === 0) {
      loadUsers();
    }
  }, [user?.role, users.length]);

  // --- Rendering Helpers ---

  // Dark Mode Classes
  const adminPageClasses =
    "min-h-screen bg-gray-50 dark:bg-gray-900  transition-colors duration-300";
  const headerContainerClasses = // Renamed from headerClasses to avoid conflict
    "flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 dark:border-gray-800  p-6 sm:p-10";
  const titleClasses =
    "text-3xl font-extrabold text-indigo-700 dark:text-indigo-400";
  const subtitleClasses = "text-gray-500 dark:text-gray-400 mt-1";
  const loadingTextClasses =
    "text-center text-indigo-600 dark:text-indigo-400 py-8";
  const errorClasses =
    "text-center p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-lg shadow-sm";
  const sectionTitleClasses =
    "text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 ";
  const emptyStateClasses =
    "p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg shadow-sm";

  // --- NEW: Search Bar Classes ---
  const searchBarContainerClasses = "mb-8 mt-5 relative max-w-xl w-full";
  const searchIconClasses =
    "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500";
  const searchInputClasses =
    "w-full py-3 pl-12 pr-4 text-base text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400";

  const UserItem = ({ adminUser }: { adminUser: IAuthUser }) => {
    // FIX: Casting to 'any' to access '_id' to resolve TypeScript error
    const userId = (adminUser as any)._id as string;

    const isExpanded = expandedUserId === userId;
    const people = peopleByUserId[userId] || [];
    const isLoadingPeople = loadingPeopleForUser === userId;

    // Dark mode classes for the user item
    const itemContainerClasses =
      "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-4 transition-colors duration-200";
    const headerButtonClasses =
      "flex justify-between items-center w-full p-5 text-left transition duration-200 hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 rounded-xl";
    const userTitleClasses =
      "text-lg font-bold text-gray-800 dark:text-gray-100";
    const userRoleClasses =
      "text-sm font-medium text-indigo-400 dark:text-indigo-300";
    const collapseTextClasses =
      "text-sm text-gray-500 dark:text-gray-400 font-medium";
    const expandedContentClasses =
      "p-5 pt-0 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl";
    const loadingPeopleClasses =
      "flex justify-center items-center py-4 text-indigo-500 dark:text-indigo-400";
    const personCardClasses =
      "flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700";
    const personNameClasses = "font-semibold text-gray-700 dark:text-gray-200";
    const inviterClasses = "text-sm text-gray-500 dark:text-gray-400";
    const viewReportsButtonClasses =
      "mt-2 sm:mt-0 flex items-center space-x-2 px-3 py-1 text-sm font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition shadow";

    return (
      <div className={itemContainerClasses}>
        {/* User Header */}
        <button
          onClick={() => toggleUserExpansion(userId)}
          className={headerButtonClasses}
        >
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
            <Users className="w-6 h-6 text-indigo-500 dark:text-indigo-300" />
            <span className={userTitleClasses}>{adminUser.username}</span>
            {/* <span className={userRoleClasses}>({adminUser.role})</span> */}
          </div>
          <span className={collapseTextClasses}>
            {isExpanded ? "Collapse" : "View People"}
          </span>
        </button>

        {/* People List (Expanded Content) */}
        {isExpanded && (
          <div className={expandedContentClasses}>
            {isLoadingPeople ? (
              <div className={loadingPeopleClasses}>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading people managed by {adminUser.username}...
              </div>
            ) : people.length > 0 ? (
              <div className="space-y-3 pt-4">
                {people.map((person) => (
                  <div key={person._id} className={personCardClasses}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-3">
                      <User className="w-5 h-5 text-green-500 mb-1 sm:mb-0" />
                      <span className={personNameClasses}>{person.name}</span>
                      <span className={inviterClasses}>
                        Inviter: {person.inviter}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewHistory(person._id)}
                      className={viewReportsButtonClasses}
                      title={`View all reports for ${person.name}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Reports</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-4 text-center text-yellow-700 bg-yellow-50 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-lg text-sm mt-4">
                {adminUser.username} has not added any people yet.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className={adminPageClasses}>
      <Navbar />
      <header className={headerContainerClasses}>
        <div>
          <h1 className={titleClasses}>Admin Dashboard</h1>
          <p className={subtitleClasses}>
            Browse reports organized by the user who created them.
          </p>
        </div>
        {/* Logout button was removed from here, assuming it's in Navbar */}
      </header>
      <div className="p-6 sm:p-10 pt-0">
        {isLoadingUsers && (
          <div className={loadingTextClasses}>
            <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
            Fetching list of all users...
          </div>
        )}
        {error && <p className={errorClasses}>Error: {error}</p>}

        {!isLoadingUsers && users.length > 0 && (
          <>
            {/* --- NEW: SEARCH BAR --- */}
            <div className={searchBarContainerClasses}>
              <Search className={searchIconClasses} />
              <input
                type="text"
                id="search"
                placeholder="Search managing users by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={searchInputClasses}
              />
            </div>

            <h2 className={sectionTitleClasses}>
              Managing Users ({filteredUsers.length} found)
            </h2>
          </>
        )}

        <div className="space-y-4 ">
          {!isLoadingUsers && users.length === 0 && !error && (
            <p className={emptyStateClasses}>
              No users have created any managed people records yet.
            </p>
          )}

          {/* --- NEW: Empty state for search results --- */}
          {!isLoadingUsers && filteredUsers.length === 0 && searchQuery && (
            <p className={emptyStateClasses}>
              No users found matching "{searchQuery}".
            </p>
          )}

          {/* --- Render the filtered list --- */}
          {filteredUsers.map((adminUser) => (
            // FIX: Casting to 'any' for the key prop
            <UserItem key={(adminUser as any)._id} adminUser={adminUser} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
