import { configureStore } from '@reduxjs/toolkit';
import { memesApi } from '../services/memesApi';

export const store = configureStore({
  reducer: {
    [memesApi.reducerPath]: memesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(memesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
