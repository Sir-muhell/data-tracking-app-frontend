import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";
import { fetchReportsByPersonId } from "../api/personsService";
import type { IWeeklyReport } from "../types";

// Component to display the report history for a single person
const PersonHistoryPage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [reports, setReports] = useState<IWeeklyReport[]>([]);
  const [personName, setPersonName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) return <Navigate to="/login" />;

  // If no personId, redirect to dashboard (safety check)
  if (!personId) {
    return <Navigate to="/" />;
  }

  // Fetch reports on component mount
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch reports.
        const result: { personName: string; reports: IWeeklyReport[] } =
          (await fetchReportsByPersonId(personId)) as any;

        setPersonName(result.personName);
        setReports(result.reports);
      } catch (err: any) {
        console.error("Error loading reports:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to fetch reports. Ensure the Person ID is valid.";
        setError(errorMessage);

        // Handle unauthorized or not found errors
        if (
          err.response?.status === 404 ||
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          // If the person ID is invalid or the user is unauthorized, redirect them.
          // Note: Since we check isAuthenticated above, this mainly handles invalid IDs or specific auth failures.
          navigate("/", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [personId, navigate, dispatch]);

  // Helper to format the week date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --- Dark Mode Utility Classes ---
  const pageContainer =
    "min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300";
  const headerContainer =
    "flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-gray-200 dark:border-gray-800 mb-8";
  const titleText = "text-3xl font-extrabold text-gray-900 dark:text-gray-100";
  const subtitleText = "text-gray-500 dark:text-gray-400";
  const backButtonClasses =
    "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition duration-150 flex items-center mb-2 font-medium";
  const cardContainer =
    "bg-white dark:bg-gray-800 p-6 shadow-xl rounded-xl border-t-4 border-indigo-500 transition duration-300 hover:shadow-2xl dark:hover:shadow-indigo-500/10";
  const noteBlock =
    "bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300";
  // --- End Dark Mode Utility Classes ---

  return (
    <div className={pageContainer}>
      {/* Header and Back Button */}
      <header className={headerContainer}>
        <div className="mb-4 md:mb-0">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page (Dashboard)
            className={backButtonClasses}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className={titleText}>
            Report History:{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {personName || "Loading..."}
            </span>
          </h1>
          <p className={subtitleText}>
            All submitted weekly reports for this individual.
          </p>
        </div>
      </header>

      {/* Content Area: Loading, Error, or Reports */}
      {isLoading ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <p className="text-xl font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
            Loading report history...
          </p>
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl shadow-lg border-l-4 border-red-500 dark:border-red-600">
          <h3 className="font-bold text-lg">Error Loading Reports</h3>
          <p>{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center p-12 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-xl shadow-lg border-l-4 border-yellow-500 dark:border-yellow-600">
          <h3 className="font-bold text-xl">No Reports Found</h3>
          <p>
            It looks like you haven't submitted any weekly reports for{" "}
            <span className="font-semibold">{personName}</span> yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report, index) => (
            <div key={report._id} className={cardContainer}>
              <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Weekly Report #{reports.length - index}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    report.contacted
                      ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
                  }`}
                >
                  {report.contacted ? "Contacted" : "Not Contacted"}
                </span>
              </div>

              <div className="text-gray-700 dark:text-gray-300 space-y-3">
                <p>
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                    Week of:
                  </span>{" "}
                  {formatDate(report.weekOf)}
                </p>
                <div className={noteBlock}>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Response / Notes:
                  </p>
                  <p className="whitespace-pre-wrap text-sm dark:text-gray-300">
                    {report.response ||
                      "No specific response or notes recorded."}
                  </p>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
                  Report submitted on: {formatDate(report.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonHistoryPage;
