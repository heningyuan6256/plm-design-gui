/**
 * Author: hny_147
 * Date: 2023/03/03 12:33:46
 * Description: 引入Iconfont图标库，本地引入
 */
import { omit } from "lodash";
import { CSSProperties, FC } from "react";

export interface PlmIconProps {
  style?: CSSProperties;
  name: string;
  className?: string;
  onClick?: (res: any) => void;
}

const PlmIcon: FC<PlmIconProps> = (props) => {
  return (
    <i
      onClick={props.onClick}
      className={`iconfont icon-${props.name} ${props.className}`}
      {...omit(props, "className")}
    ></i>
  );
};

export default PlmIcon;
