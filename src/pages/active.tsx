// import { invoke } from "@tauri-apps/api";
// import { readTextFile, writeFile } from "@tauri-apps/api/fs";
// import { homeDir } from "@tauri-apps/api/path";
// import { getCurrent, WebviewWindow } from "@tauri-apps/api/window";
// import { useAsyncEffect } from "ahooks";
// import { Button, Input, Divider, Form, InputRef } from "antd";
// import { OnChainForm } from "onchain-ui";
// import OnChainFormItem, { PlmFormItemProps } from "onchain-ui/dist/esm/OnChainFormItem";
// import { useEffect, useRef } from "react";
// import userSvg from "../assets/image/user.svg";
// import PlmIcon from "../components/PlmIcon";
// import { BasicConfig } from "../constant/config";

// /**
//  * Author: hny_147
//  * Date: 2023/03/02 14:43:48
//  * Description: 激活界面
//  */
// export default function AttrMap() {
//   const singleMaxLength = 4
//   const [form] = Form.useForm();
//   const inputRef1 = useRef<InputRef>(null);
//   const inputRef2 = useRef<InputRef>(null);
//   const inputRef3 = useRef<InputRef>(null);
//   const inputRef4 = useRef<InputRef>(null);

//   const handleInputChange = (inputRef: any, nextInputRef: any, e: any) => {
//     const { value } = e.target;
//     inputRef.current = value;
//     console.log(value,)
//     if (value.length === singleMaxLength && nextInputRef.current) {
//       console.log(2)
//       nextInputRef.current.focus();
//     }
//   };


//   const formItems: PlmFormItemProps[] = [
//     {
//       name: "name",
//       content: {
//         type: "Input",
//         props: {
//           placeholder: "请输入用户名",
//           autoComplete: "false",
//           prefix: (
//             <img src={userSvg} width={16} alt="" />
//             // <PlmIcon className="second-color" name="address"></PlmIcon>
//           ),
//         },
//       },
//       // rules: [
//       //   {
//       //     required: true,
//       //     message: "用户名不能为空",
//       //   },
//       // ],
//     },
//     {
//       name: "psw",
//       content: {
//         type: "Input.Password",
//         props: {
//           placeholder: "请输入登录密码",
//           prefix: <PlmIcon name="password" className="second-color"></PlmIcon>,
//           iconRender: (visible: boolean) =>
//             visible ? (
//               <PlmIcon
//                 style={{ color: "#A7B3C5" }}
//                 className="text-base hover:cursor-pointer"
//                 name="show"
//               />
//             ) : (
//               <PlmIcon
//                 style={{ color: "#A7B3C5" }}
//                 className="text-base hover:cursor-pointer"
//                 name="hide"
//               />
//             ),
//         },
//       },
//       // rules: [
//       //   {
//       //     required: true,
//       //     message: "密码不能为空",
//       //   },
//       // ],
//     },
//   ];


//   // useAsyncEffect(async () => {
//   //   // 判断如果没有激活码，所以就跳激活页面
//   //   let activeText = ''
//   //   const homeDirPath = await homeDir();
//   //   try {
//   //     activeText = await readTextFile(
//   //       `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.Active}`
//   //     );
//   //   } catch (error) { }
//   //   if (activeText) {


//   //     // await invoke("open_login", {
//   //     //   width: window.innerWidth,
//   //     //   height: window.innerHeight,
//   //     // });
//   //   }

//   // }, [])


//   return <div className="flex w-full overflow-hidden h-full" style={{ padding: '12px' }}>
//     <div className='flex-1' style={{ paddingTop: '38px', paddingLeft: '23px', paddingBottom: '8px' }}>
//       <div style={{ marginLeft: '9px', fontWeight: 600, fontSize: '18px', fontFamily: 'PingFang SC, PingFang SC-Medium' }}>
//         永久许可证
//       </div>
//       <div className='text-primary' style={{ marginBottom: '50px', fontSize: '12px', marginLeft: '9px', }}>使用许可证密钥注册并激活</div>
//       <div className="flex gap-1 mb-1">
//         <Input
//           ref={inputRef1}
//           maxLength={singleMaxLength}
//           width={57}
//           style={{ width: '57px' }}
//           onChange={(e) => handleInputChange(inputRef1, inputRef2, e)}
//         />
//         <Input
//           ref={inputRef2}
//           maxLength={singleMaxLength}
//           width={57}
//           style={{ width: '57px' }}
//           onChange={(e) => handleInputChange(inputRef2, inputRef3, e)}
//         />
//         <Input
//           ref={inputRef3}
//           maxLength={singleMaxLength}
//           width={57}
//           style={{ width: '57px' }}
//           onChange={(e) => handleInputChange(inputRef3, inputRef4, e)}
//         />
//         <Input
//           ref={inputRef4}
//           maxLength={singleMaxLength}
//           width={57}
//           style={{ width: '57px' }}
//           onChange={(e) => handleInputChange(inputRef4, null, e)}
//         />
//       </div>
//       <div className="text-xs" style={{ marginBottom: '58px', color: '#bbc8e2' }}>激活来完成 Design Fusion 激活进程。</div>
//       <Button
//         className="login-btn bg-primary h-7 text-white w-60 text-xs hover:text-white rounded-sm mb-7 w-60"
//         onClick={async() => {
//           const homeDirPath = await homeDir();
//           await writeFile(
//             `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.Active}`,
//             `123`
//           );
//           await invoke('open_home', {
//             width: window.innerWidth,
//             height: window.innerHeight,
//           });
//           const loginWindow = WebviewWindow.getByLabel("Login");
//           loginWindow?.close();
//         }}
//       >
//         激活
//       </Button>
//       <div className="text-primary text-xs">
//         代理服务器设置
//       </div>
//     </div>
//     <div className="flex flex-col items-center flex-1">
//       <div style={{ width: '1px', background: '#cdcdcd', height: '140px', opacity: 0.68 }}></div>
//       <div style={{ marginTop: '12px', marginBottom: '12px' }} className="text-xs text-primary">或</div>
//       <div style={{ width: '1px', background: '#cdcdcd', height: '140px', opacity: 0.68 }}></div>
//     </div>
//     {/* <Divider type='vertical' orientation="center" plain>1231</Divider> */}
//     <div className='flex-1' style={{ paddingTop: '38px', paddingRight: '27px', paddingBottom: '8px' }}>
//       <div style={{ marginLeft: '9px', fontWeight: 600, fontSize: '18px', fontFamily: 'PingFang SC, PingFang SC-Medium' }}>
//         订阅
//       </div>
//       <div className='text-primary' style={{ marginBottom: '50px', fontSize: '12px', marginLeft: '9px', }}>使用 OnChain 产品用户ID登陆</div>
//       <OnChainForm className="active_form" name="login" form={form}>
//         {formItems.map((item, index) => (
//           <OnChainFormItem
//             key={"item" + index}
//             name={item.name}
//             content={item.content}
//             rules={item.rules}
//           ></OnChainFormItem>
//         ))}
//       </OnChainForm>
//       <Button
//         style={{ marginTop: '30px' }}
//         className="login-btn bg-primary h-7 text-white w-60 text-xs hover:text-white rounded-sm mb-7"
//         onClick={() => { }}
//       >
//         登陆
//       </Button>
//     </div>
//   </div>
// }
