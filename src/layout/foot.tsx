/**
 * Author: hny_147
 * Date: 2023/03/12 15:35:44
 * Description: 标准页尾
 */
import { FC } from "react";
import PlmIcon from "../components/PlmIcon";
import userSvg from "../assets/image/user.svg";
import { useSelector } from "react-redux";
import { Dropdown, MenuProps } from "antd";

const Foot: FC = () => {
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
      <div className="text-xs flex">
        <PlmIcon
          name="link"
          className="text-xs text-white opacity-80"
        ></PlmIcon>{" "}
        <div className="text-xs text-white opacity-80 scale-90">
          SSH: {value}
        </div>
      </div>
      <div className="text-xs flex gap-2">
        <Dropdown menu={{ items }} placement="top">
          <img src={userSvg} width={12} alt="" />
        </Dropdown>
        {/* <PlmIcon name="user" className="text-xs text-white"></PlmIcon>{" "} */}
        <PlmIcon
          name="notice"
          className="text-xs text-white opacity-80"
        ></PlmIcon>
      </div>
    </div>
  );
};
export default Foot;
