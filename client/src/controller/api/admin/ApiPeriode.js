import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPeriode = createApi({
  reducerPath: "ApiPeriode",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/periode`,
    credentials: "include",
  }),
  tagTypes: ["year", "years"],
  endpoints: (builder) => ({
    getYears: builder.query({
      query: () => "/get",
      providesTags: ["years"],
    }),
    getYear: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["year"],
    }),
    addYear: builder.mutation({
      query: (body) => ({
        url: "/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["years", "year"],
    }),
    deleteYear: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["years"],
    }),
  }),
});

export const {
  useGetYearsQuery,
  useGetYearQuery,
  useAddYearMutation,
  useDeleteYearMutation,
} = ApiPeriode;
