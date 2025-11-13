import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../app/store";
import { createPerson } from "../api/personsService";
import Navbar from "../components/Navbar";
import {
  addPerson,
  setError,
  setLoading,
} from "../features/persons/personsSlice";
import {
  User,
  Phone,
  MapPin,
  Tag,
  FileText,
  Send,
  Loader2,
} from "lucide-react";

const PersonForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.persons);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    inviter: "",
    notes: "",
  });

  // Tailwind classes for consistent styling
  const inputClasses =
    "mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner py-3 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200";
  const labelClasses =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2 mb-1";
  const fieldContainerClasses = "space-y-1";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(setError(null)); // Clear previous errors

    try {
      const newPerson = await createPerson(formData);

      // Update Redux state with the new person
      dispatch(addPerson(newPerson));

      // Clear form and navigate to the dashboard
      setFormData({ name: "", phone: "", address: "", inviter: "", notes: "" });
      navigate("/"); // Navigate to the root/dashboard
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to create person. Check form data.";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900  transition-colors duration-300">
      <Navbar />
      <div className="p-4 sm:p-8 pt-0">
        <button
          onClick={() => navigate(-1)} // Go back to the previous page (Dashboard)
          className="text-indigo-600 hover:text-indigo-800 transition duration-150 flex items-center mb-2 font-medium"
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
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 md:p-12 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-8 border-b dark:border-gray-700 pb-3">
            New Person Data Input
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid Layout for Name, Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={fieldContainerClasses}>
                <label htmlFor="name" className={labelClasses}>
                  <User className="w-4 h-4 text-indigo-500" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className={fieldContainerClasses}>
                <label htmlFor="phone" className={labelClasses}>
                  <Phone className="w-4 h-4 text-indigo-500" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className={fieldContainerClasses}>
              <label htmlFor="address" className={labelClasses}>
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Address</span>
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className={inputClasses}
                placeholder="123 Main St, City, State"
                required
              />
            </div>

            {/* Inviter */}
            <div className={fieldContainerClasses}>
              <label htmlFor="inviter" className={labelClasses}>
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>Inviter's Name</span>
              </label>
              <input
                type="text"
                name="inviter"
                id="inviter"
                value={formData.inviter}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Referral Source"
                required
              />
            </div>

            {/* Notes */}
            <div className={fieldContainerClasses}>
              <label htmlFor="notes" className={labelClasses}>
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Notes (Optional)</span>
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className={inputClasses.replace("py-3", "py-3")} // Ensure padding for textarea
                placeholder="Any relevant background information or history..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-700 dark:text-red-100 bg-red-100 dark:bg-red-900 rounded-xl shadow-md border border-red-300 dark:border-red-700">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center space-x-2 py-4 px-4 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white transition duration-200 transform hover:scale-[1.01] active:scale-[0.99] ${
                  isLoading
                    ? "bg-indigo-400 dark:bg-indigo-600/70 cursor-not-allowed"
                    : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Person...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Save Person</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonForm;
