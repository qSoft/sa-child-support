import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TopTabKey = "general" | "children" | "federal" | "state";

type UiState = {
  activeTopTab: TopTabKey;
};

const initialState: UiState = {
  activeTopTab: "general",
};

const uiSlice = createSlice({
  name: "ui",
  initialState:{ activeTopTab: "general" as TopTabKey },
  reducers: {
    setActiveTopTab: (state, action: PayloadAction<TopTabKey>) => {
      state.activeTopTab = action.payload;
    },
  },
});

export const { setActiveTopTab } = uiSlice.actions;
export default uiSlice.reducer;
