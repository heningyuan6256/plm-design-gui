import { FC, Fragment, useEffect, useRef, useState } from "react";
import Database from "tauri-plugin-sql-api";
//@ts-ignore
import CryptoJS from "crypto-js";
import { useDrop } from "ahooks";
import {
  ActionButton,
  Button,
  Form,
  Image,
  Text,
  TextArea,
  TextField,
} from "@adobe/react-spectrum";
//@ts-ignore
import IPut from "IPut";
import { Controller, useForm } from "react-hook-form";
import OnChainSvg from "../assets/image/OnChainLogo.svg";
import verticalLogo from "../assets/image/verticallogo.png";
import whiteVerticalLogo from "../assets/image/whiteVerticalLogo.png";
import successSvg from "../assets/image/success.svg";
import PlmIcon from "../components/PlmIcon";
import { LogicalSize, appWindow, getCurrent } from "@tauri-apps/api/window";

const FormLabel: FC<{ value: string }> = ({ value }) => {
  return (
    <div className="formlabel">
      <Text>{value}</Text>
    </div>
  );
};

const center: FC = () => {
  let [isSuccess, setSuccess] = useState(false);
  let [viewDetail, setViewDetail] = useState(false);
  const dropAreaRef = useRef<any>();
  useDrop(dropAreaRef, {
    onDom: (content: string, e) => {
      console.log(content);
      console.log(e);
    },
    onDragEnter: (e) => {
      console.log(e);
      // console.log(e.path[0].className);
      // if (e.path[0].className === 'treeSpanText') {
      // }
    },
    // onDragOver: (e) => {
    //   console.log(e);
    // },
    onDragLeave: (e) => {
      console.log(e);
      // if (e.path[0].className === 'treeSpanText') {
      // }
    },
  });

  useEffect(() => {
    const currentWindow = getCurrent();
    if (isSuccess) {
      if (viewDetail) {
        currentWindow.setSize(new LogicalSize(486, 280)).then(() => {
          currentWindow.center();
        });
      } else {
        currentWindow.setSize(new LogicalSize(240, 198)).then(() => {
          currentWindow.center();
        });
      }
    } else {
      currentWindow.setSize(new LogicalSize(700, 420)).then(() => {
        currentWindow.center();
      });
    }
  }, [isSuccess, viewDetail]);

  let onSubmit = async (data: any) => {
    // let data = Object.fromEntries(new FormData(res.currentTarget));

    const db = await Database.load(
      `postgres://postgres:${data.password}@${data.address}:${data.port}/mk`
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
        // "llI2oTmhCfPN7Y/ymgG6I8bYlQ6U+EeMRkJlBcKmqQTrqcgontPga0BkGdvV8iHPDrgEou/G8a1JsE61wQeeyvV5yvJXBc+RShME+Pl5AeC+AbI4IGMrfxojNs3/qVcSbp1T5CFCcv7Tfh6dqCemvw==";
        const sKey = CryptoJS.enc.Utf8.parse("len16 secret key");

        const decrypted = CryptoJS.AES.decrypt(word, sKey, {
          iv: sKey,
          mode: CryptoJS.mode.CBC, // CBC算法
          padding: CryptoJS.pad.Pkcs7, //使用pkcs7 进行padding 后端需要注意
        });

        decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
      } catch (error) {}
      console.log(decryptedData, "decryptedData");

      if (!decryptedData) {
        alert("授权码不正确");
        return;
      }

      setStep("2");
    }
  };

  let { handleSubmit, control } = useForm({
    defaultValues: {
      address: "192.168.0.104",
      password: "123456",
      account: "postgre",
      port: "32768",
      userCount: "99",
    },
  });

  /**授权用户账号 */
  let { control: detailControl } = useForm({
    defaultValues: {
      loginName: "192.168.0.104",
      loginPassword: "123456",
      userCount: "postgre",
      Time: "永久授权",
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
                onPressUp={() => {
                  setStep("1");
                }}
              >
                测试
              </ActionButton>
            </span>
            <span className="register_confirm">
              <Button variant="accent" type="submit">
                授权
              </Button>
            </span>
          </Fragment>
        )}
      </div>
    );
  };

  if (isSuccess) {
    if (viewDetail) {
      return (
        <div className="detail h-full w-full text-center bg-white">
          <div
            data-tauri-drag-region
            className="absolute top-0 w-full h-4 z-10"
          ></div>
          <div className="absolute top-2 right-2 toolbar">
            <PlmIcon
              style={{ color: "#DFE9F5", fontSize: "12px", marginLeft: "12px" }}
              name="close"
              onClick={() => {
                appWindow.close();
              }}
            ></PlmIcon>
          </div>
          <div className="flex overflow-hidden h-full">
            <div
              className="bg-primary h-full flex justify-center items-center"
              style={{ widows: "158px", minWidth: "158px", overflow: "hidden" }}
            >
              <Image src={whiteVerticalLogo} width={68} height={78}></Image>
            </div>
            <div
              className="flex-1 overflow-hidden"
              style={{ padding: "28px 30px 36px 30px" }}
            >
              <Form onSubmit={handleSubmit(onSubmit)}>
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
                            value={value}
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
                            value={value}
                            placeholder="请输入密码"
                            isReadOnly
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
                            value={value}
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
                  <table style={{ borderCollapse: "collapse" }} border={2}>
                    <tbody>
                      {[
                        [{ name: "产品数据管理" }, { name: "项目管理" }],
                        [{ name: "office/2D文件可视化" }, { name: "质量管理" }],
                        [{ name: "3D 文件可视化" }, { name: "SBOM" }],
                      ].map((row, index) => {
                        return (
                          <tr key={index}>
                            {row.map((col) => {
                              return (
                                <td
                                  key={col.name}
                                  style={{ border: "1px solid #ecedf0" }}
                                >
                                  {col.name}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Fragment>
              </Form>
            </div>
          </div>
          {/* <div className="flex justify-center pt-5">
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
            setViewDetail(true);
          }}
        >
          查看授权内容
        </Button>
      </div> */}
        </div>
      );
    }
    return (
      <div className="active h-full w-full text-center bg-white relative">
        <div
          data-tauri-drag-region
          className="absolute top-0 w-full h-4 z-10"
        ></div>
        <div className="absolute top-2 right-2 toolbar z-20">
          <PlmIcon
            style={{ color: "#DFE9F5", fontSize: "12px", marginLeft: "12px" }}
            name="close"
            onClick={() => {
              appWindow.close();
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
              setViewDetail(true);
            }}
          >
            查看授权内容
          </Button>
        </div>
      </div>
    );
  }

  return (
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
            授权工具 - 版本1.0.0
          </div>
        </div>
        <div
          className="flex-1 overflow-hidden relative"
          style={{
            paddingLeft: "50px",
            paddingTop: "38px",
            paddingRight: "36px",
          }}
        >
          <div className="flex absolute" style={{ left: "20px", top: "5px" }}>
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
                      background: isCurrent ? "#0563B2" : "#dfe9f5",
                      boxShadow: `0 0 0 2px ${
                        isCurrent ? "#0563B2" : "#dfe9f5"
                      }`,
                      transform: "scale(0.8)",
                    }}
                  >
                    {item.value}
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

          <div className="absolute top-0 right-0 toolbar">
            <PlmIcon
              style={{ color: "#DFE9F5", fontSize: "12px" }}
              name="minimize"
              onClick={() => {
                appWindow.minimize();
              }}
            ></PlmIcon>
            <PlmIcon
              style={{ color: "#DFE9F5", fontSize: "12px", marginLeft: "12px" }}
              name="close"
              onClick={() => {
                appWindow.close();
              }}
            ></PlmIcon>
          </div>

          {step == "2" ? (
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
                        <IPut defaultValue={value} onChange={onChange}></IPut>
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
                      value={value}
                      onChange={onChange}
                      marginTop={"8px"}
                    />
                  </div>
                )}
              />
              <Fragment>
                <FormLabel value="模块:"></FormLabel>
                <table style={{ borderCollapse: "collapse" }} border={2}>
                  <tbody>
                    {[
                      [{ name: "产品数据管理" }, { name: "项目管理" }],
                      [{ name: "office/2D文件可视化" }, { name: "质量管理" }],
                      [{ name: "3D 文件可视化" }, { name: "SBOM" }],
                    ].map((row, index) => {
                      return (
                        <tr key={index}>
                          {row.map((col) => {
                            return (
                              <td
                                key={col.name}
                                style={{ border: "1px solid #ecedf0" }}
                              >
                                {col.name}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
          ) : (
            <Form onSubmit={onSubmitKey}>
              {/* <Controller
                control={control}
                name="address"
                rules={{ required: "address is required." }}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <div>
                    <FormLabel value="授权码:"></FormLabel>
                    <TextArea name="secret_key" height={184}></TextArea>
                  </div>
                  // <TextField
                  //   label="Name"
                  //   name={name}
                  //   value={value}
                  //   onChange={onChange}
                  //   onBlur={onBlur}
                  //   ref={ref}
                  //   isRequired
                  //   errorMessage={error?.message}
                  // />
                )}
              /> */}
              {/* <div> */}
              <FormLabel value="授权码:"></FormLabel>
              <TextArea name="secret_key" height={184}></TextArea>
              {/* </div> */}
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
  );
};

export default center;
