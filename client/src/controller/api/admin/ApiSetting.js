import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiSetting = createApi({
  reducerPath: "ApiSetting",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/setting` }),
  tagTypes: ["setting"],
  endpoints: (builder) => ({
    getSetting: builder.query({
      query: () => "/get-setting",
      providesTags: ["setting"],
    }),
    updateSetting: builder.mutation({
      query: (data) => ({
        url: "/update-setting",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["setting"],
    }),
  }),
});

export const { useGetSettingQuery, useUpdateSettingMutation } = ApiSetting;
