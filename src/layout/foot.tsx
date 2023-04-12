/**
 * Author: hny_147
 * Date: 2023/03/12 15:35:44
 * Description: 标准页尾
 */
import { FC } from "react";
import PlmIcon from "../components/PlmIcon";
import userSvg from "../assets/image/user.svg";
import { useSelector } from "react-redux";

const Foot: FC = () => {
  const { value } = useSelector((state: any) => state.network);
    return (
    <div
      style={{ minHeight: "24px" }}
      className="flex items-center w-full justify-between bg-primary px-2 h-6"
    >
      <div className="text-xs flex gap-2">
        <PlmIcon
          name="link"
          className="text-xs text-white opacity-80"
        ></PlmIcon>{" "}
        <div className="text-xs text-white opacity-80 scale-90">
          SSH: {value}
        </div>
      </div>
      <div className="text-xs flex gap-2">
        <img src={userSvg} width={12} alt="" />
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
