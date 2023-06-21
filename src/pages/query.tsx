/**
 * Author: hny_147
 * Date: 2023/03/02 14:44:05
 * Description: 库
 */
import PlmIcon from "../components/PlmIcon";
import { OnChainTable } from "onchain-ui";
import { FC, useEffect, useMemo, useState } from "react";
import API from "../utils/api";
import { Input } from "antd";
import { useSelector } from "react-redux";
import { useRequest } from "ahooks";
import PlmLifeCycle from "../components/PlmLifeCycle";
import { OnChainTableColumnProps } from "onchain-ui/dist/esm/OnChainTable";
// import { dealMaterialData } from 'plm-wasm'

const query: FC = () => {
  const [leftTreeData, setLeftTreeData] = useState<Record<string, any>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, any>[]>([]);
  const [tableSelectedRows, setTableSelectedRows] = useState<
    Record<string, any>[]
  >([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const { value } = useSelector((state: any) => state.user);
  const [SearchColumn, setSearchColumn] = useState<Record<string, any>[]>([]);

  const { run, loading } = useRequest(() => API.getQueryFolder(), {
    manual: true,
    onSuccess(data: any) {
      const loop = (data: any) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].conditionList && data[i].conditionList.length) {
            data[i].children = data[i].conditionList;
          }
          if (data[i].conditionName) {
            data[i].name = data[i].conditionName;
          }
          if (data[i] && data[i].children && data[i].children.length) {
            loop(data[i].children);
          }
        }
      };
      loop(data.result);
      setLeftTreeData(data.result);
    },
  });

  const GetConditionDsl = useRequest((data) => API.getConditionDsl(data), {
    manual: true,
    onSuccess(res: any) {
      const records = res.result.pageData.records.map((item: any) => {
        let row: any = {};
        item.insAttrs.forEach((v: any) => {
          row[v.apicode] = v.attrValue;
        });
        row["insId"] = item.id;
        return row;
      });
      setTableData(records);
    },
  });

  useEffect(() => {
    run();
  }, []);

  useEffect(() => {
    API.getQueryColumns({ itemCode: "10001002" }).then((res: any) => {
      setSearchColumn(res.result);
    });
  }, []);

  const column = useMemo(() => {
    return SearchColumn.map((item) => {
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

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="w-full bg-base flex-1 flex px-3 py-3 overflow-hidden gap-1.5">
        <div
          style={{ width: "254px" }}
          className="h-full border border-outBorder"
        >
          <div className="pb-1.5 px-1.5 flex flex-col h-full">
            <div className="h-10 flex justify-between items-center">
              <div className="text-xs">
                搜索{" "}
                {/* <PlmIcon name="develop" className="text-xs scale-85"></PlmIcon> */}
              </div>
            </div>
            <div className="flex-1 bg-white border border-outBorder">
              <OnChainTable
                rowKey={"id"}
                className="tree-table"
                bordered={false}
                dataSource={leftTreeData}
                expandable={{
                  expandIconColumnIndex: 2,
                  indentSize: 22,
                }}
                rowSelection={{
                  columnWidth: 0,
                  selectedRowKeys: selectedRows.map((item) => item.id),
                }}
                hideFooter
                extraHeight={0}
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
                          className="cursor-pointer w-full overflow-hidden text-ellipsis"
                          onClick={() => {
                            setSelectedRows([record]);
                            if (!(record.children && record.children.length)) {
                              GetConditionDsl.run({
                                actionType: "select",
                                dsl: record.content,
                                pageNo: 1,
                                fields: SearchColumn.map((item) => {
                                  return { ...item, parentTabCode: 10002001 };
                                }),
                                pageSize: 100,
                                itemCode: "10001002",
                              });
                            }
                          }}
                        >
                          {record.children ? (
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
                  // {
                  //   title: "",
                  //   dataIndex: "tool",
                  //   width: 72,
                  //   sorter: true,
                  //   render: (text, record: any) => {
                  //     if (record.apicode === "ItemAdmin") {
                  //       return (
                  //         <div className="flex gap-2 flex-row-reverse pr-1 row-tool">
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="fold"
                  //           ></PlmIcon>
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="add"
                  //           ></PlmIcon>
                  //         </div>
                  //       );
                  //     }
                  //     if (!record.isDelete) {
                  //       return (
                  //         <div className="flex gap-2 flex-row-reverse  pr-1 row-tool">
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="edit"
                  //           ></PlmIcon>
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="add"
                  //           ></PlmIcon>
                  //         </div>
                  //       );
                  //     } else {
                  //       return (
                  //         <div className="flex gap-2 flex-row-reverse  pr-1 row-tool">
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="edit"
                  //           ></PlmIcon>
                  //           <PlmIcon
                  //             className="cursor-pointer text-xs hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="delete"
                  //           ></PlmIcon>
                  //           <PlmIcon
                  //             className="text-xs cursor-pointer hover:shadow-3xl hover:bg-hoverBlue hover:text-primary"
                  //             name="add"
                  //           ></PlmIcon>
                  //         </div>
                  //       );
                  //     }
                  //   },
                  // },
                ]}
                selectedCell={{
                  dataIndex: "",
                  record: {},
                }}
              ></OnChainTable>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-tabTitleBg w-full h-6 text-xs flex items-center pl-2.5 mb-4">
            <span className="mr-1">搜索</span>
            {/* <span className="mr-1">/</span>{" "}
            <span className="text-primary">电子件库</span> */}
          </div>
          <div className="mb-4 flex gap-2 justify-center">
            <Input
              placeholder="请输入编号或描述"
              style={{ width: "360px" }}
            ></Input>
            <div className="w-7 h-7 rounded-sm bg-secondary flex items-center justify-center">
              <PlmIcon name="search"></PlmIcon>
            </div>
          </div>
          <div className="bg-tabTitleBg w-full h-6 text-xs flex items-center pl-2.5 mb-4">
            搜索结果
          </div>
          <div className="flex-1 bg-white">
            <OnChainTable
              rowKey={"insId"}
              loading={GetConditionDsl.loading}
              //   bordered={true}
              dataSource={tableData}
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
              hideFooter
              extraHeight={22}
              columns={column as OnChainTableColumnProps}
              selectedCell={{
                dataIndex: "",
                record: {},
              }}
            ></OnChainTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default query;
