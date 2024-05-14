/**
 * Author: hny_147
 * Date: 2023/03/11 17:13:48
 * Description: 菜单按钮
 */
import { FC } from "react";
import cancelcheckin from "../../assets/image/topcancelcheckin.svg";
import checkout from "../../assets/image/topcheckin.svg";
import checkin from "../../assets/image/topcheckout.svg";

import upload from "../../assets/image/topupload.svg";
import record from "../../assets/image/toprecord.svg";
// import quit from "../../assets/image/quit.svg";
// import about from "../../assets/image/topabout.svg";
import renovate from "../../assets/image/toprenovate.svg";
import topupdate from "../../assets/image/topupdate.svg";

export interface PlmToolBarProps {
  onClick: (name: string) => void;
}

const PlmMessageToolBar: FC<PlmToolBarProps> = (props) => {

  // 按钮
  const renderButton = (image: string, txt: string, name: string) => {
    return (
      <div
        onClick={() => {
          props.onClick(name);
        }}
        className="flex flex-col gap-1 items-center cursor-pointer hover:shadow-1xl hover:bg-hoverBg"
      >
        <img width={16} src={image} alt="" />
        <div className="text-xs">{txt}</div>
      </div>
    );
  };

  return (
    <div className="w-full  py-3.5 flex h-76 border-b border-outBorder">
      <div className="px-4 border-r border-r-outBorder">
        <div className="flex gap-3 mb-1">
          {renderButton(upload, "已读", "upload")}
          {renderButton(upload, "删除", "upload")}
        </div>
        <div className="scale-90 text-xs text-littleGrey text-center">
          操作
        </div>
      </div>
      <div className="px-4">
        <div className="flex gap-3 mb-1">
          {/* {renderButton(quit, "退出", "logout")} */}
          {/* info */}
          {/* {renderButton(about, "关于", "open_attr_map")} */}
        </div>
        {/* <div className="scale-90 text-xs text-littleGrey text-center">其他</div> */}
      </div>
    </div>
  );
};

export default PlmMessageToolBar;
