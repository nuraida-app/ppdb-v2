import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiStatistic = createApi({
  reducerPath: "ApiStatistic",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/statistic`,
    credentials: "include",
  }),
  tagTypes: ["demographic", "payments", "dashboard"],
  endpoints: (buidder) => ({
    getDemographic: buidder.query({
      query: () => "/demography",
      providesTags: ["demographic"],
    }),
    getData: buidder.query({
      query: () => "/data-dashboard",
      providesTags: ["dashboard"],
    }),
    getDataPayments: buidder.query({
      query: () => "/payments",
      providesTags: ["payments"],
    }),
    getMedia: buidder.query({
      query: () => "/sosial-media",
    }),
  }),
});

export const {
  useGetDemographicQuery,
  useGetDataQuery,
  useGetDataPaymentsQuery,
  useGetMediaQuery,
} = ApiStatistic;
