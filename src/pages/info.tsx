import { FC } from "react";
import PlmIcon from "../components/PlmIcon";
import PlmModal from "../components/PlmModal";

/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:48
 * Description: 关于界面
 */
export interface InfoProps {
  visible: boolean
  onCancel: () => void
}
const Info:FC<InfoProps> = (props) => {
  return <PlmModal onCancel={props.onCancel} width={360} title='关于' open={props.visible}>
    <div style={{ height: '235px', paddingTop: '36px' }} className="w-full">
      <div className="flex justify-center">
        <PlmIcon name="logo2" className='text-primary' style={{ fontSize: '58px' }}></PlmIcon>
      </div>
      <div style={{marginTop: '10px', textAlign: 'center'}} className="text-xs">设计工具</div>
      <div style={{marginTop: '4px', textAlign: 'center'}} className="text-xs">版本56(514584)</div>
      <div className="text-xs whitespace-nowrap" style={{transform: 'scale(0.90)', marginTop:'36px',  textAlign: 'center',color: '#cdcdcd'}}>Copyright 2022 武汉大海信息系统科技有限公司.All Rights Reserved</div>
    </div>
  </PlmModal>
}

export default Info