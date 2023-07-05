import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from "react";
import { cloneDeep, remove } from "lodash";
import { Collapse, Space } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { useAsyncEffect } from "ahooks";
import PlmIcon from "../PlmIcon";

const { Panel } = Collapse;

export interface MappingTableProps {
  leftTableList: any[];
  rightTableList: any[];
  mappingData: any[];
  isShowHeader: boolean;
  onLoading: (loading: boolean) => void;
  ref: any;
}

export interface MappingTableForwardRefProps {
  getTargetData: () => any;
}
const PlmMappingData: React.FC<MappingTableProps> = forwardRef((props, ref) => {
  const [leftTableData, setLeftTableData] = useState<any[]>([]);
  const [rightTableData, setRightTableData] = useState<any[]>([]);
  const [mappingData, setMappingData] = useState<any[]>(props.mappingData);
  const [source, setSource] = useState<any>({});

  useImperativeHandle(
    ref,
    (): MappingTableForwardRefProps => ({
      getTargetData: getTargetData,
    })
  );

  useAsyncEffect(async () => {
    //2个table数据源发生变化时,走映射初始化
    if (
      props.leftTableList &&
      Array.isArray(props.leftTableList) &&
      props.leftTableList.length > 0 &&
      props.rightTableList &&
      Array.isArray(props.rightTableList) &&
      props.rightTableList.length > 0
    ) {
      initTableData();
    }
  }, [props.leftTableList, props.rightTableList, props.mappingData]);

  const initTableData = () => {
    props.onLoading && props.onLoading(true);
    let leftTableDataTemp: any = cloneDeep(props.leftTableList) || [];
    let rightTableDataTemp: any = cloneDeep(props.rightTableList) || [];

    let mappingDataTemp: any = [];

    if (leftTableDataTemp.length === 0 || rightTableDataTemp.length === 0) {
      return;
    }

    leftTableDataTemp.forEach((lm: any) => {
      rightTableDataTemp.forEach((rmRoot: any) => {
        rmRoot.children.forEach((rm: any) => {
          if (
            isStringMatch(lm.filedName, rm.filedName) &&
            !rm.mate &&
            !lm.mate &&
            rm.isShow
          ) {
            //如果左边的名称包含右边的,并且mate都为空,则互相关联
            // mappingDataTemp.push({
            //   source: lm.filed,
            //   target: rm.filed,
            //   tabCode: rm.tabCode,
            // });
          }
        });
      });
    });

    //把所有重名的关系对象过滤,避免出现一对多的情况
    // const filterMappingData = mappingDataTemp.filter(
    //   (obj: any) =>
    //     !mappingDataTemp.some(
    //       (otherObj: any) => obj.source === otherObj.source && obj !== otherObj
    //     )
    // );

    // console.log(filterMappingData, 'filterMappingData')

    setLeftTableData(leftTableDataTemp);
    setRightTableData(rightTableDataTemp);
    setMappingData(props.mappingData);
    props.onLoading && props.onLoading(false);
  };

  function isStringMatch(str1: any, str2: any) {
    const str1Temp = str1?.replaceAll("*", "").trim().toLowerCase();
    const str2Temp = str2?.replaceAll("*", "").trim().toLowerCase();
    return str1Temp === str2Temp;
  }

  useLayoutEffect(() => {
    // 根据mappingData的关系结果,去刷新2个表格的关联关系
    setTableDataByMapping();
  }, [mappingData]);

  const setTableDataByMapping = () => {
    let leftTableDataTemp = cloneDeep(leftTableData) || [];
    let rightTableDataTemp = cloneDeep(rightTableData) || [];

    leftTableDataTemp.forEach((leftItem) => {
      let mappingItem = mappingData.find(
        (item) => item.source == leftItem.filed
      );
      if (mappingItem) {
        leftItem.mate = mappingItem.target;
      } else {
        leftItem.mate = null;
      }
    });
    rightTableDataTemp.forEach((rightRootItem) => {
      rightRootItem.children.forEach((rightItem: any) => {
        let mappingItem = mappingData.find(
          (item) =>
            item.tabCode == rightItem.tabCode && item.target == rightItem.filed
        );
        if (mappingItem) {
          rightItem.mate = mappingItem.source;
        } else {
          rightItem.mate = null;
        }
      });
    });

    setLeftTableData(leftTableDataTemp);
    setRightTableData(rightTableDataTemp);
  };

  const filterLabel = (data: any, value: any, isFromLeftTableData: any) => {
    let filedName = "";
    let mate = "";
    if (isFromLeftTableData) {
      data.forEach((rootItem: any) => {
        rootItem.children.forEach((i: any) => {
          if (i.filed === value) {
            filedName = i.filedName;
            mate = i.mate;
          }
        });
      });
    } else {
      data.forEach((i: any) => {
        if (i.filed === value) {
          filedName = i.filedName;
          mate = i.mate;
        }
      });
    }

    return filedName;
  };

  const clearMapping = (clearItem: any) => {
    let mappingDataTemp: any = cloneDeep(mappingData) || [];
    remove(
      mappingDataTemp,
      (item: any) =>
        item.target == clearItem.filed && item.tabCode == clearItem.tabCode
    );
    setMappingData(mappingDataTemp);
  };

  const matching = (item: any) => {
    if (JSON.stringify(source) === "{}") {
      return;
    }

    let mappingDataTemp: any = cloneDeep(mappingData) || [];
    mappingDataTemp.push({
      source: source.filed,
      target: item.filed,
      tabCode: item.tabCode,
    });
    setMappingData(mappingDataTemp);
    setSource({});
  };

  const getTargetData = () => {
    return {
      leftTableData: leftTableData,
      rightTableData: rightTableData,
      mappingData: mappingData,
    };
  };

  return (
    <div className="tableRoot">
      <div className="table">
        {/* <div className="table_head">导入字段</div> */}

        <div className="table_content">
          {leftTableData.map((item: any) => (
            <div
              key={item.filed}
              className={
                "table_item " +
                (source.filed === item.filed ? "activeItem" : "")
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!!item.mate) {
                  return;
                }
                setSource(item);
              }}
            >
              <span className="filedName" title={item.filedName}>
                {item.filedName}
              </span>
              {filterLabel(rightTableData, item.mate, true) && (
                <div className="mateLabel transitionAll">
                  <PlmIcon
                    style={{
                      color: "#0563b2",
                      fontSize: "12px",
                      transform: "rotate(180deg)",
                      cursor: "pointer",
                    }}
                    name={"arrow"}
                  />
                  <div
                    className="mateText"
                    title={filterLabel(rightTableData, item.mate, true)}
                  >
                    {filterLabel(rightTableData, item.mate, true)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="table">
        {/* <div className="table_head">导入字段</div> */}

        <div className="table_content">
          {rightTableData.map((rootItem: any) => (
            <div key={rootItem.rootId}>
              <Collapse
                ghost
                defaultActiveKey={["10002001", "10002002"]}
                expandIcon={({ isActive }) => (
                  <Space>
                    <CaretRightOutlined
                      style={{ color: "#656D9A" }}
                      rotate={isActive ? 90 : 0}
                    />
                  </Space>
                )}
              >
                {/* 控制是否显示Panel折叠面板的header */}
                <Panel
                  header={rootItem.rootName}
                  className={props.isShowHeader ? "" : "hiddenHeader"}
                  key={rootItem.rootId}
                >
                  {rootItem.children.map(
                    (item: any) =>
                      item.isShow && (
                        <div
                          key={item.filed}
                          className="table_item"
                          style={{ paddingLeft: "20px" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!!item.mate) {
                              return;
                            }
                            matching(item);
                          }}
                        >
                          <span className="filedName" title={item.filedName}>
                            <span
                              style={{
                                color: "#E91F1F",
                                display: "inline-block",
                                width: "10px",
                              }}
                            >
                              {item.notEmpty && "*"}&nbsp;
                            </span>
                            {item.filedName}
                          </span>

                          {filterLabel(leftTableData, item.mate, false) && (
                            <div className="mateLabel transitionAll">
                              <PlmIcon
                                style={{
                                  color: "#0563b2",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                                name={"arrow"}
                              />
                              <div
                                className="mateText"
                                title={filterLabel(
                                  leftTableData,
                                  item.mate,
                                  false
                                )}
                              >
                                {filterLabel(leftTableData, item.mate, false)}
                              </div>
                              <PlmIcon
                                className="clearMate"
                                style={{ fontSize: "12px", color: "red" }}
                                name={"close"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  clearMapping(item);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                  )}
                </Panel>
              </Collapse>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default PlmMappingData;
