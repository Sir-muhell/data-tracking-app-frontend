import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";
import { fetchPersons } from "../api/personsService";
import {
  setLoading,
  setError,
  setPersons,
} from "../features/persons/personsSlice";
import { logout } from "../features/auth/authSlice";
import type { IPerson } from "../types";
import WeeklyReportModal from "../components/WeeklyReportModal";
import Navbar from "../components/Navbar"; // IMPORT THE NEW NAVBAR
import {
  Loader2,
  Clock,
  Phone,
  MapPin,
  UserCircle,
  FileText,
  Search, // Import Search icon
} from "lucide-react";

const Dashboard: React.FC = () => {
  // Use `alert()` as a custom modal for now since we cannot use the native window.alert()
  //   const customAlert = (message: string) => {
  //     // This function mimics an alert without using the browser's native alert()
  //     console.log(`Custom Alert: ${message}`);
  //     // In a real app, this would trigger a visible toast or modal component
  //     // For now, we rely on the console log for testing the click handler.
  //   };

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { persons, isLoading, error } = useSelector(
    (state: RootState) => state.persons
  );

  // State for the Weekly Report Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);

  // State for the Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data Fetching Logic ---
  useEffect(() => {
    if (isAuthenticated) {
      const loadPersons = async () => {
        dispatch(setLoading(true));
        try {
          // This call requires the path to ../api/personsService to be correct
          const data = await fetchPersons();
          dispatch(setPersons(data));
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || "Failed to fetch persons.";
          dispatch(setError(errorMessage));
          // If the token is invalid, log out the user
          if (err.response?.status === 401 || err.response?.status === 403) {
            dispatch(logout());
            navigate("/login");
          }
        }
      };
      loadPersons();
    }
  }, [dispatch, isAuthenticated, navigate]);

  // --- Filtering Logic (Memoized for performance) ---
  const filteredPersons = useMemo(() => {
    if (!searchQuery) {
      return persons;
    }

    const query = searchQuery.toLowerCase();

    // Filter against multiple fields: name, phone, address, inviter
    return persons.filter((person) => {
      const nameMatch = person.name.toLowerCase().includes(query);
      const phoneMatch = person.phone.toLowerCase().includes(query);
      const addressMatch = person.address?.toLowerCase().includes(query);
      const inviterMatch = person.inviter.toLowerCase().includes(query);

      return nameMatch || phoneMatch || addressMatch || inviterMatch;
    });
  }, [persons, searchQuery]);

  // --- Handlers ---
  //
  const openReportModal = (person: IPerson) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPerson(null);
  };

  // Handler for viewing history
  const handleViewHistory = (personId: string) => {
    navigate(`/persons/${personId}/history`);
  };

  // --- Rendering Logic ---
  if (!user) return <Navigate to="/login" />;

  // Admin redirect
  if (user.role === "admin") {
    return <Navigate to="/admin/reports" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* 1. Use the new Navbar component */}
      <Navbar />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h5 className="text-[18px] font-bold text-gray-800 dark:text-gray-100">
              Hello, {user.username}
            </h5>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b-2 border-indigo-500 pb-1">
              Your Tracked Contacts ({persons.length})
            </h2>
          </div>
          <Link
            to="/persons/new"
            className="lg:w-fit w-full flex justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95 flex items-center space-x-1"
          >
            <UserCircle className="w-5 h-5" />
            <span>Add New Contacts</span>
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-8 relative max-w-3xl w-full mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={`Search Contacts by name, phone, address, or inviter...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-12 pr-4 text-base text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {isLoading && (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin inline-block text-indigo-600 dark:text-indigo-400 mr-2" />
            <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mt-2">
              Loading tracked persons...
            </p>
          </div>
        )}
        {error && (
          <p className="text-center text-red-600 dark:text-red-300 p-4 bg-red-100 dark:bg-red-900 rounded-lg shadow-sm border border-red-300 dark:border-red-700">
            Error: {error}
          </p>
        )}

        <div className="space-y-4">
          {filteredPersons.length === 0 && !isLoading && !error && (
            <div className="p-5 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-lg shadow-sm italic">
              <p className="font-semibold text-lg mb-1">
                {searchQuery ? "No Results Found" : "Getting Started"}
              </p>
              <p>
                {searchQuery
                  ? `Your search for "${searchQuery}" returned no results. Try a different query.`
                  : 'No persons added yet. Click **"Add New Person"** to begin your tracking efforts!'}
              </p>
            </div>
          )}

          {/* Use filteredPersons for rendering */}
          {filteredPersons.map((person) => (
            <div
              key={person._id}
              className="bg-white dark:bg-gray-800 p-5 shadow-xl rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center border border-gray-200 dark:border-gray-700 transition duration-300 hover:border-indigo-500 dark:hover:border-indigo-400"
            >
              {/* Person Info */}
              <div className="flex-1 mb-4 lg:mb-0 space-y-2 lg:pr-8">
                <p className="text-lg font-extrabold text-gray-900 dark:text-gray-50 flex items-center space-x-2">
                  <UserCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{person.name}</span>
                </p>

                <div className="grid grid-cols-1 gap-x-6 text-sm text-gray-600 dark:text-gray-300">
                  <a
                    className="flex items-center space-x-2 underline"
                    href={`tel:${person.phone}`}
                  >
                    <Phone className="w-4 h-4 text-indigo-500" />
                    <span>{person.phone}</span>
                  </a>
                  <p className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>{person.address || "N/A"}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <UserCircle className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold">Inviter:</span>{" "}
                    {person.inviter}
                  </p>
                  <p className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs">
                      Tracking Since:{" "}
                      {new Date(person.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto mt-4 lg:mt-0">
                {/* Add Weekly Report Button */}
                <button
                  onClick={() => openReportModal(person)}
                  className="flex items-center justify-center space-x-2 w-full lg:w-48 py-2 bg-green-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-green-700 transition duration-150 transform hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Add Report</span>
                </button>

                {/* View History Button (NEW) */}
                <button
                  onClick={() => handleViewHistory(person._id)}
                  className="flex items-center justify-center space-x-2 w-full lg:w-48 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full shadow-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition duration-150 transform hover:scale-[1.02]"
                >
                  <Clock className="w-4 h-4" />
                  <span>View History</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Report Modal */}
        {selectedPerson && (
          <WeeklyReportModal
            isOpen={isModalOpen}
            onClose={closeModal}
            person={selectedPerson}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
