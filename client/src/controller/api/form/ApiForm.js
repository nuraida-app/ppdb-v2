import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiForm = createApi({
  reducerPath: "ApiForm",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/form`,
    credentials: "include",
  }),
  tagTypes: [
    "student",
    "address",
    "parents",
    "school",
    "notes",
    "files",
    "family",
    "form",
    "forms",
  ],
  endpoints: (builder) => ({
    changeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/ubah-status`,
        params: { id, status },
        method: "PUT",
      }),
      invalidatesTags: ["form", "forms"],
    }),
    getForms: builder.query({
      query: ({ status, page, limit, search, level }) => {
        const params = { page, limit };
        if (status) params.status = status;
        if (search) params.search = search;
        if (level) params.level = level;

        return {
          url: `/proses`,
          params,
          method: "GET",
        };
      },
      providesTags: ["forms"],
    }),
    getForm: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: ["form"],
    }),
    addStudentForm: builder.mutation({
      query: ({ body, userId }) => ({
        url: `/data-diri`,
        method: "POST",
        params: { userId },
        body,
      }),
      invalidatesTags: ["student", "form"],
    }),
    addAddress: builder.mutation({
      query: (body) => ({
        url: `/alamat`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["address", "form"],
    }),
    addParents: builder.mutation({
      query: ({ body, userId }) => ({
        url: `/orangtua`,
        method: "POST",
        params: { userId },
        body,
      }),
      invalidatesTags: ["parents", "form"],
    }),
    addSchool: builder.mutation({
      query: (body) => ({
        url: "/asal-sekolah",
        method: "POST",
        body,
      }),
      invalidatesTags: ["school", "form"],
    }),
    getFamilyForm: builder.query({
      query: (id) => ({
        url: `/keluarga/${id}`,
        method: "GET",
      }),
      providesTags: ["family"],
    }),
    addFamily: builder.mutation({
      query: (body) => ({
        url: "/keluarga",
        method: "POST",
        body,
      }),
      invalidatesTags: ["family", "form"],
    }),
    deleteFamily: builder.mutation({
      query: (id) => ({
        url: `/hapus-keluarga/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["family", "form"],
    }),
    getFiles: builder.query({
      query: (userId) => `/berkas/${userId}`,
      providesTags: ["files"],
    }),
    uploadFile: builder.mutation({
      query: (body) => ({
        url: "/berkas",
        method: "POST",
        body,
      }),
      invalidatesTags: ["files", "form"],
    }),
    deleteFile: builder.mutation({
      query: (id) => ({
        url: `/hapus-berkas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["files", "form"],
    }),
    downloadForm: builder.mutation({
      query: ({ tapel, tapelname }) => ({
        url: `/download/${tapel}/${tapelname}`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `pendaftar-${tapelname}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          return { message: "File berhasil didownload" };
        },
      }),
    }),
  }),
});

export const {
  useChangeStatusMutation,
  useGetFormsQuery,
  useGetFormQuery,
  useAddStudentFormMutation,
  useAddAddressMutation,
  useAddParentsMutation,
  useAddSchoolMutation,
  useGetFamilyFormQuery,
  useAddFamilyMutation,
  useDeleteFamilyMutation,
  useGetFilesQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useDownloadFormMutation,
} = ApiForm;
