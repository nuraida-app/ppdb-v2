import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiInfo = createApi({
  reducerPath: "ApiInfo",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/info`,
    credentials: "include",
  }),
  tagTypes: ["Info", "Infos"],
  endpoints: (builder) => ({
    getInfos: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get`,
        method: "GET",
        params: { page, limit, search },
      }),
      providesTags: ["Infos"],
    }),
    getInfo: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["Info"],
    }),
    addInfo: builder.mutation({
      query: (body) => ({
        url: `/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Infos"],
    }),
    deleteInfo: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Infos"],
    }),
  }),
});

export const {
  useGetInfosQuery,
  useGetInfoQuery,
  useAddInfoMutation,
  useDeleteInfoMutation,
} = ApiInfo;
