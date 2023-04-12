import { createSlice } from "@reduxjs/toolkit";

export const networkSlice = createSlice({
  name: "network",
  initialState: {
    value: "",
  },
  reducers: {
    writeNetWork: (state, action) => {
      state.value = action.payload;
    },
    clearNetWork: (state, action) => {
      state.value = action.payload;
    },
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const { writeNetWork, clearNetWork } = networkSlice.actions;

export default networkSlice.reducer;
