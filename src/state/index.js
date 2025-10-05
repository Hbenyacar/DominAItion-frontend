import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    mode: "light",
    user: null,
    token: null,
    resetToken: null,
    foodLog: [],
    pantry: [],
    restaurant: null,
    userMealSelection: "all",
    avatarSrc: "",
  };

  export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAvatar: (state, action) => {
            state.avatarSrc = action.payload;
        },
    }
  });

export const { setAvatar } = authSlice.actions;
export default authSlice.reducer;