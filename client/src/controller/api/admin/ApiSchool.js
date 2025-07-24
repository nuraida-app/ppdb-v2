import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiSchool = createApi({
  reducerPath: "ApiSchool",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/school`,
    credentials: "include",
  }),
  tagTypes: ["school", "schools"],
  endpoints: (builder) => ({
    getSchools: builder.mutation({
      query: ({ page, limit, search }) => ({
        url: "/get",
        params: { page, limit, search },
      }),
      providesTags: ["schools"],
    }),
    getSchool: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["school"],
    }),
    addSchool: builder.mutation({
      query: (body) => ({
        url: "/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["schools"],
    }),
    delSchool: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["schools"],
    }),
    clearData: builder.mutation({
      query: () => ({
        url: "/clear-data",
        method: "DELETE",
      }),
      invalidatesTags: ["schools"],
    }),
  }),
});

export const {
  useGetSchoolsMutation,
  useGetSchoolQuery,
  useAddSchoolMutation,
  useDelSchoolMutation,
  useClearDataMutation,
} = ApiSchool;
