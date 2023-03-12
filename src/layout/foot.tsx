/**
 * Author: hny_147
 * Date: 2023/03/12 15:35:44
 * Description: 标准页尾
 */
import { FC } from "react";
import PlmIcon from "../components/PlmIcon";

const Foot: FC = () => {
  return (
    <div className="flex items-center bottom-0 w-full justify-between bg-primary px-2 h-6">
      <div className="text-xs flex gap-2">
        <PlmIcon
          name="link"
          className="text-xs text-white opacity-80"
        ></PlmIcon>{" "}
        <div className="text-xs text-white opacity-80 scale-90">
          SSH: 192.168.0.112
        </div>
      </div>
      <div className="text-xs flex gap-2">
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
