import { createSlice } from "@reduxjs/toolkit";

export const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    value: false,
  },
  reducers: {
    setLoading: (state, action) => {
      state.value = action.payload;
    },
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const { setLoading } = loadingSlice.actions;

export default loadingSlice.reducer;
