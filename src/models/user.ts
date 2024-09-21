import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/api";
import { exists, readTextFile, writeFile } from "@tauri-apps/api/fs";
import { homeDir, resolveResource } from "@tauri-apps/api/path";
import { BasicConfig } from "../constant/config";
import { sse } from "../utils/SSEService";
import { Utils } from "../utils";

export const fetchUserByToken = createAsyncThunk<any, string>(
  "users/fetchUserByToken",
  async (token, { rejectWithValue }) => {
    try {
      const response: any = await API.getUserInfo({ token: decodeURI(token) });
      const homeDirPath = await homeDir();
      await writeFile(
        `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.TokenCache}`,
        token
      );
      sse.userId = response.result.id
      sse.token = token
      // const path = await resolveResource('Config.ini')

      // const config = await readTextFile(path)

      // const INIData = Utils.parseINIString(config)
      // let severUrl = BasicConfig.ServerUrl
      // if (INIData && INIData['ONCHAIN'] && INIData['ONCHAIN'].ServerUrl) {
      //     severUrl = INIData['ONCHAIN'].ServerUrl
      // }
      const networkAddr = `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.NetworkCache}`
      const existNet = await exists(networkAddr)
      const networkAddress = existNet ? await readTextFile(networkAddr) : '';
      const sseUrl = `${networkAddress}/api/plm/event/pull/${response.result.orgCode.split('-')[0]}/${response.result.id}`
      sse.tenantId = response.result.orgCode.split('-')[0]
      sse.connect(sseUrl)
      return response.result;
    } catch (error) {
      if (!error) {
        throw error;
      }
      return rejectWithValue(error);
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    value: {
      id: "",
      name: "",
      token: "",
    },
  },
  reducers: {
    // return action.payload;
    // state.value =
    // Redux Toolkit 允许我们在 reducers 写 "可变" 逻辑。它
    // 并不是真正的改变状态值，因为它使用了 Immer 库
    // 可以检测到“草稿状态“ 的变化并且基于这些变化生产全新的
    // 不可变的状态
    logIn: (state, action) => { },
    logOut: (state) => { },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserByToken.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserByToken.rejected, (state) => {
        state.loading = false;
      });
  },
});
// 每个 case reducer 函数会生成对应的 Action creators
export const { logIn, logOut } = userSlice.actions;

export default userSlice.reducer;
