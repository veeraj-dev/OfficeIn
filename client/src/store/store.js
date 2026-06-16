import { configureStore } from "@reduxjs/toolkit";
import { officeApi } from "./officeApi.js";

export const store = configureStore({
  reducer: {
    [officeApi.reducerPath]: officeApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(officeApi.middleware),
});
