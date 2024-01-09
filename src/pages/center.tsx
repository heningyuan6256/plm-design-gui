import { Command } from "@tauri-apps/api/shell";
import { Button, Input } from "antd";
import { FC, useEffect } from "react";
import Database from "tauri-plugin-sql-api";
//@ts-ignore
import CryptoJS from "crypto-js";

console.log(CryptoJS, "CryptoJS");

const center: FC = () => {
  // function unformatLicense(formattedLicense: string) {
  //   return formattedLicense.replace(/-/g, "");
  // }

  // function decryptString(encrypted: any, key: string) {
  //   const iv = encrypted.slice(0, 16); // 获取IV（初始化向量）
  //   const encryptedText = encrypted.slice(16); // 获取加密的内容

  //   const decipher = CryptoJS.createDecipheriv("aes-256-cfb", key, iv);
  //   let decrypted = decipher.update(encryptedText, "base64", "utf8");
  //   decrypted += decipher.final("utf8");

  //   return decrypted;
  // }

  const word =
    "llI2oTmhCfPN7Y/ymgG6I8bYlQ6U+EeMRkJlBcKmqQTrqcgontPga0BkGdvV8iHPDrgEou/G8a1JsE61wQeeyvV5yvJXBc+RShME+Pl5AeC+AbI4IGMrfxojNs3/qVcSbp1T5CFCcv7Tfh6dqCemvw==";
  // var decrypt = CryptoJS.AES.decrypt(word, key, {
  //   mode: CryptoJS.mode.CFB,
  //   padding: CryptoJS.pad.Pkcs7,
  // });
  // console.log(decrypt);

  const sKey = CryptoJS.enc.Utf8.parse("len16 secret key");

  const decrypted = CryptoJS.AES.decrypt(word, sKey, {
    iv: sKey,
    mode: CryptoJS.mode.CBC, // CBC算法
    padding: CryptoJS.pad.Pkcs7, //使用pkcs7 进行padding 后端需要注意
  });

  console.log(decrypted.toString(CryptoJS.enc.Utf8), "123");

  // let byteArray = new Uint8Array([
  //   0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c,
  //   0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
  //   0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
  // ]);

  // // 使用 TextDecoder 将 Uint8Array 转换为字符串
  // const decoder = new TextDecoder('utf-8');
  // const str = decoder.decode(byteArray);
  // console.log(str, "str"); // 输出 "Hello World"

  // var bytes = CryptoJS.AES.decrypt(
  //   "J+Y3kHqt8/dyaQsUreguOsrrlazXOf1Qt0WlJMTl5geE1rzboguPW4ipk4j4Mvb51GqPmT6G49bjev+NSvvLPys30A4gOMUmu3NX+/I4YZi3pVwvyoKuzbn7YaWVLFGbstex7x+lTvGViSgFeB5pg6iQMfCUDl3hEXfG",
  //   byteArray
  // );
  // var originalText = bytes.toString(CryptoJS.enc.Utf8);
  // console.log(originalText, "originalText");

  // const formattedEncryptedLicense = "您的格式化授权码"; // 用您的加密授权码替换
  // const key = Buffer.from("您的32字节密钥", 'utf8'); // 用您的密钥替换

  // const encryptedLicense = unformatLicense(formattedEncryptedLicense);
  // const base64Encoded = Buffer.from(encryptedLicense, 'base64');
  // const decryptedLicense = decryptString(base64Encoded, key);

  // console.log("Decrypted License:", decryptedLicense);

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

  return (
    <div className="px-2 py-2 w-full h-full flex items-center justify-center">
      <div className="w-full px-4">
        <Input.TextArea
          placeholder="请输入注册码"
          rows={8}
          className="resize-none"
        ></Input.TextArea>
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
