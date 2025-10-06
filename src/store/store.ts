import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import mapReducer from "./mapSlice";

const persistAuthConfig = {
  key: "auth",
  storage,
};

const persistMapConfig = {
  key: "map",
  storage,
};

const persistedAuthReducer = persistReducer(persistAuthConfig, authReducer);
const persistedMapReducer = persistReducer(persistMapConfig, mapReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    map: persistedMapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
