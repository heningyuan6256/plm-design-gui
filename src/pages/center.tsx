import { FC, Fragment, useEffect, useRef, useState } from "react";
import Database from "tauri-plugin-sql-api";
//@ts-ignore
import CryptoJS from "crypto-js";
import { useDrop, useMount } from "ahooks";
import {
  ActionButton,
  Button,
  Form,
  Image,
  ProgressCircle,
  Text,
  TextArea,
  TextField,
} from "@adobe/react-spectrum";
//@ts-ignore
import IPut from "IPut";
import { Controller, useForm } from "react-hook-form";
import OnChainSvg from "../assets/image/OnChainLogo.svg";
import stickSvg from "../assets/image/stick.svg";
import resetSvg from "../assets/image/reset.svg";
import verticalLogo from "../assets/image/verticallogo.png";
import blue1 from "../assets/image/blue1.png";
import blue2 from "../assets/image/blue2.png";
import lgBlue1 from "../assets/image/lgBlue1.png";
import lgBlue2 from "../assets/image/lgBlue2.png";
import whiteVerticalLogo from "../assets/image/whiteVerticalLogo.png";
import addPng from "../assets/image/add.png";
import successSvg from "../assets/image/success.svg";
import PlmIcon from "../components/PlmIcon";
import { LogicalSize, appWindow, getCurrent } from "@tauri-apps/api/window";
import { clipboard, invoke } from "@tauri-apps/api";
import PlmLoading from "../components/PlmLoading";

// 分隔每两个对象的函数
function splitArrayIntoPairs(arr: any) {
  const pairs = [];

  for (let i = 0; i < arr.length; i += 2) {
    if (i + 1 < arr.length) {
      // 检查是否还有两个对象可以分隔
      pairs.push([arr[i], arr[i + 1]]);
    } else {
      pairs.push([arr[i]]); // 如果只有一个对象剩下，将其放入一个数组中
    }
  }

  return pairs;
}

const FormLabel: FC<{ value: string; suffix?: any }> = ({ value, suffix }) => {
  return (
    <div className="formlabel">
      <div>
        <Text>{value}</Text>
      </div>
      {suffix}
    </div>
  );
};

const center: FC = () => {
  let [isSuccess, setSuccess] = useState(false);
  let [viewDetail, setViewDetail] = useState(false);
  const [dropVisible, setDropVisible] = useState(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [modules, setModules] = useState<any>([]);
  const [maxUser, setMaxUser] = useState<any>(0);
  const [canAuth, setCanAuth] = useState<boolean>(false);
  const [isLoadingOpen, setIsLoadingOpen] = useState<boolean>(false);

  const dropAreaRef = useRef<any>();
  const TextAreaRef = useRef<any>();
  useEffect(() => {
    window.addEventListener("drop", (e) => e.preventDefault(), false);
    window.addEventListener("dragover", (e) => e.preventDefault(), false);
  }, []);

  useMount(() => {
    document
      .getElementById("textRefId")
      ?.addEventListener("mouseleave", (e) => {
        //@ts-ignore
        e.target?.blur();
      });

    document.getElementById("textRefId")?.addEventListener("drop", (v: any) => {
      const e = v.dataTransfer.files;
      if (e[0] && e[0].name) {
        if (e[0].name.substring(e[0].name.lastIndexOf(".") + 1) === "lic") {
          if (typeof FileReader === "undefined") {
            alert("该浏览器不支持File API");
            return;
          }
          var reader = new FileReader(); // 创建新的FileReader对象
          reader.onload = function (data) {
            setDropVisible(false);
            setValue("secret_key", String(data.target?.result));
            // 将内容显示到页面上的指定位置（这里使用id为'output'的div）
          };
          reader.readAsText(e[0]); // 开始读取文件
        } else {
          alert("文件格式不对");
        }
      } else {
      }
      //@ts-ignore
      e.target?.blur();
    });
  });

  useEffect(() => {
    if (!dropVisible) {
      setIsDragging(false);
    }
  }, [dropVisible]);
  useDrop(dropAreaRef, {
    onDom: (content: string, e) => {},
    onDragEnter: (e) => {
      setIsDragging(true);
      // console.log(e.path[0].className);
      // if (e.path[0].className === 'treeSpanText') {
      // }
    },
    onFiles: (e) => {
      if (e[0] && e[0].name) {
        if (e[0].name.substring(e[0].name.lastIndexOf(".") + 1) === "lic") {
          if (typeof FileReader === "undefined") {
            alert("该浏览器不支持File API");
            return;
          }
          var reader = new FileReader(); // 创建新的FileReader对象
          reader.onload = function (data) {
            setDropVisible(false);
            setValue("secret_key", String(data.target?.result));
            // 将内容显示到页面上的指定位置（这里使用id为'output'的div）
          };
          reader.readAsText(e[0]); // 开始读取文件
        } else {
          alert("文件格式不对");
        }
      } else {
      }
    },
    onDragOver: (e) => {
      setIsDragging(true);
    },
    onDragLeave: (e) => {
      setIsDragging(false);

      // if (e.path[0].className === 'treeSpanText') {
      // }
    },
  });

  // useEffect(() => {
  //   const currentWindow = getCurrent();
  //   if (isSuccess) {
  //     if (viewDetail) {
  //       currentWindow.setSize(new LogicalSize(486, 280)).then(() => {
  //         currentWindow.center();
  //       });
  //     } else {
  //       currentWindow.setSize(new LogicalSize(240, 198)).then(() => {
  //         currentWindow.center();
  //       });
  //     }
  //   } else {
  //     currentWindow.setSize(new LogicalSize(700, 420)).then(() => {
  //       currentWindow.center();
  //     });
  //   }
  // }, [isSuccess, viewDetail]);

  let onSubmit = async (data: any) => {
    // let data = Object.fromEntries(new FormData(res.currentTarget));

    const db = await Database.load(
      `postgres://${data.account}:${data.password}@${data.address}:${data.port}/mk`
    ).catch((err) => {
      console.log(err, "err");
      alert(err);
    });
    if (!db) {
      return;
    }

    const res = await db.select("SELECT * FROM pdm_system_module", []);

    const updateRes = await db.execute(
      `UPDATE "public"."pdm_system_module" SET api_context = $1 WHERE id = $2`,
      ["123", "1640900750563016709"]
    );
    console.log(updateRes, "res");
    db.close();

    setSuccess(true);
    setViewDetail(true);

    {
      /* TODO修改网关*/
    }

    {
      /* 远程进部署的服务器执行docker-compose命令启动服务*/
    }

    // console.log(JSON.stringify(res), "JSON.stringify(res)");
  };

  let onSubmitKey = (e: any) => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data, "data");

    if (!data.secret_key) {
      alert("授权码不能为空");
      return;
    }
    // console.log(getValues(),'ress');
    // Get form data as an object.

    {
      /* TODO解析授权码获取超级管理员、功能模块，以及用户数 */
    }

    {
      /* TODO安装所有的docker服务*/
    }

    {
      /* TODO启动mysql数据库，连接mysql数据库然后修改用户数以及功能模块*/
      // 加密每一个模块,生成一个带有密钥的对象「name,apicode,secret」
      let decryptedData = null;
      try {
        const word = data.secret_key;
        // "uD9LOCB44MGKAlXIpxlSsAq2+Ft5qaMgI72/SWR3yqYGI4ePNqTchM5ZyCZU0sR1AzLPPJhHXWw2FGapvdCHrAouY/zQwQ9wEFAkyojCWPuwXzrfbS/ilmmIZ9QV1hHjxfhl54zPdajHO1ygnHxfpA==";
        // 偏移量
        let iv = "0000000000000000";
        // 加密内容
        let message = word;
        // 密钥，长度必须为16
        let secret_key = "OnChainPlmSecret";

        // utf-8 转换
        // message = CryptoJS.enc.Utf8.parse(message);
        secret_key = CryptoJS.enc.Utf8.parse(secret_key);
        iv = CryptoJS.enc.Utf8.parse(iv);

        // Decrypt
        var bytes = CryptoJS.AES.decrypt(message, secret_key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        
      }

      if (!decryptedData) {
        alert("授权码不正确");
        return;
      }
      
      const modules = JSON.parse(decryptedData).modules[0];
      const array = Object.keys(modules).map((item) => {
        return {
          id: item,
          ...modules[item],
        };
      });
      const splitModules = splitArrayIntoPairs(array);

      setModules(splitModules);
      setMaxUser(splitModules[0][0].user_num);

      console.log(decryptedData,'decryptedData');
      
      

      setStep("2");
    }
  };

  let { handleSubmit, control, watch, getValues } = useForm({
    defaultValues: {
      address: "192.168.0.104",
      password: "123456",
      account: "postgres",
      port: "32768",
      userCount: "99",
    },
  });

  const watchAllFields = watch();

  useEffect(() => {
    setCanAuth(false);
  }, [
    watchAllFields.address,
    watchAllFields.account,
    watchAllFields.port,
    watchAllFields.password,
  ]);

  /**授权用户账号 */
  let { control: detailControl } = useForm({
    defaultValues: {
      loginName: "192.168.0.104",
      loginPassword: "123456",
      userCount: "postgre",
      Time: "永久授权",
    },
  });

  let { setValue, control: keyControl } = useForm({
    defaultValues: {
      secret_key: "",
    },
  });

  const tabList = [
    { label: "粘贴授权码", value: "1" },
    { label: "填写信息", value: "2" },
  ];

  const [step, setStep] = useState("1");

  const submitFoot = () => {
    return (
      <div
        style={{
          position: "absolute",
          bottom: "0px",
          right: "0px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {step == "1" ? (
          <span className="register_confirm">
            <Button variant="accent" type="submit">
              下一步
            </Button>
          </span>
        ) : (
          <Fragment>
            {" "}
            <span className="register_cancel">
              <ActionButton
                onPressUp={() => {
                  setStep("1");
                }}
              >
                上一步
              </ActionButton>
            </span>
            <span className="register_cancel">
              <ActionButton
                onPressUp={async () => {
                  setIsLoadingOpen(true);
                  let canContinue = true;
                  const data = getValues();
                  console.log(
                    `postgres://${data.account}:${data.password}@${data.address}:${data.port}/mk`,
                    "123"
                  );

                  await Database.load(
                    `postgres://${data.account}:${data.password}@${data.address}:${data.port}/mk`
                  ).catch((err) => {
                    canContinue = false;
                    alert(err);
                  });
                  setIsLoadingOpen(false);
                  if (canContinue) {
                    alert("连接成功");
                    setCanAuth(true);
                  }
                }}
              >
                测试
              </ActionButton>
            </span>
            <span className="register_confirm">
              <Button isDisabled={!canAuth} variant="accent" type="submit">
                授权
              </Button>
            </span>
          </Fragment>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (viewDetail && !isSuccess) {
      invoke("take_screen_shot");
      // html2canvas(document.body).then((canvas) => {
      //   console.log(canvas.toDataURL(),'13');

      // });
    }
  }, [viewDetail, isSuccess]);

  return (
    <PlmLoading
      loading={isLoadingOpen}
      loadingChildren={<ProgressCircle aria-label="Loading…" isIndeterminate />}
    >
      <div className="w-full h-full flex items-center justify-center py-5 pr-5 rounded-lg relative">
        <div
          data-tauri-drag-region
          className="absolute top-0 w-full h-4 z-10"
        ></div>
        <div className="flex w-full overflow-hidden h-full">
          <div
            className="flex justify-center items-center register_title flex-col overflow-hidden relative"
            style={{
              width: "284px",
              minWidth: "284px",
              borderRight: "1px solid #e3e7ef",
            }}
          >
            <div className="absolute top-0 register_head left-5">
              <Image src={OnChainSvg} width={110}></Image>
            </div>
            <div>全新超融合云原生</div>
            <div>产品全生命周期赋能平台</div>
            <div className="absolute bottom-0 register_foot left-5">
              授权工具 - 版本3.0.0
            </div>
          </div>
          <div
            className="flex-1 overflow-hidden relative"
            style={{
              paddingLeft: "30px",
              paddingTop: "38px",
              paddingRight: "10px",
            }}
          >
            {!viewDetail && (
              <div
                className="flex absolute"
                style={{ left: "20px", top: "5px" }}
              >
                {tabList.map((item) => {
                  const isCurrent = step == item.value;
                  return (
                    <div
                      key={item.value}
                      className={`flex items-center mr-4 relative ${
                        isCurrent ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                    >
                      <div
                        className="h-3 w-3 overflow-hidden text-white flex items-center justify-center"
                        style={{
                          borderRadius: "50%",
                          marginRight: "6px",
                          // background: isCurrent ? "#0563B2" : "#dfe9f5",
                          // boxShadow: `0 0 0 2px ${
                          //   isCurrent ? "#0563B2" : "#dfe9f5"
                          // }`,
                          // transform: "scale(0.8)",
                        }}
                      >
                        <Image
                          src={
                            isCurrent
                              ? item.value == "1"
                                ? blue1
                                : blue2
                              : item.value == "1"
                              ? lgBlue1
                              : lgBlue2
                          }
                          width={12}
                        ></Image>
                        {/* {item.value} */}
                      </div>{" "}
                      <span
                        style={{
                          color: isCurrent ? "#0563B2" : "#DFE9F5",
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </span>
                      {isCurrent ? (
                        <div
                          className="bg-primary w-full absolute"
                          style={{ height: "2px", bottom: "-2px" }}
                        ></div>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className="absolute top-0 right-0 toolbar"
              style={{ lineHeight: "12px" }}
            >
              <PlmIcon
                style={{ color: "#DFE9F5", fontSize: "12px" }}
                name="minimize"
                onClick={() => {
                  appWindow.minimize();
                }}
              ></PlmIcon>
              <PlmIcon
                style={{
                  color: "#DFE9F5",
                  fontSize: "12px",
                  marginLeft: "12px",
                }}
                name="close"
                onClick={() => {
                  appWindow.close();
                }}
              ></PlmIcon>
            </div>

            {step == "2" ? (
              <Fragment>
                {viewDetail ? (
                  <div className="detail h-full w-full text-center bg-white">
                    <div className="flex overflow-hidden h-full">
                      {/* <div
                        className="bg-primary h-full flex justify-center items-center"
                        style={{
                          widows: "158px",
                          minWidth: "158px",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={whiteVerticalLogo}
                          width={68}
                          height={78}
                        ></Image>
                      </div> */}
                      <div
                        className="flex-1 overflow-hidden"
                        // style={{ padding: "28px 30px 36px 30px" }}
                      >
                        <Form>
                          <div className="flex overflow-hidden">
                            <div
                              className="flex-1 overflow-hidden"
                              style={{ paddingRight: "10px" }}
                            >
                              <Controller
                                control={detailControl}
                                name="loginName"
                                rules={{ required: "account is required." }}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Fragment>
                                    <FormLabel value="授权账号:"></FormLabel>
                                    <TextField
                                      isReadOnly
                                      value={"admin"}
                                      // placeholder="请输入账号"
                                      onChange={onChange}
                                      marginTop={"8px"}
                                    />
                                  </Fragment>
                                )}
                              />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <Controller
                                control={detailControl}
                                name="loginPassword"
                                rules={{ required: "password is required." }}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Fragment>
                                    <FormLabel value="授权密码:"></FormLabel>
                                    <TextField
                                      value={"123456"}
                                      placeholder="请输入密码"
                                      isReadOnly
                                      marginTop={"8px"}
                                      // type="password"
                                      onChange={onChange}
                                      name="password"
                                    ></TextField>
                                  </Fragment>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex overflow-hidden">
                            <div
                              className="flex-1 overflow-hidden"
                              style={{ paddingRight: "10px" }}
                            >
                              <Controller
                                control={detailControl}
                                name="userCount"
                                rules={{ required: "account is required." }}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Fragment>
                                    <FormLabel value="授权用户数"></FormLabel>
                                    <TextField
                                      value={maxUser}
                                      placeholder="请输入账号"
                                      isReadOnly
                                      onChange={onChange}
                                      marginTop={"8px"}
                                    />
                                  </Fragment>
                                )}
                              />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <Controller
                                control={detailControl}
                                name="Time"
                                rules={{ required: "password is required." }}
                                render={({
                                  field: { name, value, onChange, onBlur, ref },
                                  fieldState: { invalid, error },
                                }) => (
                                  <Fragment>
                                    <FormLabel value="授权时间:"></FormLabel>
                                    <TextField
                                      value={value}
                                      placeholder="请输入密码"
                                      isReadOnly
                                      marginTop={"8px"}
                                      onChange={onChange}
                                    ></TextField>
                                  </Fragment>
                                )}
                              />
                            </div>
                          </div>
                          <Fragment>
                            <FormLabel value="当前授权模块:"></FormLabel>
                            <div style={{ overflow: "auto" }}>
                              <table
                                style={{
                                  borderCollapse: "collapse",
                                  width: "100%",
                                }}
                                border={2}
                              >
                                <tbody>
                                  {modules.map((row: any, index: number) => {
                                    return (
                                      <tr key={index}>
                                        {row.map((col: any) => {
                                          return (
                                            <td
                                              key={col.desc}
                                              style={{
                                                border: "1px solid #ecedf0",
                                              }}
                                            >
                                              {col.desc}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </Fragment>
                        </Form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex overflow-hidden">
                      <div
                        className="flex-1 overflow-hidden"
                        style={{ paddingRight: "10px" }}
                      >
                        <Controller
                          control={control}
                          name="address"
                          rules={{ required: "address is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <div className="overflow-hidden">
                              <FormLabel value="服务器地址:"></FormLabel>
                              <IPut
                                defaultValue={value}
                                onChange={onChange}
                              ></IPut>
                            </div>
                          )}
                        />
                      </div>
                      <div className="overflow-hidden w-24">
                        <Controller
                          control={control}
                          name="port"
                          rules={{ required: "password is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <Fragment>
                              <FormLabel value="端口号:"></FormLabel>
                              <TextField
                                value={value}
                                placeholder="请输入密码"
                                marginTop={"8px"}
                                onChange={onChange}
                              ></TextField>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex overflow-hidden">
                      <div
                        className="flex-1 overflow-hidden"
                        style={{ paddingRight: "10px" }}
                      >
                        <Controller
                          control={control}
                          name="account"
                          rules={{ required: "account is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <Fragment>
                              <FormLabel value="数据库用户:"></FormLabel>
                              <TextField
                                value={value}
                                placeholder="请输入账号"
                                onChange={onChange}
                                marginTop={"8px"}
                              />
                            </Fragment>
                          )}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <Controller
                          control={control}
                          name="password"
                          rules={{ required: "password is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <Fragment>
                              <FormLabel value="数据库密码:"></FormLabel>
                              <TextField
                                value={value}
                                placeholder="请输入密码"
                                marginTop={"8px"}
                                type="password"
                                onChange={onChange}
                                name="password"
                              ></TextField>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                    <Controller
                      control={control}
                      name="userCount"
                      rules={{ required: "userCount is required." }}
                      render={({
                        field: { name, value, onChange, onBlur, ref },
                        fieldState: { invalid, error },
                      }) => (
                        <div>
                          <div>
                            <FormLabel value="并发用户数:"></FormLabel>
                          </div>

                          <TextField
                            isReadOnly
                            value={maxUser}
                            onChange={onChange}
                            marginTop={"8px"}
                          />
                        </div>
                      )}
                    />
                    <Fragment>
                      <FormLabel value="模块:"></FormLabel>
                      <div style={{ maxHeight: "72px", overflow: "auto" }}>
                        <table
                          style={{ borderCollapse: "collapse", width: "100%" }}
                          border={2}
                        >
                          <tbody>
                            {modules.map((row: any, index: number) => {
                              return (
                                <tr key={index}>
                                  {row.map((col: any) => {
                                    return (
                                      <td
                                        key={col.desc}
                                        style={{ border: "1px solid #ecedf0" }}
                                      >
                                        {col.desc}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* <div className="flex" style={{ flexWrap: "wrap" }}>
                    {[
                      { name: "产品" },
                      { name: "测试1" },
                      { name: "测试2" },
                      { name: "测试2" },
                    ].map((item) => {
                      return (
                        <div
                          style={{
                            borderTop: "1px solid #ecedf0",
                            borderRight: "1px solid #ecedf0",
                            width: "50%",
                          }}
                        >
                          {item.name}
                        </div>
                      );
                    })}
                  </div> */}
                      {/* <table>
                    {[{name: '产品'}].map((item) => {
                      return (
                        <tr>
                          <td>1</td>
                          <td>2</td>
                        </tr>
                      );
                    })}
                  </table> */}
                    </Fragment>
                    {submitFoot()}
                  </Form>
                )}
              </Fragment>
            ) : (
              <Form onSubmit={onSubmitKey}>
                <div className="relative">
                  <FormLabel
                    value="授权码:"
                    suffix={
                      <div className="flex items-center key_suffix">
                        <span
                          onClick={() => {
                            clipboard.readText().then((res) => {
                              const text = res || "";
                              setValue("secret_key", text);
                              setIsDragging(false);
                              setDropVisible(!text);
                            });
                          }}
                          style={{ marginRight: "6px" }}
                        >
                          <Image src={stickSvg} width={12}></Image>
                        </span>
                        <span
                          onClick={() => {
                            setValue("secret_key", "");
                            setDropVisible(true);
                          }}
                        >
                          <Image src={resetSvg} width={12}></Image>
                        </span>
                      </div>
                    }
                  ></FormLabel>

                  {/* {dropVisible ? ( */}
                  <div
                    ref={dropAreaRef}
                    className={`w-full bg-transparent absolute flex justify-center items-center`}
                    style={{
                      zIndex: dropVisible ? "20" : "-1",
                      height: "250px",
                      marginTop: "8px",
                      border: isDragging ? "2px solid #0563B2" : "none",
                      borderRadius: "2px",
                      transition: "border 0.3s",
                    }}
                    onClick={() => {
                      TextAreaRef.current.focus();
                    }}
                  >
                    {isDragging ? (
                      <div
                        style={{
                          color: "#0563B2",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        拖拽中...
                      </div>
                    ) : (
                      <div>
                        <div className="drag_icon">
                          <Image src={addPng} width={24}></Image>
                        </div>
                        <div className="drag_text">拖动至此处粘贴</div>
                      </div>
                    )}
                  </div>
                  {/* ) : (
                  <></>
                )} */}

                  <Controller
                    control={keyControl}
                    name="secret_key"
                    rules={{ required: "password is required." }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <Fragment>
                        <div className="mt-2">
                          <TextArea
                            id="textRefId"
                            ref={TextAreaRef}
                            value={value}
                            onFocus={() => {
                              setDropVisible(false);
                            }}
                            zIndex={10}
                            onBlur={(e: any) => {
                              // 如果有值则不显示
                              if (e.target?.value) {
                                setDropVisible(false);
                              } else {
                                setDropVisible(true);
                              }
                            }}
                            onChange={onChange}
                            name="secret_key"
                            height={250}
                          ></TextArea>
                        </div>
                      </Fragment>
                    )}
                  />
                </div>

                {submitFoot()}
              </Form>
            )}
          </div>
        </div>
        {/* <ActiveSuccess
        isOpen={isOpen}
        onClose={() => {
          setOpen(false);
        }}
      ></ActiveSuccess> */}
      </div>
      <PlmLoading
        loading={isSuccess}
        loadingChildren={
          <div
            className="active h-full w-full text-center bg-white relative"
            style={{ width: "240px", height: "198px" }}
          >
            <div className="absolute top-0 w-full h-4 z-10"></div>
            <div
              className="absolute toolbar z-20 top-2 right-2"
              style={{ lineHeight: "12px" }}
            >
              <PlmIcon
                style={{
                  color: "#DFE9F5",
                  fontSize: "12px",
                }}
                name="close"
                onClick={() => {
                  setSuccess(false);
                  // appWindow.close();
                }}
              ></PlmIcon>
            </div>
            <div className="flex justify-center pt-5">
              <Image src={verticalLogo} width={68} height={78}></Image>
            </div>
            <div className="active_success flex justify-center">
              <Image src={successSvg} width={16} height={16}></Image>{" "}
              <span style={{ marginLeft: "6px" }}>授权成功</span>
            </div>
            <div>
              <Button
                variant="accent"
                onPress={() => {
                  setSuccess(false);
                  // setTimeout()
                }}
              >
                查看授权内容
              </Button>
            </div>
          </div>
        }
      ></PlmLoading>
    </PlmLoading>
  );
};

export default center;
