import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPayment = createApi({
  reducerPath: "ApiPayment",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/payment`,
    credentials: "include",
  }),
  tagTypes: ["myPayment", "payments"],
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/semua-pembayaran",
        params: { page, limit, search },
      }),
      providesTags: ["payments"],
    }),
    getData: builder.query({
      query: () => "/data-pembayaran",
      providesTags: ["payments"],
    }),
    confirmPayment: builder.mutation({
      query: (userId) => ({
        url: `/konfirmasi-pembayaran/${userId}`,
        method: "PUT",
      }),
      invalidatesTags: ["payments"],
    }),
    myPayment: builder.query({
      query: (id) => `/${id}`,
      providesTags: (id) => [{ type: "myPayment", id }],
    }),
    uploadPayment: builder.mutation({
      query: (body) => ({
        url: "/upload-berkas",
        method: "POST",
        body,
      }),
      invalidatesTags: ({ id }) => [{ type: "myPayment", id }],
    }),
  }),
});
export const {
  useGetPaymentsQuery,
  useConfirmPaymentMutation,
  useMyPaymentQuery,
  useUploadPaymentMutation,
  useGetDataQuery,
} = ApiPayment;
