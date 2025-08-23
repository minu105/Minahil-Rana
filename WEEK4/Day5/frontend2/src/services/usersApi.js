import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = (import.meta.env.VITE_API_URL || "https://minahil-rana.vercel.app/api").replace(/\/$/, "");

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: () => "/users/admins",
      providesTags: ["Users"],
    }),
    getCustomers: builder.query({
      query: () => "/users/customers",
      providesTags: ["Users"],
    }),
    blockUser: builder.mutation({
      query: (id) => ({
        url: `/users/block/${id}`,
        method: "PUT",
         body: {}, 
      }),
      invalidatesTags: ["Users"],
    }),
    unblockUser: builder.mutation({
      query: (id) => ({
        url: `/users/unblock/${id}`,
        method: "PUT",
         body: {}, 
      }),
      invalidatesTags: ["Users"],
    }),
    updateRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/role/${id}`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetCustomersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useUpdateRoleMutation,
} = usersApi;
