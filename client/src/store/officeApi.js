import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { resolveApiBaseUrl } from "../lib/api.js";

export const officeApi = createApi({
  reducerPath: "officeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: resolveApiBaseUrl(),
    prepareHeaders(headers) {
      const token = localStorage.getItem("om_token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Department", "Employee", "Leave"],
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => "/health",
    }),
    getDepartments: builder.query({
      query: () => "/departments",
      transformResponse: (res) => res.items,
      providesTags: (result) =>
        result
          ? [...result.map((d) => ({ type: "Department", id: d._id })), { type: "Department", id: "LIST" }]
          : [{ type: "Department", id: "LIST" }],
    }),
    createDepartment: builder.mutation({
      query: (body) => ({ url: "/departments", method: "POST", body }),
      transformResponse: (res) => res.item,
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({ url: `/departments/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Department", id: "LIST" }],
    }),
    getEmployees: builder.query({
      query: () => "/employees",
      transformResponse: (res) => res.items,
      providesTags: (result) =>
        result
          ? [...result.map((e) => ({ type: "Employee", id: e._id })), { type: "Employee", id: "LIST" }]
          : [{ type: "Employee", id: "LIST" }],
    }),
    createEmployeeWithUser: builder.mutation({
      query: (body) => ({ url: "/employees/with-user", method: "POST", body }),
      transformResponse: (res) => res.item,
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({ url: `/employees/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),
    getMyLeaves: builder.query({
      query: () => "/leaves/my",
      transformResponse: (res) => res.items,
      providesTags: [{ type: "Leave", id: "MINE" }],
    }),
    createLeave: builder.mutation({
      query: (body) => ({ url: "/leaves", method: "POST", body }),
      transformResponse: (res) => res.item,
      invalidatesTags: [{ type: "Leave", id: "MINE" }, { type: "Leave", id: "LIST" }],
    }),
    getAllLeaves: builder.query({
      query: () => "/leaves",
      transformResponse: (res) => res.items,
      providesTags: [{ type: "Leave", id: "LIST" }],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status, reviewNote }) => ({
        url: `/leaves/${id}/status`,
        method: "PATCH",
        body: { status, reviewNote },
      }),
      transformResponse: (res) => res.item,
      invalidatesTags: [{ type: "Leave", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHealthQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetEmployeesQuery,
  useCreateEmployeeWithUserMutation,
  useDeleteEmployeeMutation,
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
} = officeApi;
