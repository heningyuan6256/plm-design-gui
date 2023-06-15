import { createSlice } from "@reduxjs/toolkit";
import { BasicConfig } from "../constant/config";
import mqtt from "mqtt";
const client = mqtt.connect(BasicConfig.MqttConnectUrl, {
  //mqtt客户端的id
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  clientId: "client",
  username: "admin",
  password: "public",
});

client.subscribe("sw");

export const mqttSlice = createSlice({
  name: "mqtt",
  initialState: {
    value: client,
  },
  reducers: {
    subscribe: (state, action) => {
      const { payload } = action;
      client.subscribe(payload, () => {});
    },
    publish: (state, action) => {
      const { payload } = action;
      client.publish(payload.topic, JSON.stringify(payload));
    },
  },
});

export const interceptRequest = (
  res: any,
  config: { topic: string; version: string; type: string }
) => {
  const { topic, version, type } = config;
  return {
    origin: "onchain",
    type: `${topic}.${version}.${type}`,
    topic: topic,
    data: res,
  };
};

export const interceptResponse = (res: any) => {
  if (JSON.parse(res)?.origin === "onchain") {
    return false;
  }
  return JSON.parse(res);
};

// 每个 case reducer 函数会生成对应的 Action creators
export const { subscribe, publish } = mqttSlice.actions;

export default mqttSlice.reducer;
