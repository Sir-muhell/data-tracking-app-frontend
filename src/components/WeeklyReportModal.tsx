import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import type { IPerson } from "../types";
import { addWeeklyReport } from "../api/personsService";
import { setError, setLoading } from "../features/persons/personsSlice";
import { CheckCircle, XCircle, X } from "lucide-react";

// --- START: Self-Contained Toast Notification System ---
interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const ToastNotification: React.FC<{
  toast: Toast;
  removeToast: (id: number) => void;
}> = ({ toast, removeToast }) => {
  React.useEffect(() => {
    // Auto-dismiss after 3.5 seconds
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const baseClasses =
    "fixed top-5 right-5 p-4 rounded-xl shadow-2xl z-[100] transition-all duration-500 transform animate-toast-in";
  const typeClasses =
    toast.type === "success"
      ? "bg-green-600 text-white dark:bg-green-700"
      : "bg-red-600 text-white dark:bg-red-700";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center space-x-3">
        {toast.type === "success" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        <p className="font-medium text-sm">{toast.message}</p>
        <button
          onClick={() => removeToast(toast.id)}
          className="ml-4 opacity-75 hover:opacity-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
// --- END: Toast Notification System ---

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: IPerson;
}

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  // --- Toast State ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  if (!isOpen) return null;

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: reduxError } = useSelector(
    (state: RootState) => state.persons
  );

  // --- CHANGED: 'contacted' is now a string for dropdown options ---
  const [contactedStatus, setContactedStatus] = useState<boolean>(false);
  const [response, setResponse] = useState("");
  const [weekOf, setWeekOf] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // --- Toast Helper Functions ---
  const addToast = (message: string, type: "success" | "error") => {
    const newToast: Toast = { id: Date.now(), message, type };
    // Only show one toast at a time for simplicity
    setToasts([newToast]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Dark Mode Utility Classes ---
  const modalBackground =
    "fixed inset-0 bg-gray-900 bg-opacity-70 dark:bg-opacity-90 flex items-center justify-center z-50 px-4 sm:px-10 backdrop-blur-sm transition-opacity duration-300";
  const modalContent =
    "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 transform transition-transform duration-300 scale-100";
  const headerText = "text-xl font-bold text-indigo-600 dark:text-indigo-400";
  const labelClasses =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const inputClasses =
    "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition duration-150 shadow-inner";
  const buttonPrimaryClasses = (loading: boolean) =>
    `w-full sm:w-auto py-2 px-6 border border-transparent rounded-xl shadow-md text-sm font-medium text-white transition duration-200 transform hover:scale-[1.01] active:scale-[0.98] ${
      loading
        ? "bg-indigo-400 dark:bg-indigo-600/70 cursor-not-allowed"
        : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
    }`;
  const buttonSecondaryClasses =
    "w-full sm:w-auto py-2 px-6 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-150";
  // --- End Dark Mode Utility Classes ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setError(null));

    // --- NEW: Form Validation ---
    if (!response.trim()) {
      addToast("Please provide notes in the response field.", "error");
      return;
    }
    if (!weekOf) {
      addToast("Please select a date for the 'Week of'.", "error");
      return;
    }

    dispatch(setLoading(true));

    try {
      await addWeeklyReport(person._id, {
        contacted: contactedStatus, // Send the string value
        response,
        weekOf,
      });

      addToast("Report submitted successfully!", "success");
      onClose(); // Close the modal upon success
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit report. Please check your network connection.";
      dispatch(setError(errorMessage));
      addToast(errorMessage, "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      {/* Toast Container - renders outside the modal div for high z-index */}
      <div className="absolute">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            removeToast={removeToast}
          />
        ))}
      </div>

      <div className={modalBackground} onClick={onClose}>
        <div className={modalContent} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
            <h3 className={headerText}>
              Weekly Report for{" "}
              <span className="font-extrabold">{person.name}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-3xl transition duration-150"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="weekOf" className={labelClasses}>
                Week of
              </label>
              <input
                type="date"
                id="weekOf"
                value={weekOf}
                onChange={(e) => setWeekOf(e.target.value)}
                className={inputClasses}
                required
              />
            </div>

            {/* --- NEW: Contact Status Dropdown --- */}
            <div>
              <label htmlFor="contactedStatus" className={labelClasses}>
                Contact Status
              </label>
              <select
                id="contactedStatus"
                value={contactedStatus ? "true" : "false"}
                onChange={(e) => setContactedStatus(e.target.value === "true")}
                className={inputClasses + " cursor-pointer"}
                required
              >
                <option value="false">Not Contacted</option>
                <option value="true">Contacted</option>
              </select>
            </div>

            <div>
              <label htmlFor="response" className={labelClasses}>
                Response / Notes (Required)
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className={inputClasses}
                placeholder="Describe the response, current status, or next steps."
                required
              />
            </div>

            {reduxError && (
              <div className="p-4 text-sm text-red-700 dark:text-red-100 bg-red-100 dark:bg-red-900 rounded-xl shadow-md border border-red-300 dark:border-red-700">
                <span className="font-bold">Redux Error:</span> {reduxError}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                type="button"
                onClick={onClose}
                className={buttonSecondaryClasses}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={buttonPrimaryClasses(isLoading)}
              >
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default WeeklyReportModal;
