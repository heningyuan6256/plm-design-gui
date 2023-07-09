/**
 * Author: hny_147
 * Date: 2023/03/12 15:35:44
 * Description: 标准页尾
 */
import { FC, useEffect, useState } from "react";
import PlmIcon from "../components/PlmIcon";
import userSvg from "../assets/image/user.svg";
import { useSelector } from "react-redux";
import { Dropdown, MenuProps } from "antd";
import { mqttClient } from "../utils/MqttService";

const Foot: FC = () => {
  const [pid, setPid] = useState(mqttClient.pid)
  useEffect(() =>{
    mqttClient.event.updatePid.add(setPid)
    return ()=> {
      mqttClient.event.updatePid.delete(setPid)
    } 
  } ,[])
  const { value: user } = useSelector((state: any) => state.user);
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <a target="_blank" rel="noopener noreferrer">
          {user.name}
        </a>
      ),
    },
  ];
  const { value } = useSelector((state: any) => state.network);

  return (
    <div
      style={{ minHeight: "24px" }}
      className="flex items-center w-full justify-between bg-primary px-2 h-6"
    >
      <div className="text-xs flex text-white h-full items-center">
        {/* <Dropdown menu={{ items }} placement="top"> */}
        <div className="flex relative">
          <div
            className="absolute"
            style={{
              borderRadius: "50%",
              width: "4px",
              top: "1px",
              height: "4px",
              background: "#0EDF8C",
              left: "6px",
            }}
          ></div>
          <img src={userSvg} width={12} alt="" />
        </div>
        {/* </Dropdown> */}
        <div className="opacity-80 ml-1">
          <span className="mr-1">{user?.name}</span>-
          <span className="ml-1">{value}</span>
        </div>
        <div
          className="px-1 ml-2 h-full items-center flex"
          style={{
            paddingTop: "1px",
            paddingBottom: "1px",
            background: "#69A1D1",
          }}
        >
          {mqttClient.publishTopic +
            (pid ? ` (${pid})` : "")}
        </div>
        {/* <PlmIcon
          name="link"
          className="text-xs text-white opacity-80"
        ></PlmIcon>{" "}
        <div className="text-xs text-white opacity-80 scale-90">
          SSH: {value}
        </div> */}
      </div>
      <div className="text-xs flex gap-2 text-white opacity-80">
        DESIGNFUSION 1.0.0
        {/* <PlmIcon name="user" className="text-xs text-white"></PlmIcon>{" "} */}
        {/* <PlmIcon
          name="notice"
          className="text-xs text-white opacity-80"
        ></PlmIcon> */}
      </div>
    </div>
  );
};
export default Foot;
