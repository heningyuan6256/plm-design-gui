import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./count";
import userReducer from "./user";
import networkReducer from "./network";

export default configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    network: networkReducer,
  },
});
