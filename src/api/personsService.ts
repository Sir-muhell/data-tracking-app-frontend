import axiosInstance from "./axiosInstance";
import type { IPerson, IWeeklyReport, IAuthUser } from "../types";

// Type for creating a new Person (no _id, createdBy is handled by backend)
interface IPersonCreatePayload {
  name: string;
  phone: string;
  address: string;
  inviter: string;
  notes: string;
}

// Type for creating a Weekly Report
interface IReportCreatePayload {
  contacted: boolean;
  response: string;
  weekOf: string; // ISO date string
}

export type UserWithPeopleAdmin = IAuthUser & { people: IPerson[] };

/**
 * Fetches all persons created by the current user, or all persons if the user is an admin.
 */
export const fetchPersons = async (): Promise<IPerson[]> => {
  const response = await axiosInstance.get("/persons");
  return response.data;
};

/**
 * Creates a new Person entry.
 */
export const createPerson = async (
  data: IPersonCreatePayload
): Promise<IPerson> => {
  const response = await axiosInstance.post("/persons", data);
  return response.data;
};

/**
 * Submits a weekly report for a specific person.
 */
export const addWeeklyReport = async (
  personId: string,
  data: IReportCreatePayload
): Promise<IWeeklyReport> => {
  const response = await axiosInstance.post(
    `/persons/${personId}/report`,
    data
  );
  return response.data;
};

/**
 * Admin only: Fetches all weekly reports from all users.
 */
export const fetchAllReportsAdmin = async (): Promise<IWeeklyReport[]> => {
  const response = await axiosInstance.get("/persons/reports/all");
  return response.data;
};

export const fetchReportsByPersonId = async (
  personId: string
): Promise<IWeeklyReport[]> => {
  const response = await axiosInstance.get(`/persons/${personId}`);
  return response.data;
};

export const getAllUsersWithPeople = async (): Promise<
  UserWithPeopleAdmin[]
> => {
  const response = await axiosInstance.get("/persons/admin/users");
  return response.data;
};

export const fetchPeopleByUserAdmin = async (
  userId: string
): Promise<IPerson[]> => {
  const response = await axiosInstance.get(`/persons/admin/users/${userId}`);
  return response.data;
};

export const getUsersWithPeopleRecords = async (): Promise<IAuthUser[]> => {
  const response = await axiosInstance.get("/persons/admin/users/list");
  return response.data;
};
