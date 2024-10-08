import { FC, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { CommandConfig, PathConfig } from "../constant/config";
import PlmIcon from "../components/PlmIcon";
import menuMaterial from "../assets/image/menuMaterial.svg";
import menuMaterialHover from "../assets/image/menuMaterial (1).svg";
import menuSearch from "../assets/image/menuSearch.svg";
import menuSearchHover from "../assets/image/menuSearch (1).svg";
import menuUpload from "../assets/image/menuUpload.svg";
import menuUploadHover from "../assets/image/menuUpload (1).svg";
import menuSetting from "../assets/image/menuSetting.svg";
import menuSettingHover from "../assets/image/menuSetting (1).svg";
import { mqttClient } from "../utils/MqttService";
import { appWindow } from "@tauri-apps/api/window";

const left: FC = () => {
  const [hoverButton, setHoverButton] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  // // 监听路由

  useEffect(() => {
    mqttClient.registerCallBack(CommandConfig.onchain_path, (res) => {
      console.log(res, 'res')
      if ((res.input_data === 'cad_start') || (res.input_data === CommandConfig.cadShutDown)) {
        return
      }



      if (res.input_data === PathConfig.login) {
        if (location.pathname !== '/login') {
          mqttClient.publish({
            type: CommandConfig.onchain_path,
            input_data: PathConfig.login,
            output_data: {
              result: "ok",
            },
          });
        } else {
        }
      } else if (res.input_data === 'exit') {
        mqttClient.publish({
          type: CommandConfig.onchain_path,
          input_data: PathConfig.login,
          output_data: {
            result: "exit",
          },
        });
        setTimeout(() => {
          appWindow.close()
        }, 200)
      } else {
        navigate(`/${res.input_data.split("_")[1]}`);
      }
    });
    return () => {
      mqttClient.unRegisterCallBack(CommandConfig.onchain_path);
    };
  }, []);

  // 左侧按钮
  const leftToolBar = [
    {
      title: "搜索",
      icon: menuSearch,
      hoverIcon: menuSearchHover,
      path: "/query",
      location: "left",
    },
    {
      title: "物料库",
      icon: menuMaterial,
      hoverIcon: menuMaterialHover,
      path: "/stock",
      location: "left",
    },
    {
      title: "上传",
      icon: menuUpload,
      hoverIcon: menuUploadHover,
      path: "/home",
      location: "left",
    },
    {
      title: "属性映射",
      icon: menuSetting,
      hoverIcon: menuSettingHover,
      path: "/preference",
      location: "right",
    },
  ];
  const renderToolItem = (item: any) => {
    return (
      <div
        key={item.path}
        className={`cursor-pointer w-full flex justify-center ${location.pathname == item.path ? "leftBorder" : ""
          }`}
        style={{
          // borderLeft: location.pathname == item.path ? "3px solid #0563B2" : "",
          padding: "10px 0px",
        }}
        onClick={() => {
          setHoverButton(item.path);
          navigate(`${item.path}`);
        }}
        onMouseEnter={() => {
          setHoverButton(item.path);
        }}
        onMouseLeave={() => {
          setHoverButton("");
        }}
      >
        <img
          className="w-4"
          src={
            item.path === hoverButton || location.pathname == item.path
              ? item.hoverIcon
              : item.icon
          }
          alt=""
        />
      </div>
    );
  };
  return (
    <div
      className="bg-base flex flex-col items-center justify-between w-10 border-r border-outBorder"
      style={{ minWidth: "40px", paddingTop: "10px" }}
    >
      <div className="w-full">
        {leftToolBar
          .filter((item) => item.location == "left")
          .map((item) => {
            return renderToolItem(item);
          })}
      </div>
      <div className="w-full">
        {leftToolBar
          .filter((item) => item.location == "right")
          .map((item) => {
            return renderToolItem(item);
          })}
      </div>
    </div>
  );
};

export default left;
