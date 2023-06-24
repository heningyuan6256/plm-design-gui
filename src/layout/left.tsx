import { FC, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { CommandConfig } from "../constant/config";
import PlmIcon from "../components/PlmIcon";
import menuMaterial from "../assets/image/menuMaterial.svg";
import menuMaterialHover from "../assets/image/menuMaterial (1).svg";
import menuSearch from "../assets/image/menuSearch.svg";
import menuSearchHover from "../assets/image/menuSearch (1).svg";
import menuUpload from "../assets/image/menuUpload.svg";
import menuUploadHover from "../assets/image/menuUpload (1).svg";

const left: FC = () => {
  const [hoverButton, setHoverButton] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  // // 监听路由
  useMqttRegister(CommandConfig.onchain_path, async (res) => {
    navigate(`/${res.input_data}`);
  });
  // 左侧按钮
  const leftToolBar = [
    {
      title: "搜索",
      icon: menuSearch,
      hoverIcon: menuSearchHover,
      path: "/query",
    },
    {
      title: "物料库",
      icon: menuMaterial,
      hoverIcon: menuMaterialHover,
      path: "/stock",
    },
    {
      title: "上传",
      icon: menuUpload,
      hoverIcon: menuUploadHover,
      path: "/home",
    },
  ];
  return (
    <div
      className="bg-base flex flex-col items-center w-10 pt-5"
      style={{ minWidth: "40px" }}
    >
      {leftToolBar.map((item) => {
        return (
          <div
            key={item.path}
            className="mb-5 cursor-pointer"
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
      })}
    </div>
  );
};

export default left;
