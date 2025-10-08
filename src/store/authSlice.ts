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
  icon: string; // store avatar URL
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
  icon: "", // default avatar
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
      state.icon = action.payload;
    },

    // Log out
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.resetToken = null;
      state.icon = "";
    },

    // Optional: toggle dark/light mode
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { setLogin, setAvatar, logout, toggleMode } = authSlice.actions;
export default authSlice.reducer;
