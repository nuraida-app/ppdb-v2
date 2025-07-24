import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAuth = createApi({
  reducerPath: "ApiAuth",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/auth`,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Cache-Control", "no-cache");
      return headers;
    },
    timeout: 10000,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (body) => ({
        url: "/sign-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation({
      query: (body) => ({
        url: "/sign-up",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.mutation({
      query: () => ({
        url: "/load",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    recovery: builder.mutation({
      query: (body) => ({
        url: "/recovery",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useLoadUserMutation,
  useRecoveryMutation,
  useLogoutMutation,
} = ApiAuth;
