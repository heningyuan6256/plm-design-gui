import { useEffect } from "react";
import { Utils } from "../utils";
import { mqttClient } from "../utils/MqttService";

export const useMqttRegister = (
  order: string,
  callback: (res: any) => any,
  deps?: any[]
) => {
  useEffect(() => {
    mqttClient.registerCallBack(Utils.instruction(order), callback);
    return () => {
      mqttClient.unRegisterCallBack(Utils.instruction(order));
    };
  }, [deps]);
};
