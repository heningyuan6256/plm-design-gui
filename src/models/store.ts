import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./count";
import userReducer from "./user";
import networkReducer from "./network";
import mqttReducer from "./mqtt";

export default configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    network: networkReducer,
    mqtt: mqttReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //关闭redux序列化检测
      serializableCheck: false,
    }),
});
