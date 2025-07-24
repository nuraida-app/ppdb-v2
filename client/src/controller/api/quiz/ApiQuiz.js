import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiQuiz = createApi({
  reducerPath: "ApiQuiz",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/quiz`,
    credentials: "include",
  }),
  tagTypes: ["quiz", "quizzes", "answers"],
  endpoints: (builder) => ({
    getQuizzes: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/get",
        params: { page, limit, search },
      }),
      providesTags: ["Quizzes"],
    }),
    getQuiz: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Quiz"],
    }),
    addQuiz: builder.mutation({
      query: (body) => ({
        url: `/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Quizzes"],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quizzes"],
    }),
    getAnswer: builder.query({
      query: (id) => `/answer/${id}`,
      providesTags: ["answers"],
    }),
    createAnswer: builder.mutation({
      query: (body) => ({
        url: "/add-answer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["answers"],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizQuery,
  useAddQuizMutation,
  useDeleteQuizMutation,
  useGetAnswerQuery,
  useCreateAnswerMutation,
} = ApiQuiz;
