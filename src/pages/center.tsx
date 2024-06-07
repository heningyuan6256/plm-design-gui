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
  Item,
  Picker,
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
import hideSvg from "../assets/image/hide.svg";
import showSvg from "../assets/image/show.svg";
import PlmIcon from "../components/PlmIcon";
import { LogicalSize, appWindow, getCurrent } from "@tauri-apps/api/window";
import { clipboard, http, invoke } from "@tauri-apps/api";
import PlmLoading from "../components/PlmLoading";
import { flatten, isEmpty } from "lodash";
import { Utils } from "../utils";
import { resolveResource } from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/api/fs";
import * as minio from "minio";

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
  const [extraData, setExtraData] = useState<any>({});
  const [maxUser, setMaxUser] = useState<any>(0);
  const [canAuth, setCanAuth] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [isLoadingOpen, setIsLoadingOpen] = useState<boolean>(false);

  const dropAreaRef = useRef<any>();
  const TextAreaRef = useRef<any>();
  useEffect(() => {
    window.addEventListener("drop", (e) => e.preventDefault(), false);
    window.addEventListener("dragover", (e) => e.preventDefault(), false);
  }, []);

  useMount(() => {
    document.getElementById("textRefId")?.addEventListener("mouseleave", (e) => {
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

  const toSecret: any = (message: string) => {
    // 偏移量
    let iv = "0000000000000000";
    let secret_key = "OnChainPlmSecret";

    message = CryptoJS.enc.Utf8.parse(message);
    secret_key = CryptoJS.enc.Utf8.parse(secret_key);
    iv = CryptoJS.enc.Utf8.parse(iv);

    var ciphertext = CryptoJS.AES.encrypt(message, secret_key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return ciphertext.toString();
  };
  const updateModules = async ({ db }: { db: any }) => {
    const modulesStatus = Utils.transformArrayToMap(flatten(modules), "id", "status");

    // 将数据加密塞入数据库 修改模块
    const dbModules: any = await db.select("SELECT * FROM pdm_system_module", []);
    for (let i = 0; i < dbModules.length; i++) {
      await db.execute(`UPDATE "public"."pdm_system_module" SET api_context = $1 WHERE apicode = $2`, [
        toSecret(
          JSON.stringify({
            apicode: dbModules[i]?.apicode,
            time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            active: modulesStatus[dbModules[i]?.apicode] === "on" ? "1" : "0",
            kubeConfig: extraData.kubeConfig,
          })
        ),
        dbModules[i].apicode,
      ]);
    }

    const mgnt_tenants: any = await db.select("SELECT * FROM plm_mgnt_tenants", []);
    if (mgnt_tenants[0]) {
      await db.execute(
        `UPDATE "public"."plm_mgnt_tenants" SET user_limit = $1, max_simultaneous_user = $2, end_time = $3, type = $4 WHERE org_id = $5`,
        [
          toSecret(
            JSON.stringify({
              time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
              count: String(extraData.maxUserNum),
              kubeConfig: extraData.kubeConfig,
            })
          ),
          toSecret(
            JSON.stringify({
              time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
              count: String(maxUser),
              kubeConfig: extraData.kubeConfig,
            })
          ),
          toSecret(
            JSON.stringify({
              time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
              endTime: `${extraData.period} 00:00:00`,
              kubeConfig: extraData.kubeConfig,
            })
          ),
          toSecret(
            JSON.stringify({
              time: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
              type: `${extraData.isWar ? "civil" : ""}`,
              kubeConfig: extraData.kubeConfig,
            })
          ),
          mgnt_tenants[0].org_id,
        ]
      );
    }
  };

  const updateDB = async ({ db }: { db: any }) => {
    // // 判断里面是否被加密过
    // const userData = await db.select(`select * from pdm_user`);
    // //@ts-ignore
    // const isInit = userData[0]?.tenant_id != extraData.tenantId;

    // 如果不是初始化，则不改数据，只修改模块
    // if (!isInit) {
    //   await updateModules({ db });
    // } else {
    // 更新部门的信息
    const tenantId = extraData.tenantId;
    let userName = extraData.name;
    let userId = extraData.workNo;
    let userEmail = extraData.email;

    let updateTenantId = [
      `update pdm_user set tenant_id = '${tenantId}'`,
      `update pdm_user_attribute_base set attr_value = '${tenantId}' where attr_id = '1000101723473598409' or attr_id = '1000101723473598509'`,
      `update pdm_usergroup set tenant_id = '${tenantId}'`,
      `update pdm_system_calendar set tenant_id = '${tenantId}'`,
      `update pdm_depart set id = '${tenantId}' where parent_id is Null`,
      `update pdm_depart set apicode = '${extraData.uscc}' where parent_id is Null`,
      `update pdm_depart set depart_name = '${extraData.tenantName}' where parent_id is Null`,
      `update pdm_depart_info set depart_name = '${extraData.tenantName}'`,
      `update pdm_depart_info set depart_id = '${tenantId}'`,
      `update pdm_depart_info set unified_credit_code = '${extraData.uscc}'`,
      `update pdm_depart_info set bussiness = '${extraData.trade}'`,
      `update pdm_system_wf_definition set org_id = '${tenantId}'`,
      `update pdm_wf_instance set org_id = '${tenantId}'`,
      `update pdm_wf_instance_nodes set org_id = '${tenantId}'`,
      `update pdm_wf_instance_approve_history set org_id = '${tenantId}'`,
      `update pdm_system_object set tenant_id = '${tenantId}'`,
      `update pdm_instance_access set tenant_id = '${tenantId}'`,
      `update pdm_instance set tenant_id = '${tenantId}'`,
      `update plm_mgnt_tenants set org_id = '${tenantId}'`,
      `update pdm_user_attribute_base set attr_value = '${userName}' where attr_id = '1000101723473598416' and instance_id = '1535178992594558027'`,
      `update pdm_user_attribute_base set attr_value = '${userId}' where attr_id = '1000101723473598414' and instance_id = '1535178992594558027'`,
      `update pdm_user_attribute_base set attr_value = '${userEmail}' where attr_id = '1000101723473598402' and instance_id = '1535178992594558027'`,
    ];
    if (extraData.isWar) {
      updateTenantId = updateTenantId.concat([
        `update pdm_system_user_strategy set status = 't' where type = '5'`,
        `update pdm_system_user_strategy set status = 't' where type = '2'`,
        `update pdm_system_user_strategy set pw_need_capital = 't' where type = '1'`,
        `update pdm_system_user_strategy set pw_need_special = 't' where type = '1'`,
        `update pdm_system_attribute_base set readonly = '2' where apicode = 'SecurityClass'`,
      ]);
    }

    for (let i = 0; i < updateTenantId.length; i++) {
      const sql = updateTenantId[i] + ";";
      await db.execute(sql, []);
      await waitOneSecond();
    }
    updateModules({ db });
    // }
  };

  const initEs = async ({ account, password, address, port, name, env }: any, db: any) => {
    //初始化es
    const date = new Date();
    const year = date.getFullYear();
    let month: any = date.getMonth() + 1;
    let day: any = date.getDate();
    month = month > 9 ? month : "0" + month;
    day = day < 10 ? "0" + day : day;
    const today = year + month + day;
    // 初始化openData索引
    const esPutUrl = `http://${address}:9220/${env}_${extraData.tenantId}_${today}`;
    const esData = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        "index.refresh_interval": "5s",
        analysis: {
          analyzer: {
            ik: {
              tokenizer: "ik_max_word",
            },
          },
          normalizer: {
            lowercase_normalizer: {
              type: "custom",
              char_filter: [],
              filter: ["lowercase"],
            },
          },
        },
      },
      mappings: {
        properties: {
          instance: {
            properties: {
              insId: {
                type: "keyword",
              },
              rid: {
                type: "keyword",
              },
              productId: {
                type: "keyword",
              },
              productName: {
                type: "keyword",
              },
              itemCode: {
                type: "integer",
              },
              itemName: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              number: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              insDesc: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              objectId: {
                type: "keyword",
              },
              objectApicode: {
                type: "keyword",
              },
              objectName: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              insVersionOrder: {
                type: "keyword",
              },
              insVersion: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              insVersionOrderUnbound: {
                type: "keyword",
              },
              insVersionUnbound: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              statusName: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              createName: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              createTime: {
                type: "date",
                format: "yyyy-MM-dd HH:mm:ss",
              },
              updateName: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              updateTime: {
                type: "date",
                format: "yyyy-MM-dd HH:mm:ss",
              },
              publishTime: {
                type: "date",
                format: "yyyy-MM-dd HH:mm:ss",
              },
              standardPartId: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              affectedIn: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              insBom: {
                type: "boolean",
              },
              checkout: {
                type: "boolean",
              },
              priority: {
                type: "boolean",
              },
              versionManager: {
                type: "keyword",
              },
              archivingStatus: {
                type: "keyword",
              },
              lifecycle: {
                type: "nested",
                properties: {
                  id: {
                    type: "keyword",
                  },
                  apicode: {
                    type: "keyword",
                  },
                  name: {
                    type: "keyword",
                  },
                  showName: {
                    type: "keyword",
                  },
                  color: {
                    type: "keyword",
                  },
                  status: {
                    type: "boolean",
                  },
                  bomRule: {
                    type: "keyword",
                  },
                  sort: {
                    type: "integer",
                  },
                  code: {
                    type: "integer",
                  },
                  isBase: {
                    type: "boolean",
                  },
                  objectShowName: {
                    type: "keyword",
                  },
                  objectBomRule: {
                    type: "keyword",
                  },
                },
              },
              workflow: {
                type: "nested",
                properties: {
                  changeId: {
                    type: "keyword",
                  },
                  changeNumber: {
                    type: "keyword",
                  },
                  changeItemCode: {
                    type: "integer",
                  },
                  changeTypeName: {
                    type: "keyword",
                  },
                  wfId: {
                    type: "keyword",
                  },
                  wfName: {
                    type: "keyword",
                  },
                  wfDefId: {
                    type: "keyword",
                  },
                  wfDefName: {
                    type: "keyword",
                  },
                  wfIsEnd: {
                    type: "boolean",
                  },
                  wfIsCancel: {
                    type: "boolean",
                  },
                  wfIsPublish: {
                    type: "boolean",
                  },
                  crtNodeId: {
                    type: "keyword",
                  },
                  crtNodeName: {
                    type: "keyword",
                  },
                  crtNodeClazz: {
                    type: "keyword",
                  },
                  crtNodeIntoTime: {
                    type: "date",
                    format: "yyyy-MM-dd HH:mm:ss",
                  },
                  waitingApprovalObjectInstanceIds: {
                    type: "keyword",
                  },
                },
              },
              inProcessAttributes: {
                type: "nested",
                properties: {
                  rid: {
                    type: "keyword",
                  },
                  affectedInsId: {
                    type: "keyword",
                  },
                  insVersionOrder: {
                    type: "keyword",
                  },
                  insVersion: {
                    type: "keyword",
                  },
                  rowId: {
                    type: "keyword",
                  },
                  attrId: {
                    type: "keyword",
                  },
                  apiCode: {
                    type: "keyword",
                  },
                  itemCode: {
                    type: "integer",
                  },
                  tabCode: {
                    type: "integer",
                  },
                  attrValue: {
                    type: "text",
                    fields: {
                      keyword: {
                        type: "keyword",
                        normalizer: "lowercase_normalizer",
                      },
                    },
                  },
                  datafrom: {
                    type: "keyword",
                  },
                },
              },
              snapshotAttributes: {
                type: "nested",
                properties: {
                  rid: {
                    type: "keyword",
                  },
                  affectedInsId: {
                    type: "keyword",
                  },
                  insVersionOrder: {
                    type: "keyword",
                  },
                  insVersion: {
                    type: "keyword",
                  },
                  rowId: {
                    type: "keyword",
                  },
                  attrId: {
                    type: "keyword",
                  },
                  apiCode: {
                    type: "keyword",
                  },
                  itemCode: {
                    type: "integer",
                  },
                  tabCode: {
                    type: "integer",
                  },
                  attrValue: {
                    type: "text",
                    fields: {
                      keyword: {
                        type: "keyword",
                        normalizer: "lowercase_normalizer",
                      },
                    },
                  },
                  datafrom: {
                    type: "keyword",
                  },
                },
              },
            },
          },
          attribute: {
            properties: {
              rid: {
                type: "keyword",
              },
              insId: {
                type: "keyword",
              },
              insVersionOrder: {
                type: "keyword",
              },
              insVersion: {
                type: "keyword",
              },
              rowId: {
                type: "keyword",
              },
              attrId: {
                type: "keyword",
              },
              apiCode: {
                type: "keyword",
              },
              itemCode: {
                type: "integer",
              },
              tabCode: {
                type: "integer",
              },
              attrValue: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              datafrom: {
                type: "keyword",
              },
              rowInsId: {
                type: "keyword",
              },
              affectedInsId: {
                type: "keyword",
              },
              valueType: {
                type: "keyword",
              },
              readonly: {
                type: "keyword",
              },
              datafromId: {
                type: "keyword",
              },
              view: {
                type: "keyword",
              },
              name: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
              listCnValue: {
                type: "text",
                fields: {
                  keyword: {
                    type: "keyword",
                    normalizer: "lowercase_normalizer",
                  },
                },
              },
            },
          },
          relations: {
            type: "join",
            relations: {
              instance: "attribute",
            },
          },
        },
      },
    };
    const esPostUrl = `http://${address}:9220/_aliases`;
    const esAlias = {
      actions: [
        {
          add: {
            index: `${env}_${extraData.tenantId}_${today}`,
            alias: `${env}_${extraData.tenantId}`,
          },
        },
      ],
    };

    const esListQueryUrl = `http://${address}:9220/${env}_${extraData.tenantId}/_search`;

    // 获取所有的es空间
    const fetchEs = async () => {
      return new Promise((resolve, reject) => {
        http
          .fetch(esListQueryUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            // body: http.Body.json(esListData),
          })
          .then((response) => {
            console.log(response, "response");

            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };
    const data: any = await fetchEs();
    // 假如es有的话，则不创建新的空间 否则创建新的
    if (data?._shards?.successful == 1) {
    } else {
      const fetchEsPutUrlPromise = () => {
        return new Promise((resolve, reject) => {
          http
            .fetch(esPutUrl, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: http.Body.json(esData),
            })
            .then((response) => {
              return response;
            })
            .then((data) => {
              resolve(data.data);
            })
            .catch((error) => {
              reject(error);
            });
        });
      };
      const fetchEsAliasPromise = () => {
        return new Promise((resolve, reject) => {
          http
            .fetch(esPostUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: http.Body.json(esAlias),
            })
            .then((response) => {
              return response;
            })
            .then((data) => {
              resolve(data.data);
            })
            .catch((error) => {
              reject(error);
            });
        });
      };
      const esPutResult: any = await fetchEsPutUrlPromise();
      console.log(esPutResult, "esPutResult");
      const esAliasResult: any = await fetchEsAliasPromise();
      console.log(esAliasResult, "esAliasResult");

      if (!esPutResult.acknowledged || !esAliasResult.acknowledged) {
        alert("ES数据库初始化失败!");
        return;
      }
    }

    // 同步es数据;
    const syncInstance = () => {
      return new Promise((resolve, reject) => {
        http
          .fetch(`http://${address}:9220/${env}_${extraData.tenantId}_${today}/_doc/1535178992594558027?refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: http.Body.json({
              insId: "1535178992594558027",
              rid: "1600698053558304",
              productId: "",
              productName: "",
              standardPartId: "",
              itemCode: 10001017,
              itemName: "用户",
              number: `${extraData.name}(${extraData.workNo})`,
              insDesc: `${extraData.email}`,
              objectId: "1000101700534091777",
              objectApicode: "user",
              objectName: "用户",
              insVersionOrder: "1",
              insVersion: "Draft",
              insVersionOrderUnbound: "1",
              insVersionUnbound: "Draft",
              statusName: "启用",
              archivingStatus: "",
              createName: "1535178992594558027",
              createDepart: "",
              createTime: "2022-07-18 16:36:09",
              updateName: "",
              updateTime: "1970-01-01 08:00:00",
              affectedIn: "",
              publishTime: null,
              insBom: false,
              checkout: false,
              priority: false,
              versionManager: "",
              lifecycle: {
                id: "",
                apicode: "",
                name: "",
                showName: "",
                color: "",
                status: false,
                bomRule: "",
                sort: 0,
                code: 0,
                isBase: false,
                objectShowName: "",
                objectBomRule: "",
              },
              workflow: {
                changeId: "",
                changeNumber: "",
                changeItemCode: 0,
                changeTypeName: "",
                wfId: "",
                wfName: "",
                wfDefId: "",
                wfDefName: "",
                wfIsEnd: false,
                wfIsCancel: false,
                wfIsPublish: false,
                crtNodeId: "",
                crtNodeName: "",
                crtNodeClazz: "",
                crtNodeIntoTime: null,
                waitingApprovalObjectInstanceIds: "",
              },
              inProcessAttributes: [],
              snapshotAttributes: [],
              relations: {
                name: "instance",
                parent: null,
              },
            }),
          })
          .then((response) => {
            console.log(response);
            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };
    await syncInstance();

    // 属性结构

    const syncInstanceAttr = (data: any, attrId: string) => {
      return new Promise((resolve, reject) => {
        http
          .fetch(
            `http://${address}:9220/${env}_${extraData.tenantId}_${today}/_doc/${attrId}?routing=1535178992594558027`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: http.Body.json(data),
            }
          )
          .then((response) => {
            console.log(response);
            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    const object_attr: any = await db.select(
      `SELECT * FROM pdm_system_base_attribute
        WHERE "item_code" = '10001017' AND ("tab_code" = '10002001' OR "tab_code" = '10002025' OR "tab_code" = '10002002')`
    );

    console.log(object_attr, "object_attr");

    const object_attrMap: any = {};
    object_attr.forEach((item: any) => {
      object_attrMap[item.id] = item;
    });

    const attrArray = [
      //@ts-ignore
      (await db.select("select * from pdm_instance_attribute_whererole")).map((item: any) => {
        item.tabCode = "10002025";
        return item;
      }),
      //@ts-ignore
      (await db.select("select * from pdm_user_attribute_base")).map((item: any) => {
        item.tabCode = "10002001";
        return item;
      }),
      ,
    ];

    console.log(flatten(attrArray), "attrArray");

    const PromiseAttr = flatten(attrArray)
      .filter((item) => item)
      .map((item: any) => {
        return new Promise((resolve, reject) => {
          resolve(
            syncInstanceAttr(
              {
                rid: item.id,
                productId: "",
                insId: item.instance_id,
                insVersionOrder: "1",
                insVersion: "Draft",
                rowId: item.row_id,
                attrId: item.attr_id,
                apiCode: object_attrMap[item.attr_id]?.apicode,
                itemCode: 10001017,
                tabCode: item.tabCode,
                attrValue: item.attr_value,
                dataFrom: "0",
                dataFromId: "",
                rowInsId: "",
                affectedInsId: "",
                valueType: object_attrMap[item.attr_id]?.value_type,
                readonly: object_attrMap[item.attr_id]?.readonly,
                view: "",
                name: object_attrMap[item.attr_id]?.name,
                listCnValue: item.attr_value,
                relations: {
                  name: "attribute",
                  parent: "1535178992594558027",
                },
              },
              item.attr_id
            )
          );
        });
      });

    await Promise.all(PromiseAttr);
  };

  async function sleep(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const initNebula = async ({ account, password, address, port, name, env }: any) => {
    let cookies = "";

    const fetchNebulaCookie = async () => {
      const nebulaData = {
        address: address,
        port: 9669,
      };
      return new Promise((resolve, reject) => {
        http
          .fetch(`http://${address}:7001/api-nebula/db/connect`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: "Bearer cm9vdDpuZWJ1bGE=",
            },
            body: http.Body.json(nebulaData),
          })
          .then((response: any) => {
            if (response.rawHeaders) {
              cookies = `${response.rawHeaders["set-cookie"][0]};${response.rawHeaders["set-cookie"][1]}`;
            }
            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };
    const createSpace = async () => {
      const nebulaData = {
        gql: `CREATE SPACE ${`tenant_${env}_${extraData.tenantId}`} (vid_type = FIXED_STRING(50)) `,
      };
      return new Promise((resolve, reject) => {
        http
          .fetch(`http://${address}:7001/api-nebula/db/exec`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: "Bearer cm9vdDpuZWJ1bGE=",
              Cookie: cookies,
            },
            body: http.Body.json(nebulaData),
          })
          .then((response) => {
            console.log(response);
            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    await fetchNebulaCookie();

    if (!cookies) {
      throw new Error("连接图数据库失败");
    }

    // 判断图数据库有没有，没有的话就创建，有的话就不执行

    const showSpaces = async () => {
      const nebulaData = {
        gql: `show spaces;`,
      };
      return new Promise((resolve, reject) => {
        http
          .fetch(`http://${address}:7001/api-nebula/db/exec`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: "Bearer cm9vdDpuZWJ1bGE=",
              Cookie: cookies,
            },
            body: http.Body.json(nebulaData),
          })
          .then((response) => {
            console.log(response);
            return response;
          })
          .then((data) => {
            resolve(data.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    const spacesWrapper: any = await showSpaces();

    console.log(spacesWrapper, "spacesWrapper");

    const spaces = spacesWrapper?.data?.tables || [];

    const hasSapce = spaces.find((item: any) => item.Name === `tenant_${env}_${extraData.tenantId}`);

    if (hasSapce) {
      return;
    } else {
      const space: any = await createSpace();

      if (space?.code == -1) {
        throw new Error(`创建图数据空间失败:${space.message}`);
      }

      let finded = false;
      let count = 0;

      const useNebula = async () => {
        const nebulaData = {
          gql: `use ${`tenant_${env}_${extraData.tenantId}`}`,
        };
        return new Promise((resolve, reject) => {
          http
            .fetch(`http://${address}:7001/api-nebula/db/exec`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: "Bearer cm9vdDpuZWJ1bGE=",
                Cookie: cookies,
              },
              body: http.Body.json(nebulaData),
            })
            .then(async (response: any) => {
              if (response?.data?.code == -1 && count < 6) {
                count++;
                console.log(`重试${count}`);
                await sleep(5000);
                await useNebula();
              } else {
                finded = true;
              }
              return response;
            })
            .then((data) => {
              resolve(data.data);
            })
            .catch(async (error) => {
              reject(error);
            });
        });
      };

      await useNebula();

      if (finded) {
        const createNebulaInstance = async () => {
          const nebulaData = {
            gql: `CREATE tag ${`instance`} (${`number`} string NOT NULL  )  `,
          };
          return new Promise((resolve, reject) => {
            http
              .fetch(`http://${address}:7001/api-nebula/db/exec`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  Authorization: "Bearer cm9vdDpuZWJ1bGE=",
                  Cookie: cookies,
                },
                body: http.Body.json(nebulaData),
              })
              .then((response) => {
                console.log(response);
                return response;
              })
              .then((data) => {
                resolve(data.data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        };
        const createNebulaEdge = async () => {
          const nebulaData = {
            gql: `CREATE edge ${`child`} (${`version`} string NOT NULL  )  `,
          };
          return new Promise((resolve, reject) => {
            http
              .fetch(`http://${address}:7001/api-nebula/db/exec`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  Authorization: "Bearer cm9vdDpuZWJ1bGE=",
                  Cookie: cookies,
                },
                body: http.Body.json(nebulaData),
              })
              .then((response) => {
                console.log(response);
                return response;
              })
              .then((data) => {
                resolve(data.data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        };
        await createNebulaInstance();
        await createNebulaEdge();
      } else {
        alert("Nebula重试6次失败，请手动初始化Nebula！");
      }
    }
  };

  const updateMinio = async ({ account, password, address, port, name, env }: any) => {
    const minioClient = new minio.Client({
      endPoint: `${address}`,
      port: 9101,
      useSSL: false,
      accessKey: "onchainoss", //username
      secretKey: "onchainoss", //password
    });
    const bucketName = "plm-backend";
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
    }
  };

  // 授权
  let onSubmit = async (data: any) => {
    setIsLoadingOpen(true);
    const db = await Database.load(
      `postgres://${data.account}:${data.password}@${data.address}:${data.port}/${data.name}`
    ).catch((err) => {
      console.log(err, "err");
      alert(err);
    });
    if (!db) {
      setIsLoadingOpen(false);
      return;
    }

    const { account, password, address, port, name, env } = data;

    // const namespace = env.substr(env.lastIndexOf("-") + 1);

    try {
      // 判断里面是否被加密过
      // const userData = await db.select(`select * from pdm_user`);
      //@ts-ignore
      // const isInit = userData[0]?.tenant_id != extraData.tenantId;

      await updateDB({ db });

      // // if (isInit) {
      await initEs(data, db);
      await initNebula(data);

      // await updateMinio(data);

      // }

      // const sqlResourcePath = await resolveResource("public.sql");
      // const sqlText = await readTextFile(sqlResourcePath);
      // const result = await invoke("batchSqlData", {
      //   sql: sqlText,
      //   account,
      //   password,
      //   address,
      //   port,
      //   name,
      // }).catch((err) => {
      //   alert(err);
      // });

      // console.log(result, "result");

      db.close();

      setIsLoadingOpen(false);
      setSuccess(true);
      setViewDetail(true);
    } catch (error) {
      setIsLoadingOpen(false);
      console.log(error, "error");
      alert(error);
      db.close();
    }

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

        // 加密内容
        let message = word;
        // 密钥，长度必须为16
        // utf-8 转换
        // message = CryptoJS.enc.Utf8.parse(message);
        // 偏移量
        let iv = "0000000000000000";
        let secret_key = "OnChainPlmSecret";
        secret_key = CryptoJS.enc.Utf8.parse(secret_key);
        iv = CryptoJS.enc.Utf8.parse(iv);
        // Decrypt
        console.log(message, "message");

        var bytes = CryptoJS.AES.decrypt(message, secret_key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {}

      if (!decryptedData) {
        alert("授权码不正确");
        return;
      }

      const modules = JSON.parse(decryptedData).modules[0];
      const array: any[] = [];
      Object.keys(modules).forEach((item) => {
        if (modules[item].status == "on") {
          array.push({
            id: item,
            ...modules[item],
          });
        }
      });
      const splitModules = splitArrayIntoPairs(array);
      setModules(splitModules);
      setMaxUser(splitModules[0][0].user_num);
      const decData = JSON.parse(decryptedData);
      decData.tenantId = decData.tenantCode;
      console.log(decData, "decData");

      setExtraData(decData);
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
      name: "mk-709",
      env: "dev",
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
    watchAllFields.name,
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
                  await Database.load(
                    `postgres://${data.account}:${data.password}@${data.address}:${data.port}/${data.name}`
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

  function waitOneSecond() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("已等待一秒钟");
      }, 200);
    });
  }

  return (
    <PlmLoading loading={isLoadingOpen} loadingChildren={<ProgressCircle aria-label="Loading…" isIndeterminate />}>
      <div className="w-full h-full flex items-center justify-center py-5 pr-5 rounded-lg relative">
        <div data-tauri-drag-region className="absolute top-0 w-full h-4 z-10"></div>
        <div className="flex w-full overflow-hidden h-full">
          <div
            className="flex justify-center items-center register_title flex-col overflow-hidden relative"
            style={{
              width: "240px",
              minWidth: "240px",
              borderRight: "1px solid #e3e7ef",
            }}
          >
            <div className="absolute top-0 register_head left-5">
              <Image src={OnChainSvg} width={110}></Image>
            </div>
            <div>全新超融合云原生</div>
            <div>产品全生命周期赋能平台</div>
            <div className="absolute bottom-0 register_foot left-5">授权工具 - 版本3.0.0</div>
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
                          // background: isCurrent ? "#0563B2" : "#dfe9f5",
                          // boxShadow: `0 0 0 2px ${
                          //   isCurrent ? "#0563B2" : "#dfe9f5"
                          // }`,
                          // transform: "scale(0.8)",
                        }}
                      >
                        <Image
                          src={isCurrent ? (item.value == "1" ? blue1 : blue2) : item.value == "1" ? lgBlue1 : lgBlue2}
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
                        <div className="bg-primary w-full absolute" style={{ height: "2px", bottom: "-2px" }}></div>
                      ) : (
                        <></>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="absolute top-0 right-0 toolbar" style={{ lineHeight: "12px" }}>
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
                            <div className="flex-1 overflow-hidden" style={{ paddingRight: "10px" }}>
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
                                      value={extraData.email}
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
                                  <div style={{ position: "relative" }}>
                                    <FormLabel value="授权密码:"></FormLabel>
                                    <TextField
                                      value={"113220"}
                                      isReadOnly
                                      marginTop={"8px"}
                                      // type="password"
                                      onChange={onChange}
                                      name="password"
                                      type={showPassword2 ? "text" : "password"}
                                    ></TextField>
                                    <span
                                      onClick={() => {
                                        setShowPassword2(!showPassword2);
                                      }}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <Image
                                        src={showPassword2 ? showSvg : hideSvg}
                                        position={"absolute"}
                                        width={12}
                                        right={6}
                                        bottom={6}
                                      ></Image>
                                    </span>
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex overflow-hidden">
                            <div className="flex-1 overflow-hidden" style={{ paddingRight: "10px" }}>
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
                      <div className="flex-1 overflow-hidden" style={{ paddingRight: "10px" }}>
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
                      <div className="overflow-hidden w-24" style={{ marginRight: "10px" }}>
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

                      <div className="overflow-hidden w-24">
                        <Controller
                          control={control}
                          name="env"
                          rules={{ required: "env is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <Fragment>
                              <FormLabel value="环境:"></FormLabel>
                              <TextField value={value} onChange={onChange} marginTop={"8px"} />
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex overflow-hidden">
                      <div className="flex-1 overflow-hidden" style={{ paddingRight: "10px" }}>
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
                              <TextField value={value} placeholder="请输入账号" onChange={onChange} marginTop={"8px"} />
                            </Fragment>
                          )}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden" style={{ paddingRight: "10px" }}>
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
                              <div style={{ position: "relative" }}>
                                <TextField
                                  value={value}
                                  placeholder="请输入密码"
                                  marginTop={"8px"}
                                  type={showPassword ? "text" : "password"}
                                  onChange={onChange}
                                  name="password"
                                ></TextField>
                                <span
                                  onClick={() => {
                                    setShowPassword(!showPassword);
                                  }}
                                  style={{ cursor: "pointer" }}
                                >
                                  <Image
                                    src={showPassword ? showSvg : hideSvg}
                                    position={"absolute"}
                                    width={12}
                                    right={6}
                                    bottom={6}
                                  ></Image>
                                </span>
                              </div>
                            </Fragment>
                          )}
                        />
                      </div>

                      <div className="overflow-hidden w-24">
                        <Controller
                          control={control}
                          name="name"
                          rules={{ required: "name is required." }}
                          render={({
                            field: { name, value, onChange, onBlur, ref },
                            fieldState: { invalid, error },
                          }) => (
                            <Fragment>
                              <FormLabel value="数据库名称:"></FormLabel>
                              <div style={{ position: "relative" }}>
                                <TextField
                                  value={value}
                                  placeholder="请输入数据库名称"
                                  marginTop={"8px"}
                                  type={"text"}
                                  onChange={onChange}
                                  name="name"
                                ></TextField>
                              </div>
                            </Fragment>
                          )}
                        />
                      </div>
                    </div>
                    <Controller
                      control={control}
                      name="userCount"
                      rules={{ required: "userCount is required." }}
                      render={({ field: { name, value, onChange, onBlur, ref }, fieldState: { invalid, error } }) => (
                        <div>
                          <div>
                            <FormLabel value="并发用户数:"></FormLabel>
                          </div>

                          <TextField isReadOnly value={maxUser} onChange={onChange} marginTop={"8px"} />
                        </div>
                      )}
                    />
                    <Fragment>
                      <FormLabel value="模块:"></FormLabel>
                      <div style={{ maxHeight: "72px", overflow: "auto" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }} border={2}>
                          <tbody>
                            {modules.map((row: any, index: number) => {
                              return (
                                <tr key={index}>
                                  {row.map((col: any) => {
                                    return (
                                      <td key={col.desc} style={{ border: "1px solid #ecedf0" }}>
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
                    render={({ field: { name, value, onChange, onBlur, ref }, fieldState: { invalid, error } }) => (
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
            <div className="absolute toolbar z-20 top-2 right-2" style={{ lineHeight: "12px" }}>
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
