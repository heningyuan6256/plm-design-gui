import { configureStore } from "@reduxjs/toolkit";
import networkReducer from "./network";
import loadingReducer from "./loading";

export default configureStore({
  reducer: {
    network: networkReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //关闭redux序列化检测
      serializableCheck: false,
    }),
});
