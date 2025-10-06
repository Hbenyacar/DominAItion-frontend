import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
  map: string;
}

const initialState: MapState = {
  map: "",
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<{ map: string }>) => {
      state.map = action.payload.map;
    },
  },
});

export const { setMap } = mapSlice.actions;
export default mapSlice.reducer;
