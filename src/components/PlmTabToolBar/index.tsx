import { FC } from "react";
import PlmIcon from "../PlmIcon";

export interface PlmTabToolBarProps {
  list: any[];
  onClick?: (row:any) => void
}

const PlmTabToolBar: FC<PlmTabToolBarProps> = (props) => {
  const list = props.list;
  return (
    <div className="h-8 flex items-center">
      {list.map((item:any, index) => (
        <div onClick={() => props.onClick && props.onClick(item)} className='mr-5 text-xs flex cursor-pointer hover:shadow-1xl hover:bg-hoverBg hover:text-primary' key={index}><img width={16} className='mr-1.5' src={item.icon} alt="" /> {item.name}</div>
      ))}
    </div>
  );
};

export default PlmTabToolBar;
