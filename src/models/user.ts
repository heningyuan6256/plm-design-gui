import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../utils/api";
import { writeFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";
import { homeDir } from "@tauri-apps/api/path";

export const fetchUserByToken = createAsyncThunk<any, string>(
  "users/fetchUserByToken",
  async (token, { rejectWithValue }) => {
    try {
      const response: any = await API.getUserInfo({ token: token });
      const homeDirPath = await homeDir();
      await writeFile(`${homeDirPath}.onChain/token.txt`, token);
      await invoke("open_login", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      const loginWindow = WebviewWindow.getByLabel("Login");
      loginWindow?.close();

      return response;
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
    logIn: (state, action) => {},
    logOut: (state) => {},
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
