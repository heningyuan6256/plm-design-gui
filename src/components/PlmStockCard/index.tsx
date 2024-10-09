import { FC } from "react";
import frontAcvanced from "../../assets/image/front-advanced.svg";
import { Dropdown, MenuProps } from "antd";

export interface PlmStockCardProps {
  instance: Record<string, any>;
  userMap: Record<string, any>;
}
const PlmStockCard: FC<PlmStockCardProps> = ({ instance, userMap }) => {
  const items: MenuProps["items"] = [
    {
      key: "open",
      label: "打开",
    },
    {
      key: "detail",
      label: "详情",
    },
    {
      type: "divider",
    },
    {
      key: "view",
      label: "查看",
    },
    {
      key: "sync",
      label: "同步",
    },
  ];
  return (
    <div
      className="stock_card"
      style={{
        width: "200px",
        color: "#2C3652",
        height: "263px",
        border: "1px solid #e8e8e8",
        margin: "0px 8px 17px 8px",
        fontSize: "12px",
      }}
    >
      <div
        className="w-full"
        style={{
          background: instance.location ? "#EBF5FF" : "#e8e8e8",
          height: "73px",
          padding: "9px 11px 6px 9px",
          marginBottom: "2px",
          color: "#2C3652",
        }}
      >
        <div
          className="flex justify-between"
          style={{
            marginBottom: "2px",
            height: "18px",
            lineHeight: "18px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontWeight: "550" }}>{instance.number}</div>
          <Dropdown menu={{ items }} placement="bottomRight">
            <div>
              <img style={{ width: "16px", color: "#000000" }} src={frontAcvanced} />
            </div>
          </Dropdown>
        </div>
        <div
          style={{
            marginBottom: "2px",
            height: "18px",
            lineHeight: "18px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          类型：{instance.objectName}
        </div>
        <div
          style={{
            height: "18px",
            lineHeight: "18px",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          描述：{instance.insDesc}
        </div>
      </div>
      <div
        className="bg-white"
        style={{
          borderBottom: "1px solid #e8e8e8",
          height: "130px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            // background: "linear-gradient(180deg,#ffffff 0%, #e8e8e8 100%)",
            overflow: "hidden",
          }}
        >
          <img style={{ margin: "0 auto", height: "80px", width: "80px" }} src={"/front-cubegray.png"} alt="" />
        </div>
      </div>
      <div style={{ padding: "10px 6px 10px 12px", color: "#2C3652", lineHeight: "18px" }}>
        <div style={{ marginBottom: "2px" }}>创建人：{userMap[instance.createName]}</div>
        <div>创建时间：{instance.createTime}</div>
      </div>
    </div>
  );
};

export default PlmStockCard;
