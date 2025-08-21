import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const memesApi = createApi({
  reducerPath: 'memesApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://meme-api.com/gimme/' }),
  endpoints: (builder) => ({
    getMemes: builder.query<any, void>({
      query: () => `programmingmemes/10`,
    }),
  }),
});

export const { useGetMemesQuery } = memesApi;
