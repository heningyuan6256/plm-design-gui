// import { Tag } from "antd";
// import styles from "./index.less";
// export interface PlmLifeCycleProps {
//   color: string;
//   record?: Record<string, any>;
//   children?: React.ReactNode;
// }

// const colorMap: Record<string, string> = {
//   "0": "#eb5d52", // 红色
//   "1": "#666666", // 灰色
//   "2": "#fca400",
//   "3": "#3893d0",
//   "4": "#44b84a", // 绿色
// };

// // 根据工作流节点的类型判断颜色
// const workflowMap: Record<string, string> = {
//   "1": "#999999",
//   "2": "#0563b2",
//   "3": "#57c5a4",
//   "4": "#57c5a4",
//   "5": "#57c5a4",
//   "6": "#eb5d52",
// };

// const PlmLifeCycle: React.FC<PlmLifeCycleProps> = (props) => {
//   const workflow = props?.record?.workflow;
//   return (
//     <div>
//       <Tag
//       className='h-5'
//         color={
//           workflow?.wfDefId
//             ? workflowMap[workflow.crtNodeClazz]
//             : colorMap[props.color]
//         }
//       >
//         {props.children}
//       </Tag>
//     </div>
//   );
// };

// export default PlmLifeCycle;
