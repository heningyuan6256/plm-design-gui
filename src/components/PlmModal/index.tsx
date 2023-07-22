import { Modal, ModalProps } from "antd"
import { FC } from "react"
import PlmIcon from "../PlmIcon"

export interface PlmModalProps extends ModalProps {
  open: boolean
}

const PlmModal: FC<PlmModalProps> = (props) => {
  return <Modal footer={null} closeIcon={<></>} maskClosable={false} mask={false} title={<div style={{ height: '30px', fontWeight: '400' }} className='items-center w-full bg-primary flex text-white text-xs justify-between px-2.5'>
    <div>上传日志</div>
    <div className="scale-75"><PlmIcon
      name="close"
      // onClick={() => exit()}
      onClick={props.onCancel}
      className="text-xs text-white cursor-pointer opacity-80 hover:shadow-2xl hover:bg-hoverHeadButton"
    ></PlmIcon></div>
  </div>} {...props}>
    {props.children}
  </Modal>
}

export default PlmModal