import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/api";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { homeDir, resolveResource } from "@tauri-apps/api/path";
import { BasicConfig } from "../constant/config";
import { sse } from "../utils/SSEService";
import { Utils } from "../utils";
import { orderBy } from "lodash";

export const fetchMessageData = createAsyncThunk<any, any>(
  "message/fetchData",
  async (data, { rejectWithValue }) => {
    try { 
      const response: any = await API.getChatData(data);
      const records = orderBy((response.result.records || []), ['msgStatus', "createTime"], ['asc', 'desc'])
      const count = records.filter((item:any) => !item.msgStatus).length
      return {
        data: records,
        unReadCount: count
      };
    } catch (error) {
      if (!error) {
        throw error;
      }
      return rejectWithValue(error);
    }
  }
);

export const messageSlice = createSlice({
  name: "message",
  initialState: {
    loading: false,
    value: [],
    unReadCount: 0
  },
  reducers: {
    // return action.payload;
    // state.value =
    // Redux Toolkit 允许我们在 reducers 写 "可变" 逻辑。它
    // 并不是真正的改变状态值，因为它使用了 Immer 库
    // 可以检测到“草稿状态“ 的变化并且基于这些变化生产全新的
    // 不可变的状态
    // logIn: (state, action) => {},
    // logOut: (state) => {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessageData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessageData.fulfilled, (state, action) => {
        state.value = action.payload.data;
        state.unReadCount = action.payload.unReadCount
        state.loading = false;
      })
      .addCase(fetchMessageData.rejected, (state) => {
        state.loading = false;
      });
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
// export const { logIn, logOut } = messageSlice.actions;

export default messageSlice.reducer;
