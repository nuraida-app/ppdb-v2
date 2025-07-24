import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiSchedule = createApi({
  reducerPath: "ApiSchedule",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/schedule`,
    credentials: "include",
  }),
  tagTypes: ["schedule", "schedules", "userSchedule"],
  endpoints: (builder) => ({
    getSchedules: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get",
        params: { page, limit, search },
      }),
      providesTags: ["schedules"],
    }),
    getSchedule: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["schedule"],
    }),
    addSchedule: builder.mutation({
      query: (body) => ({
        url: `/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["schedules"],
    }),
    deleteSchedule: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["schedules"],
    }),
    getUserSchedule: builder.query({
      query: (id) => `/get-user-schedule/${id}`,
      providesTags: ["userSchedule"],
    }),
    addUserShcedule: builder.mutation({
      query: (body) => ({
        url: `/add-user-schedule`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["userSchedule"],
    }),
    delUserSchedule: builder.mutation({
      query: (body) => ({
        url: `/delete-user-schedule/`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["userSchedule"],
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useGetScheduleQuery,
  useAddScheduleMutation,
  useDeleteScheduleMutation,
  useGetUserScheduleQuery,
  useAddUserShceduleMutation,
  useDelUserScheduleMutation,
} = ApiSchedule;
