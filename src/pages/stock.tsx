/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 库
 */
import PlmIcon from "../components/PlmIcon";
import { OnChainSelect, OnChainTable } from "onchain-ui";
import { Fragment, useEffect, useState } from "react";
import API from "../utils/api";
import PageLayout, { openDesign } from "../layout/pageLayout";
import { Input, message } from "antd";
import { useSelector } from "react-redux";
import { useKeyPress, useRequest } from "ahooks";
import PlmLifeCycle from "../components/PlmLifeCycle";
import { BasicsItemCode } from "../constant/itemCode";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { readPermission, renderIsPlmMosaic } from "../components/PlmMosaic";
import { invoke } from "@tauri-apps/api";
import PlmStockCard from "../components/PlmStockCard";
import { Card, List } from 'antd';
import { Utils } from "../utils";
// import { dealMaterialData } from 'plm-wasm'

const stock = () => {
  const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([]);
  const [selectVal, setSelectVal] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [leftTreeLoading, setLeftTreeLoading] = useState<boolean>(false);
  const { value: user } = useSelector((state: any) => state.user);
  const [tableSelectedRows, setTableSelectedRows] = useState<
    Record<string, any>[]
  >([]);
  const dispatch = useDispatch();
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { value } = useSelector((state: any) => state.user);
  const { value: network } = useSelector((state: any) => state.network);
  const [userMap,setUserMap] = useState({})

  useEffect(() => {
    // 获取所有的创建人，用于回显
    const getAllCreator = async() => {
      const data:any = await API.getList([{code:'10005155'}])
      const userList = data.result[0].listItems
      setUserMap(Utils.transformArrayToMap(userList.map((v:any) => {return {label:v.name,value:v.id}}),'value','label'))
    }
    getAllCreator()
  }, [])

  const { run, loading } = useRequest((data) => API.getStockByType(data), {
    manual: true,
    onSuccess(data: any) {
      setTableSelectedRows([]);
      setTableData(
        data.result.records.filter((item: any) => {
          return (
            (item.number || '').indexOf(selectVal) != -1 ||
            (item.insDesc || '').indexOf(selectVal) != -1
          );
        })
      );
    },
  });

  useEffect(() => {
    setLeftTreeLoading(true)
    API.getStock("719").then((res: any) => {
      const result = res.result.filter((item: any) => {
        return item.apicode === "ItemAdministrator";
      });
      setLeftTreeLoading(false)
      setLeftTreeData(result);
      if (result.length > 0) {
        setSelectedRows([result[0]]);
      }
    }).catch(() => {
      setLeftTreeLoading(false)
    });
  }, []);
  useKeyPress("enter", () => {
    setSelectedRows([...selectedRows]);
  });

  useEffect(() => {
    if (selectedRows.length) {
      const data = {
        libraryId: selectedRows[0].id,
        pageNo: 1,
        pageSize: 50,
        sort: "",
        andQuery: "",
        tenantId: "719",
        itemCode: BasicsItemCode.material,
        userId: value.id,
        isAll: false,
        fields: [{}],
      };
      run(data);
    }
  }, [selectedRows]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex px-3 py-3 overflow-hidden gap-1.5">
        <div style={{ width: "254px" }} className="h-full">
          <div className="pb-1.5 flex flex-col h-full">
            <div className="flex justify-between items-center h-6 mb-1.5">
              <OnChainSelect
                size="small"
                value={"物料库"}
                clearIcon={false}
              ></OnChainSelect>
            </div>
            {/* 
            <div className="h-10 flex justify-between items-center">
              <div className="text-xs">
                物料库{" "}
                <PlmIcon name="develop" className="text-xs scale-85"></PlmIcon>
              </div>
            </div> */}
            {/* <div className="flex-1 bg-white border border-outBorder"> */}
            <OnChainTable
              rowKey={"id"}
              className="tree-table"
              bordered={false}
              dataSource={leftTreeData}
              loading={leftTreeLoading}
              expandable={{
                expandIconColumnIndex: 2,
                indentSize: 12,
                expandedRowKeys: expandedRowKeys,
                onExpandedRowsChange: (expandedKeys: any) => {
                  setExpandedRowKeys(expandedKeys);
                },
              }}
              rowSelection={{
                columnWidth: 0,
                selectedRowKeys: selectedRows.map((item) => item.id),
              }}
              hideFooter
              extraHeight={-2}
              columns={[
                {
                  title: "名称",
                  dataIndex: "name",
                  search: {
                    type: "Input",
                  },
                  sorter: true,
                  render: (text, record: any) => {
                    return (
                      <div
                        className="cursor-pointer w-full overflow-hidden text-ellipsis flex items-center"
                        onClick={() => {
                          setSelectedRows([record]);
                        }}
                      >
                        <PlmIcon
                          className={"text-primary text-base mr-1"}
                          name={
                            record.apicode === "ItemAdministrator"
                              ? "a-Materialwarehouse"
                              : "file"
                          }
                        ></PlmIcon>
                        {text}
                      </div>
                    );
                  },
                },
                {
                  title: "",
                  dataIndex: "tool",
                  width: 72,
                  sorter: true,
                  render: (text, record: any) => {
                    if (record?.apicode == "ItemAdministrator") {
                      return (
                        <div
                          className="flex gap-2 flex-row-reverse  pr-1"
                          onClick={() => {
                            const ids: any = [];
                            const loop = (data: any) => {
                              for (let i = 0; i < data.length; i++) {
                                if (
                                  data[i]["children"] &&
                                  data[i]["children"].length
                                ) {
                                  ids.push(data[i]["id"]);
                                  loop(data[i]["children"]);
                                }
                              }
                            };
                            loop([record] || []);
                            setExpandedRowKeys(
                              new Set([...expandedRowKeys, ...ids])
                            );
                          }}
                        >
                          <PlmIcon
                            className="textv-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                            name="fold"
                          ></PlmIcon>
                        </div>
                      );
                    }
                    // if (record.apicode === "ItemAdmin") {
                    //   return (
                    //     <div className="flex gap-2 flex-row-reverse pr-1 row-tool">
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="fold"
                    //       ></PlmIcon>
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="add"
                    //       ></PlmIcon>
                    //     </div>
                    //   );
                    // }
                    // if (!record.isDelete) {
                    //   return (
                    //     <div className="flex gap-2 flex-row-reverse  pr-1 row-tool">
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="edit"
                    //       ></PlmIcon>
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="add"
                    //       ></PlmIcon>
                    //     </div>
                    //   );
                    // } else {
                    //   return (
                    //     <div className="flex gap-2 flex-row-reverse  pr-1 row-tool">
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="edit"
                    //       ></PlmIcon>
                    //       <PlmIcon
                    //         className="cursor-pointer text-xs hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="delete"
                    //       ></PlmIcon>
                    //       <PlmIcon
                    //         className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                    //         name="add"
                    //       ></PlmIcon>
                    //     </div>
                    //   );
                    // }
                  },
                },
              ]}
              selectedCell={{
                dataIndex: "",
                record: {},
              }}
            ></OnChainTable>
            {/* </div> */}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            style={{
              background: "linear-gradient(180deg,#f1f1f1 0%, #cdcdcd 100%)",
            }}
            className="w-full h-6 text-xs flex items-center pl-2.5 mb-4"
          >
            <span className="mr-1">物料库</span>
            {selectedRows[0] &&
              selectedRows[0]?.apicode != "ItemAdministrator" ? (
              <Fragment>
                <span className="mr-1">/</span>{" "}
                <span className="text-primary">{selectedRows[0].name}</span>
              </Fragment>
            ) : (
              <></>
            )}
          </div>
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="请输入编号或描述"
              value={selectVal}
              style={{ width: "360px" }}
              onChange={(e) => {
                setSelectVal(e.target.value);
              }}
            ></Input>
            <div className="w-7 h-7 cursor-pointer rounded-sm bg-white border-outBorder border flex items-center justify-center">
              <PlmIcon
                onClick={() => {
                  setSelectedRows([...selectedRows]);
                }}
                name="search"
              ></PlmIcon>
            </div>
          </div>
          <div className="bg-white w-full border-outBorder border flex overflow-y-auto" style={{ height: 'calc(100% - 85px)', padding: '17px 9px', flexWrap: 'wrap' }}>
            {tableData.map((item) => {
              return <PlmStockCard instance={item} userMap={userMap}></PlmStockCard>
            })}
          </div>
          {/* <div
            style={{
              background: "linear-gradient(180deg,#f1f1f1 0%, #cdcdcd 100%)",
            }}
            className="w-full h-6 text-xs flex items-center pl-2.5 mb-4"
          >
            搜索结果
          </div>
          <div className="flex-1 bg-white">
            <OnChainTable
              rowKey={"insId"}
              bordered={false}
              loading={loading}
              //   bordered={true}
              dataSource={tableData}
              rowSelection={{
                columnWidth: 19,
                selectedRowKeys: tableSelectedRows.map((item) => item.insId),
                onChange: (keys, rows: any) => {
                  setTableSelectedRows(rows);
                },
              }}
              onRow={(row: any) => {
                return {
                  onDoubleClick: async () => {
                    if (readPermission(row.number)) {
                      openDesign({
                        loading: () => {
                          dispatch(setLoading(true));
                        },
                        cancelLoading: () => {
                          dispatch(setLoading(false));
                        },
                        network: network,
                        insId: row.insId,
                        userId: user.id,
                        itemCode: row.itemCode,
                        extra: {
                          onEvent: async(path) => {
                            await invoke("open_designer",{path:`${path.substring(0, path.lastIndexOf('\\'))}"`})
                          }
                        }
                      });
                    } else {
                      message.error("没有权限")
                    }
                  },
                };
              }}
              expandable={{
                expandIconColumnIndex: 0,
              }}
              hideFooter
              extraHeight={22}
              columns={[
                {
                  title: "编号",
                  dataIndex: "number",
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                  render: (text: string) => {
                    return <a>{text}</a>
                  },
                },
                {
                  title: "描述",
                  dataIndex: "insDesc",
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                  // ellipsis: true,
                  // render: (text: string) => {
                  //   return renderIsPlmMosaic({ value: text, children: <div>{text}</div> });
                  // },
                },
                {
                  title: "类型",
                  dataIndex: "objectName",
                  // render: (text: string) => {
                  //   return renderIsPlmMosaic({ value: text, children: <div>{text}</div> });
                  // },
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                },
                {
                  title: "生命周期",
                  dataIndex: "statusName",
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                  render: (text: string, record: any) => {
                    return <PlmLifeCycle
                      record={record}
                      color={
                        record.lifecycle && record.lifecycle.color
                          ? record.lifecycle.color
                          : "1"
                      }
                    >
                      {text}
                    </PlmLifeCycle>
                  },
                },
                {
                  title: "版本",
                  dataIndex: "insVersion",
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                  render: (text: string) => {
                    return <div>{text === "Draft" ? "草稿" : text && text.split(" ")[0]}</div>
                  },
                },
                {
                  title: "生效时间",
                  dataIndex: "publishTime",
                  // render: (text: string) => {
                  //   return renderIsPlmMosaic({ value: text, children: <div>{text}</div> });
                  // },
                  // search: {
                  //   type: "Input",
                  // },
                  // sorter: true,
                },
              ]}
              selectedCell={{
                dataIndex: "",
                record: {},
              }}
            ></OnChainTable>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default stock;
