import { FC } from "react";
import PlmIcon from "../PlmIcon";

export interface PlmTabToolBarProps {
  list: any[];
}

const PlmTabToolBar: FC<PlmTabToolBarProps> = (props) => {
  const list = props.list;
  return (
    <div className="h-8 flex items-center">
      {list.map((item, index) => (
        <div className='mr-5 text-xs flex' key={index}><img width={16} className='mr-1.5' src={item.icon} alt="" /> {item.name}</div>
      ))}
    </div>
  );
};

export default PlmTabToolBar;
