/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 搜索
 */
import PlmIcon from "../components/PlmIcon";
import { OnChainSelect, OnChainTable } from "onchain-ui";
import { FC, useEffect, useMemo, useState } from "react";
import API from "../utils/api";
import { Input, message } from "antd";
import { useSelector } from "react-redux";
import { useKeyPress, useRequest } from "ahooks";
import PlmLifeCycle from "../components/PlmLifeCycle";
import { OnChainTableColumnProps } from "onchain-ui/dist/esm/OnChainTable";
import { Utils } from "../utils";
import { createDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import { BasicConfig } from "../constant/config";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { getClient, ResponseType } from "@tauri-apps/api/http";
import { Command, open } from "@tauri-apps/api/shell";
import { BasicsItemCode, ItemCode } from "../constant/itemCode";
import { openDesign } from "../layout/pageLayout";
import { cloneDeep } from "lodash";
// import { dealMaterialData } from 'plm-wasm'

const query: FC = () => {
  const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [tableSelectedRows, setTableSelectedRows] = useState<
    Record<string, any>[]
  >([]);
  const [selectVal, setSelectVal] = useState<string>("");
  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { value: user } = useSelector((state: any) => state.user);
  const [SearchColumn, setSearchColumn] = useState<Record<string, any>[]>([]);
  const dispatch = useDispatch();
  const { value: network } = useSelector((state: any) => state.network);

  const { run, loading } = useRequest(() => API.getQueryFolder(), {
    manual: true,
    onSuccess(data: any) {
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          if (
            (data[i].conditionList && data[i].conditionList.length) ||
            (data[i].children && data[i].children.length)
          ) {
            data[i].conditionList = (data[i].conditionList || []).filter(
              (item: any) => {
                return [BasicsItemCode.file, BasicsItemCode.material].includes(
                  String(item.itemCode) as BasicsItemCode
                );
              }
            );

            data[i].children = [
              ...(data[i].conditionList || []),
              ...(data[i].children || []),
            ];
          }
          if (data[i].conditionName) {
            data[i].name = data[i].conditionName;
          }
          if (data[i] && data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };

      const serachs = data.result.filter(
        (item: any) => item.folderType != "change"
      );
      loop(serachs);
      setLeftTreeData(serachs);
    },
  });

  const GetConditionDsl = useRequest((data) => API.getConditionDsl(data), {
    manual: true,
    onSuccess(res: any) {
      const records = res.result.pageData.records.map((item: any) => {
        const transferMap = Utils.transformArrayToMap(
          item.baseSearchDto.searchStr,
          "apiCode",
          "attrValue"
        );
        return { ...item.baseSearchDto, ...transferMap };
      });
      setTableData(
        records.filter((item: any) => {
          return (
            item.number.indexOf(selectVal) != -1 ||
            item.insDesc.indexOf(selectVal) != -1
          );
        })
      );
    },
  });

  useKeyPress("enter", () => {
    setSelectedRows([...selectedRows]);
  });

  useEffect(() => {
    run();
  }, []);

  useEffect(() => {
    API.getQueryColumns({ itemCode: "10001006" }).then((res: any) => {
      console.log(res.result, "result");
      setSearchColumn(res.result);
    });
  }, []);

  const column = useMemo(() => {
    return [
      {
        title: "编号",
        dataIndex: "number",
        apicode: "Number",
        width: 180,
        search: {
          type: "Input",
        },
        sorter: true,
        ellipsis: true,
        render: (data: string, record: Record<string, any>) => {
          return <a>{data}</a>;
        },
      },
      {
        title: "描述",
        ellipsis: true,
        search: {
          type: "Input",
        },
        width: 180,
        dataIndex: "insDesc",
        apicode: "Description",
        sorter: true,
      },

      {
        title: "类型",
        ellipsis: true,
        width: 100,
        dataIndex: "objectName",
        apicode: "Category",
        search: {
          type: "Input",
          props: {},
        },
        sorter: true,
      },
      {
        title: "状态",
        width: 70,
        ellipsis: true,
        dataIndex: "statusName",
        sorter: true,
        render: (text: string, record: any) => {
          return (
            <PlmLifeCycle
              record={record}
              color={
                record.lifecycle && record.lifecycle.color
                  ? record.lifecycle.color
                  : "1"
              }
            >
              {text}
            </PlmLifeCycle>
          );
        },
      },
      // {
      //   title: '版本',
      //   ellipsis: true,
      //   width: 90,
      //   dataIndex: 'insVersion',
      //   sorter: true,
      //   render: (text: any) => {
      //     return text === 'Draft' ? '草稿' : text && text.split(' ')[0];
      //   },
      // },
      {
        title: "发布时间",
        width: 150,
        ellipsis: true,
        search: {
          type: "Date",
        },
        sorter: true,
        dataIndex: "publishTime",
        apicode: "ReleaseTime",
      },
      {
        title: "创建人",
        width: 100,
        // editable: true,
        // formitem: {
        //   type: "Select",
        //   props: {
        //     disabled: true, //控制不能编辑
        //     options: [],
        //   },
        // },
        ellipsis: true,
        //取属性外面的
        dataIndex: "CreateUser",
        apicode: "CreateUser",
        sorter: true,
        // isUser: true,
      },
      {
        title: "创建时间",
        width: 150,
        ellipsis: true,
        search: {
          type: "Date",
        },
        sorter: true,
        dataIndex: "createTime",
        apicode: "CreateTime",
      },
    ];

    SearchColumn.map((item) => {
      return {
        ...item,
        title: item.name,
        dataIndex: item.apicode,
        search: {
          type: "Input",
        },
        sorter: true,
        ellipsis: true,
        render:
          item.apicode === "Number" || item.apicode === "CreateUser"
            ? (text: string) => {
                return <a>{text}</a>;
              }
            : undefined,
      };
    });
  }, [SearchColumn]);

  useEffect(() => {
    if (selectedRows && selectedRows.length) {
      GetConditionDsl.run({
        actionType: "select",
        dsl: selectedRows[0].content,
        pageNo: 1,
        fields: SearchColumn.map((item) => {
          return { ...item, parentTabCode: 10002001 };
        }),
        pageSize: 200,
        userId: user.id,
        itemCode: selectedRows[0].itemCode,
      });
    }
  }, [selectedRows]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex px-3 py-3 overflow-hidden gap-1.5">
        <div style={{ width: "254px" }} className="h-full">
          {/* <div className="flex flex-col h-full"> */}
          {/* <div className="h-10 flex justify-between items-center">
              <div className="text-xs">
                搜索{" "}
              </div>
            </div> */}
          <div className="flex justify-between items-center h-6 mb-1.5">
            <OnChainSelect
              size="small"
              value={"搜索"}
              showArrow={false}
              open={false}
              clearIcon={false}
              showSearch={false}
            ></OnChainSelect>
          </div>
          {/* <div className="flex-1 bg-white border border-outBorder"> */}
          <OnChainTable
            rowKey={"id"}
            className="tree-table"
            bordered={false}
            dataSource={leftTreeData}
            expandable={{
              expandIconColumnIndex: 2,
              indentSize: 20,
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
                  console.log(record, 'record')
                  return (
                    <div
                      className="cursor-pointer w-full overflow-hidden text-ellipsis"
                      onClick={() => {
                        setSelectedRows([record]);
                      }}
                    >
                      {record.children || record.parentId == '0' ? (
                        <PlmIcon
                          className={"text-primary text-base mr-1"}
                          name={"file"}
                        ></PlmIcon>
                      ) : (
                        <span className="ml-3"></span>
                      )}
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
                  if (record.parentId == "0" && !record.canDel) {
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
                },
                // },
              },
            ]}
            selectedCell={{
              dataIndex: "",
              record: {},
            }}
          ></OnChainTable>
          {/* </div> */}
          {/* </div> */}
        </div>
        <div className="flex-1 overflow-hidden">
          <div
            style={{
              background: "linear-gradient(180deg,#f1f1f1 0%, #cdcdcd 100%)",
            }}
            className="w-full h-6 text-xs flex items-center pl-2.5 mb-4"
          >
            <span className="mr-1">搜索</span>
            {/* <span className="mr-1">/</span>{" "}
            <span className="text-primary">电子件库</span> */}
          </div>
          <div className="mb-4 flex gap-2 justify-center items-center">
            <Input
              placeholder="请输入编号或描述"
              style={{ width: "360px" }}
              value={selectVal}
              onChange={(e) => {
                setSelectVal(e.target.value);
              }}
              suffix={
                <PlmIcon name="search" style={{ color: "#CDCDCD" }}></PlmIcon>
              }
            ></Input>
            <div
              style={{ height: "30px" }}
              onClick={() => {
                setSelectedRows([...selectedRows]);
              }}
              className="text-xs rounded-sm hover:border hover:border-primary transition-all cursor-pointer bg-white border-outBorder border flex items-center justify-center w-16"
            >
              搜索
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(180deg,#f1f1f1 0%, #cdcdcd 100%)",
            }}
            className="w-full h-6 text-xs flex items-center pl-2.5 mb-4"
          >
            搜索结果
          </div>
          <div className="flex-1 bg-white">
            {column.length ? (
              <OnChainTable
                rowKey={"insId"}
                loading={GetConditionDsl.loading}
                //   bordered={true}
                dataSource={tableData}
                bordered={false}
                rowSelection={{
                  columnWidth: 19,
                  selectedRowKeys: tableSelectedRows.map((item) => item.insId),
                  onChange: (keys, rows: any) => {
                    setTableSelectedRows(rows);
                  },
                }}
                expandable={{
                  expandIconColumnIndex: 0,
                }}
                onRow={(row: any) => {
                  return {
                    onDoubleClick: async () => {
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
                      });
                    },
                  };
                }}
                hideFooter
                extraHeight={22}
                columns={column as OnChainTableColumnProps}
                selectedCell={{
                  dataIndex: "",
                  record: {},
                }}
              ></OnChainTable>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default query;
