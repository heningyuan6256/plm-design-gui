/**
 * Author: hny_147
 * Date: 2023/03/02 14:43:48
 * Description: 属性映射
 */

import { open } from "@tauri-apps/api/dialog";
import PlmIcon from "../components/PlmIcon";
import PlmMappingData from "../components/PlmMappingData";
import { BasicConfig, CommandConfig } from "../constant/config";
import { useMqttRegister } from "../hooks/useMqttRegister";
import { useEffect, useRef, useState } from "react";
import { Button, Tabs, TabsProps, message, Select, Input } from "antd";
import API from "../utils/api";
import { BasicsItemCode } from "../constant/itemCode";
import { useDispatch } from "react-redux";
import { setLoading } from "../models/loading";
import { cloneDeep } from "lodash";
import { mqttClient } from "../utils/MqttService";
import { useAsyncEffect, useLatest, useUpdateEffect } from "ahooks";
import { homeDir } from "@tauri-apps/api/path";
import { readTextFile, writeFile, writeTextFile } from "@tauri-apps/api/fs";

export enum settingType {
  cadToFile = "cadToFile",
  cadToItem = "cadToMaterial",
  PlmToCad = "fileToCad",
  setting = "setting",
}

export default function AttrMap() {
  const mappingRef = useRef<any>();
  const [attrList, setAttrList] = useState<Record<string, any>[]>([]);
  const [topActiveKey, setTopActiveKey] = useState<string>('preference');
  const [activeKey, setActiveKey] = useState<string>('sldprt');
  const [childActiveKey, setChildActiveKey] = useState(settingType.cadToFile)
  const [mappingData, setMappingData] = useState<any[]>([]);
  const [rightTableList, setRightTableList] = useState<Record<string, any>[]>(
    []
  );
  const [isEdited, setIsEdited] = useState(false)
  const [fileAddress, setFileAddress] = useState<any>({
    default: '',
    sldprt: '',
    sldasm: '',
    catpart: '',
    catproduct: '',
    prefixDrwName:'',
    suffixDrwName: '',
    partSaveas: [],
    partUploads: [],
    drwSaveas: '',
    drwFormat: '',
    // isNxDrwSync: '0'
  })

  const latestFileAddress = useLatest(fileAddress)

  const dispatch = useDispatch();

  const dealAttrMap = async (res?: any) => {
    dispatch(setLoading(true));
    // 查找公有属性
    const {
      result: { records: PublicAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode:
        childActiveKey === settingType.cadToItem
          ? BasicsItemCode.material
          : BasicsItemCode.file,
      tabCode: "10002001",
    });
    // 查找专有属性
    const {
      result: { records: PrivateAttrs },
    }: any = await API.getInstanceAttrs({
      itemCode:
        childActiveKey === settingType.cadToItem
          ? BasicsItemCode.material
          : BasicsItemCode.file,
      tabCode: "10002002",
    });
    const fileName = fileAddress[activeKey].substring(fileAddress[activeKey].lastIndexOf('\\') + 1)
    const attList = res.output_data[fileName] || [];
    // 使用 reduce 方法进行去重
    const uniqueArray = attList.reduce((acc: any, obj: any) => {
      const found = acc.find((item: any) => item.name === obj.name);
      if (!found) {
        acc.push(obj);
      }
      return acc;
    }, []);
    setAttrList(
      uniqueArray.map((item: any) => {
        return {
          ...item,
          filedName: item.name,
          filed: item.name,
          meta: "",
        };
      })
    );
    const configData = (list: any) => {
      return list.map((item: any) => {
        return {
          ...item,
          filedName: item.name,
          filed: item.apicode,
          attrId: item.id,
          notEmpty: item.required,
          isShow:
            item.readonly != "4" &&
            item.status &&
            item.readonly != "3" &&
            item.readonly != "2",
        };
      });
    };
    API.getMapptingAttrs({
      toolName: BasicConfig.pubgin_topic,
      mappingName: childActiveKey,
      fileType: activeKey,
    }).then((res: any) => {
      setMappingData(
        (res.result || []).map((item: any) => {
          return {
            source: item.sourceAttr,
            target: item.targetAttr,
            tabCode: item.tabCode,
          };
        })
      );
      const rightTableList = [
        {
          rootName: "公有属性",
          rootId: "10002001",
          children: configData(PublicAttrs),
        },
        {
          rootName: "专有属性",
          rootId: "10002002",
          children: configData(PrivateAttrs),
        },
      ];
      console.log(rightTableList, 'rightTableList')
      setRightTableList(rightTableList);
      dispatch(setLoading(false));
    });
  };

  // useAsyncEffect(async() => {

  // }, [
  // ])

  //清除映射关系数据
  const clearData = () => {
    setMappingData([])
    setAttrList([])
    setRightTableList([])
  }

  useAsyncEffect(async () => {
    // if (topActiveKey === 'attr') {
    dispatch(setLoading(true));
    let text = ''
    try {
      const homeDirPath = await homeDir();
      text = await readTextFile(`${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`, {
      })
    } catch (e) {

    }

    if (text) {
      const fileAddressScope = JSON.parse(text)
      fileAddressScope.partSaveas = fileAddressScope.partSaveas || []
      fileAddressScope.partUploads = fileAddressScope.partUploads || []
      // fileAddressScope.isNxDrwSync = fileAddressScope.isNxDrwSync || '0'
      setFileAddress(fileAddressScope)
      dispatch(setLoading(false));
      // if (fileAddressScope[activeKey]) {
      //   mqttClient.publish({
      //     type: CommandConfig.getProductTypeAtt,
      //     input_data: {
      //       template_path:
      //         fileAddressScope[activeKey].substring(0, fileAddressScope[activeKey].lastIndexOf('\\')),
      //     },
      //   });
      // } else {
      //   message.error('请选择相对应的模板文件')
      //   dispatch(setLoading(false));
      //   clearData()
      // }
    } else {
      // message.error('请选择相对应的模板文件')
      dispatch(setLoading(false));
      clearData()
    }
    // }
  }, [activeKey, childActiveKey, topActiveKey]);

  // 监听属性映射
  useMqttRegister(CommandConfig.getProductTypeAtt, (res) => {
    dealAttrMap(res);
  });

  const tabItems = [
    // {
    //   key: 'attr',
    //   label: '属性设置'
    // },
    {
      key: 'preference',
      label: '首选项'
    }
  ]

  const items: TabsProps["items"] = [
    {
      key: 'sldprt',
      label: `SLDPRT`,
    },
    {
      key: 'sldasm',
      label: `SLDASM`,
    },
    {
      key: 'catpart',
      label: `CATPart`,
    },
    {
      key: 'catproduct',
      label: `CATProduct`,
    },
  ];
  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden bg-base"
      style={{ padding: "12px" }}
    >
      <Tabs
        activeKey={topActiveKey}
        items={tabItems}
        destroyInactiveTabPane
        onTabClick={(e) => {
          setIsEdited(false)
          setTopActiveKey(e);
        }}
      />
      {
        topActiveKey === 'attr' ? <div className="h-full flex flex-col overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <div className="bg-white mt-3 mr-2 border border-outBorder text-xs" style={{ width: '140px', minWidth: '140px', paddingTop: '11px', paddingBottom: '11px' }}>
              {items.map((item) => {
                return <div key={item.key} className={`mb-2 cursor-pointer hover:bg-tabTitleBg ${item.key === activeKey ? 'bg-tabTitleBg' : ''}`}
                  onClick={() => {
                    setActiveKey(item.key);
                  }} style={{
                    paddingLeft: '11px', paddingRight: '11px', paddingTop: '2px', paddingBottom: "2px"
                  }}>
                  {item.label}
                </div>
              })}
            </div>
            {
              [...attrList, ...rightTableList].length ? <div className="overflow-hidden h-full mt-3 flex-1">
                <div className="flex text-xs border-l border-outBorder">
                  <div
                    className={`bg-white border-r border-t cursor-pointer border-outBorder ${childActiveKey == settingType.cadToFile ? 'text-primary' : ''}`}
                    style={{ padding: "3px 9px" }}
                    onClick={() => {
                      setChildActiveKey(settingType.cadToFile)
                    }}
                  >
                    CAD至文件
                  </div>
                  <div
                    className={`bg-white border-r border-t cursor-pointer border-outBorder ${childActiveKey == settingType.cadToItem ? 'text-primary' : ''}`}
                    style={{ padding: "3px 9px" }}
                    onClick={() => {
                      setChildActiveKey(settingType.cadToItem)
                    }}
                  >
                    CAD至物料
                  </div>
                  <div
                    className={`bg-white border-r border-t cursor-pointer border-outBorder ${childActiveKey == settingType.PlmToCad ? 'text-primary' : ''}`}
                    style={{ padding: "3px 9px" }}
                    onClick={() => {
                      setChildActiveKey(settingType.PlmToCad)
                    }}
                  >
                    文件至CAD
                  </div>
                </div>
                <div className="flex overflow-hidden" style={{ height: "calc(100% - 36px)", width: "100%" }}>
                  <div
                    className="h-full w-full bg-white"
                  >
                    <PlmMappingData
                      ref={mappingRef}
                      isShowHeader={false}
                      onLoading={() => { }}
                      mappingData={mappingData}
                      leftTableList={attrList}
                      rightTableList={rightTableList}
                    ></PlmMappingData>

                  </div>
                </div>
              </div> : <></>
            }

          </div>


          <div style={{ textAlign: "right", marginTop: '8px' }}>
            <Button
              className="rounded-sm mr-2 text-xs bg-white"
              onClick={() => {
                setMappingData(cloneDeep(mappingData));
              }}
            >
              还原
            </Button>
            <Button
              className="rounded-sm text-xs bg-white"
              // style={{ border: "1px solid #cdcdcd" }}
              onClick={() => {
                const data = mappingRef?.current?.getTargetData();
                API.postMapptingAttrs({
                  attrMappingList: data.mappingData,
                  toolName: BasicConfig.pubgin_topic,
                  mappingName: childActiveKey,
                  fileType: activeKey,
                }).then((res) => {
                  message.success("保存成功");
                })
              }}
            >
              保存
            </Button>
          </div>
        </div> : <div>
          <div className="flex justify-end">
            <Button onClick={async () => {
              if (isEdited) {
                const homeDirPath = await homeDir();
                await writeTextFile(
                  `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.setting}`,
                  JSON.stringify(fileAddress)
                );
              }
              setIsEdited(!isEdited)
            }} style={{ height: '30px', fontSize: '12px', width: '66px', borderRadius: '2px', borderColor: '#57a8ed', marginTop: '12px' }}>{isEdited ? '保存' : '编辑'}</Button>
          </div>

          <div className='bg-white border border-outBorder' style={{ padding: '24px', marginTop: '12px', fontSize: '12px' }}>

            {
              [{
                button: '更改',
                icon: 'file1',
                text: '默认文件下载地址:',
                address: latestFileAddress.current.default,
                function: async () => {
                  const selected = await open({
                    multiple: false,
                    directory: true,
                    defaultPath: fileAddress.default,
                    title: '选择默认文件下载地址',
                  });
                  setFileAddress({ ...fileAddress, default: selected })
                }
              },
                // {
                //   button: '选择',
                //   text: 'SLDPRT模板文件:',
                //   icon: 'document',
                //   address: fileAddress.sldprt,
                //   function: async () => {
                //     const selected = await open({
                //       multiple: false,
                //       directory: false,
                //       title: '选择SLDPRT模板文件',
                //       filters: [{
                //         name: 'prtdot',
                //         extensions: ['prtdot']
                //       }]
                //     });
                //     console.log(selected, 'selected');

                //     setFileAddress({ ...fileAddress, sldprt: selected })
                //   }
                // },
                // {
                //   button: '选择',
                //   text: 'SLDASM模板文件:',
                //   icon: 'document',
                //   address: fileAddress.sldasm,
                //   function: async () => {
                //     const selected = await open({
                //       multiple: false,
                //       directory: false,
                //       title: '选择SLDASM模板文件',
                //       filters: [{
                //         name: 'asmdot',
                //         extensions: ['asmdot']
                //       }]
                //     });
                //     setFileAddress({ ...fileAddress, sldasm: selected })
                //   }
                // },
                // {
                //   button: '选择',
                //   text: 'CATPart模板文件:',
                //   icon: 'document',
                //   address: fileAddress.catpart,
                //   function: async () => {
                //     const selected = await open({
                //       multiple: false,
                //       directory: false,
                //       title: '选择CATPart模板文件',
                //       filters: [{
                //         name: 'CATPart',
                //         extensions: ['CATPart']
                //       }]
                //     });
                //     setFileAddress({ ...fileAddress, catpart: selected })
                //   }
                // }, {
                //   button: '选择',
                //   text: 'CATProduct模板文件:',
                //   icon: 'document',
                //   address: fileAddress.catproduct,
                //   function: async () => {
                //     const selected = await open({
                //       multiple: false,
                //       directory: false,
                //       title: '选择CATProduct模板文件',
                //       filters: [{
                //         name: 'CATProduct',
                //         extensions: ['CATProduct']
                //       }]
                //     });
                //     setFileAddress({ ...fileAddress, catproduct: selected })
                //   }
                // }
              ].map((item, index) => {
                return <div key={index} style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
                  <div className="flex items-center justify-between" style={{ width: '600px' }}>
                    <div className="flex items-center">
                      <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
                      <div style={{ width: '150px' }}>{item.text}</div>
                      <div className="flex justify-between" style={{ color: isEdited ? '#2C3652' : '#B2B2B6', width: '440px', height: '24px', background: isEdited ? '#ecedf0' : '#ecedf0', borderRadius: '2px', padding: '3px 8px' }}>
                        <div className='overflow-hidden text-ellipsis whitespace-nowrap' title={item.address}>{item.address}</div>
                        <div className="flex items-center">
                          <div style={{ height: '16px', width: '1px', background: '#cdcdcd', margin: '0px 8px' }}></div>
                          <div onClick={isEdited ? item.function : () => { }} className={`${isEdited ? 'cursor-pointer' : 'cursor-not-allowed'} whitespace-nowrap`}><PlmIcon name={item.icon}></PlmIcon> {item.button}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              })
            }
            {/* <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>上传工程图另存文件格式:</div>
              <Select suffixIcon={<PlmIcon style={{ fontSize: '10px', scale: '0.5' }} name="dropdown"></PlmIcon>} className="attr" onChange={(e) => {
                setFileAddress({ ...fileAddress, drwSaveas: e })
              }} value={fileAddress.drwSaveas} disabled={!isEdited} style={{ width: '440px' }} options={[{ label: 'pdf', value: 'pdf' }]} size={'small'}></Select>
            </div> */}
            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>上传零件图附带文件格式:</div>
              <Select mode="multiple" onChange={(e) => {
                setFileAddress({ ...fileAddress, partUploads: e })
              }} suffixIcon={<PlmIcon style={{ fontSize: '10px', scale: '0.5' }} name="dropdown"></PlmIcon>} className="attr" value={fileAddress.partUploads} disabled={!isEdited} style={{ width: '440px' }} options={[{ label: 'PDF', value: 'pdf' }, { label: 'STEP', value: 'step' }, { label: 'DWG', value: 'dwg' }, { label: 'DRW', value: 'drw' }, { label: 'SLDDRW', value: 'slddrw' }]} size={'small'}></Select>
            </div>
            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>上传零件图另存文件格式:</div>
              <Select mode="multiple" onChange={(e) => {
                setFileAddress({ ...fileAddress, partSaveas: e })
              }} suffixIcon={<PlmIcon style={{ fontSize: '10px', scale: '0.5' }} name="dropdown"></PlmIcon>} className="attr" value={fileAddress.partSaveas} disabled={!isEdited} style={{ width: '440px' }} options={[{ label: 'STEP', value: 'step' }, { label: 'PDF', value: 'pdf' }]} size={'small'}></Select>
            </div>

            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>指定工程图格式:</div>
              <Select allowClear onChange={(e) => {
                setFileAddress({ ...fileAddress, drwFormat: e })
              }} suffixIcon={<PlmIcon style={{ fontSize: '10px', scale: '0.5' }} name="dropdown"></PlmIcon>} className="attr" value={fileAddress.drwFormat} disabled={!isEdited} style={{ width: '440px' }} options={[{ label: 'DWG', value: 'dwg' }, { label: 'DRW', value: 'drw' }, { label: 'SLDDRW', value: 'slddrw' }, { label: 'PRT', value: 'prt' }]} size={'small'}></Select>
            </div>

            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>工程图名称前缀:</div>
              <Input value={fileAddress.prefixDrwName} className="attr" style={{ width: '440px' }} disabled={!isEdited} onChange={(e) => {
                setFileAddress({ ...fileAddress, prefixDrwName: e.target.value })
              }} size={'small'}></Input>
            </div>

            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>工程图名称后缀:</div>
              <Input value={fileAddress.suffixDrwName} className="attr" style={{ width: '440px' }} disabled={!isEdited} onChange={(e) => {
                setFileAddress({ ...fileAddress, suffixDrwName: e.target.value })
              }} size={'small'}></Input>
            </div>
{/* 
            <div style={{ height: '40px', display: 'flex', alignItems: 'center' }}>
              <div className='h-3 bg-primary' style={{ width: '2px', marginRight: '6px' }}></div>
              <div style={{ width: '150px' }}>NX零件图是否包含工程图:</div>
              <Select onChange={(e) => {
                setFileAddress({ ...fileAddress, isNxDrwSync: e })
              }} suffixIcon={<PlmIcon style={{ fontSize: '10px', scale: '0.5' }} name="dropdown"></PlmIcon>} className="attr" value={fileAddress.isNxDrwSync} disabled={!isEdited} style={{ width: '440px' }} options={[{ label: '是', value: '1' }, { label: '否', value: '0' }]} size={'small'}></Select>
            </div> */}
          </div>
        </div>

      }
    </div>
  );
}
