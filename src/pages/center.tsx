import { Command } from "@tauri-apps/api/shell";
import { Button, Input } from "antd";
import { FC, useEffect, useRef } from "react";
import Database from "tauri-plugin-sql-api";
//@ts-ignore
import CryptoJS from "crypto-js";
import { useDrop } from "ahooks";

console.log(CryptoJS, "CryptoJS");

const center: FC = () => {
  const word =
    "llI2oTmhCfPN7Y/ymgG6I8bYlQ6U+EeMRkJlBcKmqQTrqcgontPga0BkGdvV8iHPDrgEou/G8a1JsE61wQeeyvV5yvJXBc+RShME+Pl5AeC+AbI4IGMrfxojNs3/qVcSbp1T5CFCcv7Tfh6dqCemvw==";
  const sKey = CryptoJS.enc.Utf8.parse("len16 secret key");

  const decrypted = CryptoJS.AES.decrypt(word, sKey, {
    iv: sKey,
    mode: CryptoJS.mode.CBC, // CBC算法
    padding: CryptoJS.pad.Pkcs7, //使用pkcs7 进行padding 后端需要注意
  });

  console.log(decrypted.toString(CryptoJS.enc.Utf8), "123");

  const initOnChain = async () => {
    {
      /* TODO解析授权码获取超级管理员、功能模块，以及用户数 */
    }

    {
      /* TODO安装所有的docker服务*/
    }

    {
      /* TODO启动mysql数据库，连接mysql数据库然后修改用户数以及功能模块*/
      // 加密每一个模块,生成一个带有密钥的对象「name,apicode,secret」

      var key = CryptoJS.enc.Utf8.parse("minweikai6666666");
      var srcs = CryptoJS.enc.Utf8.parse("123");
      var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      console.log(encrypted.toString(), "encrypted.toString()");

      const db = await Database.load(
        "postgres://postgres:123456@192.168.0.104:32768/mk"
      );
      const res = await db.select("SELECT * FROM pdm_system_module", []);

      const updateRes = await db.execute(
        `UPDATE "public"."pdm_system_module" SET api_context = $1 WHERE id = $2`,
        ["123", "1640900750563016709"]
      );
      console.log(res, "res");
      db.close();
    }

    {
      /* TODO修改网关*/
    }

    {
      /* 远程进部署的服务器执行docker-compose命令启动服务*/
    }
  };

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

  return (
    <div className="px-2 py-2 w-full h-full flex items-center justify-center">
      <div className="w-full px-4">
        <Input.TextArea
          placeholder="请输入注册码"
          rows={8}
          className="resize-none"
        ></Input.TextArea>
        <div className="" ref={dropAreaRef}></div>
        <div className="flex items-center justify-center">
          <Button onClick={initOnChain} className="rounded-sm mt-3 mx-0">
            授权
          </Button>
        </div>
      </div>
    </div>
  );
};

export default center;
