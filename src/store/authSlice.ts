import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  mode: "light" | "dark";
  user: any | null;
  token: string | null;
  resetToken: string | null;
  foodLog: any[];
  pantry: any[];
  restaurant: any | null;
  userMealSelection: string;
  avatarSrc: string; // store avatar URL
}

const initialState: AuthState = {
  mode: "light",
  user: null,
  token: null,
  resetToken: null,
  foodLog: [],
  pantry: [],
  restaurant: null,
  userMealSelection: "all",
  avatarSrc: "", // default avatar
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set full user info (after login)
    setLogin: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    // Update avatar
    setAvatar: (state, action: PayloadAction<string>) => {
      state.avatarSrc = action.payload;
    },

    // Log out
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.resetToken = null;
      state.avatarSrc = "";
    },

    // Optional: toggle dark/light mode
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { setLogin, setAvatar, logout, toggleMode } = authSlice.actions;
export default authSlice.reducer;
