import { find, isArray } from "lodash";
// import moment from "moment";
import { BasicConfig } from "../constant/config";
import { ListCode } from "../constant/listCode";

export class Utils {
  // 处理返回后的列表数据
  public static adaptListItems: any = (list: Record<string, any>[] = []) => {
    return (list || [])
      .filter((item) => item)
      .map((item: any) => {
        return {
          label: item.workflowName || item.departName || item.name,
          value: item.id,
          disabled: item.disabled,
          apicode: item.apicode,
          code: item.code,
          children:
            item.children && item.children.length > 0
              ? this.adaptListItems(item.children)
              : [],
          empno: item.empNo,
        };
      });
  };
  // 转换文件大小
  public static converBytes(size: number) {
    size = Number(size);
    var data = '';
    if (size == 0) {
      return '0B';
    }
    if (size < 0.1 * 1024) {
      //如果小于0.1KB转化成B
      data = size.toFixed(2) + 'B';
    } else if (size < 0.1 * 1024 * 1024) {
      //如果小于0.1MB转化成KB
      data = (size / 1024).toFixed(2) + 'KB';
    } else if (size < 0.1 * 1024 * 1024 * 1024) {
      //如果小于0.1GB转化成MB
      data = (size / (1024 * 1024)).toFixed(2) + 'MB';
    } else {
      //其他转化成GB
      data = (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }
    var sizestr = data + '';
    var len = sizestr.indexOf('.');
    var dec = sizestr.substr(len + 1, 2);
    if (dec == '00') {
      //当小数点后为00时 去掉小数部分
      return sizestr.substring(0, len) + sizestr.substr(len + 3, 2);
    }
    return sizestr;
  }

  //解析列表值
  public static resolveList = (result: Record<string, any>) => {
    let map: Record<string, any> = {};
    result.forEach((item: { listItems: any; code: number }) => {
      if (item.code == ListCode.userList) {
        map[item.code] =
          this.adaptListItems(item.listItems).map((item: any) => {
            return {
              ...item,
              label: `${item.label}(${item.code})`,
            };
          }) || [];
      } else if (item.code == ListCode.WorkflowList) {
        map[item.code] =
          this.adaptListItems(item.listItems).map((item: any) => {
            return {
              ...item,
              label: `${item.label}`,
            };
          }) || [];
      } else if (item.code == ListCode.VersionList) {
        map[item.code] = [];
      } else {
        map[item.code] = this.adaptListItems(item.listItems) || [];
      }
    });
    return map;
  };

  // 生成指令
  public static instruction(instruction: string) {
    return `${instruction}`;
  }

  // 将数组转成map
  public static transformArrayToMap = (
    list: Record<string, any>[],
    key: string,
    value?: string
  ) => {
    return (list || [])?.reduce((pre: any, cur: any) => {
      if (value) {
        pre[cur[key]] = cur[value];
      } else {
        pre[cur[key]] = cur;
      }
      return pre;
    }, {});
  };

  // 日期控制禁止选择
  // public static disabledDate = (dateRule: any, current: any) => {
  //   // 小于今天
  //   if (dateRule === "1") {
  //     return current > moment().startOf("day");
  //     // 小于等于今天
  //   } else if (dateRule === "2") {
  //     return current > moment(new Date());
  //     // 等于今天
  //   } else if (dateRule === "3") {
  //     return (
  //       moment(current).format("YYYY-MM-DD") !==
  //       moment(new Date()).format("YYYY-MM-DD")
  //     );
  //     // 大于等于今天
  //   } else if (dateRule === "4") {
  //     //@ts-ignore
  //     return current < moment(new Date(new Date() - 24 * 60 * 60 * 1000));
  //     // 大于今天
  //   } else if (dateRule === "5") {
  //     return current < moment().endOf("day");
  //   }
  // };

  // 生成动态formitem
  // public static generateFormItemProps = (
  //   item: Record<string, any>,
  //   listCodeMap: Record<string, any>,
  //   extra?: { dateFormatter?: string }
  // ) => {
  //   // 对应属性是需要弹出实例窗口
  //   const instanceModalApicode = ["Suppliers"];
  //   if (item.valueType === "1") {
  //     return {
  //       maxLength: item.allowLength || item.maxLength,
  //       placeholder: item.explanation || "请输入" + item.name,
  //     };
  //   } else if (item.valueType === "2") {
  //     return {
  //       autoSize: false,
  //       rows: item.fieldHeight,
  //       maxLength: item.allowLength || item.maxLength,
  //       placeholder: item.explanation || "请输入" + item.name,
  //     };
  //   } else if (item.valueType === "4") {
  //     return {
  //       placeholder: item.explanation || "请选择" + item.name,
  //       min: item.minValue,
  //       max: item.maxValue,
  //       formatter:
  //         item.displayFormat === "2"
  //           ? (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  //           : undefined,
  //       parser:
  //         item.displayFormat === "2"
  //           ? (value: any) => value.replace(/\$\s?|(,*)/g, "")
  //           : undefined,
  //       precision: item.allowDigits ? item.allowDigits : -1,
  //       style: {
  //         width: "100%",
  //       },
  //       // maxLength: item.allowLength || item.maxLength,
  //     };
  //   } else if (item.valueType === "5" && item.listType !== "2") {
  //     return {
  //       mode: item.allowMultiple ? "multiple" : undefined,
  //       showArrow: true,
  //       popoverTable: instanceModalApicode.includes(item.apicode),
  //       placeholder: item.explanation || "请选择" + item.name,
  //       options: listCodeMap[item.listCode],
  //     };
  //   } else if (item.valueType === "5" && item.listType === "2") {
  //     return {
  //       showSearch: false,
  //       placeholder: item.explanation || "请选择" + item.name,
  //       treeData: listCodeMap[item.listCode],
  //       treeCheckable: item.allowMultiple || false,
  //       virtual: false,
  //       treeCheckStrictly: item.allowMultiple || false,
  //       allowClear: true,
  //       showCheckedStrategy: "SHOW_ALL",
  //       dropdownStyle: { maxHeight: 400, overflow: "auto" },
  //     };
  //   } else if (item.valueType === "6") {
  //     return {
  //       disabledDate:
  //         item.dateRule && this.disabledDate.bind(this, item.dateRule),
  //       style: {
  //         width: "100%",
  //       },
  //       showTime: item.dateFormat == "0",
  //       format:
  //         item.dateFormat == "0"
  //           ? extra?.dateFormatter || "YYYY-MM-DD HH:mm:ss"
  //           : "YYYY-MM-DD",
  //     };
  //   } else if (item.valueType === "7") {
  //     return {
  //       disabledDate:
  //         item.dateRule && this.disabledDate.bind(this, item.dateRule),
  //       style: {
  //         width: "100%",
  //       },
  //       showTime: item.dateFormat == "0",
  //       format:
  //         item.dateFormat == "0"
  //           ? extra?.dateFormatter || "YYYY-MM-DD HH:mm:ss"
  //           : "YYYY-MM-DD",
  //     };
  //   } else if (item.valueType === "8" || item.valueType === "9") {
  //     return {
  //       fileLimitSize:
  //         item.allowFileSize &&
  //         (item.allowFileSize ? item.allowFileSize * 1024 * 1024 : undefined),
  //       allowedFileTypes:
  //         item.allowFileType &&
  //         (item.allowFileType.length !== 0 ? item.allowFileType : undefined),
  //     };
  //   } else if (item.valueType === "12" || item.valueType === "13") {
  //     return {
  //       placeholder: item.explanation,
  //       min: item.minValue,
  //       max: item.maxValue,
  //       formatter:
  //         item.displayFormat === "2"
  //           ? (value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  //           : undefined,
  //       parser:
  //         item.displayFormat === "2"
  //           ? (value: any) => value.replace(/\$\s?|(,*)/g, "")
  //           : undefined,
  //       precision: item.allowDigits ? item.allowDigits : -1,
  //       style: {
  //         width: "100%",
  //       },
  //     };
  //   }
  // };

  //生成雪花Id
  public static generateSnowId = () => {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  };

  public static uint8arrayToBase64 = function (u8Arr: any) {
    try {
      let CHUNK_SIZE = 0x8000; //arbitrary number
      let index = 0;
      let length = u8Arr.length;
      let result = "";
      let slice;
      while (index < length) {
        slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
      }
      // web image base64图片格式: "data:image/png;base64," + b64encoded;
      return "data:image/png;base64," + btoa(result);
      //  return btoa(result);
    } catch (e) {
      throw e;
    }
  };

  public static parseINIString(data: any) {
    var regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/,
      comment: /^\s*;.*$/
    };
    var value: any = {};
    var lines = data.split(/\r\n|\r|\n/);
    var section: any = null;
    lines.forEach(function (line: any) {
      if (regex.comment.test(line)) {
        return;
      } else if (regex.param.test(line)) {
        var match = line.match(regex.param);
        if (section) {
          value[section][match[1]] = match[2];
        } else {
          value[match[1]] = match[2];
        }
      } else if (regex.section.test(line)) {
        var match = line.match(regex.section);
        value[match[1]] = {};
        section = match[1];
      } else if (line.length == 0 && section) {
        section = null;
      };
    });
    return value
  }
  // 获取只读元数据
  // public static renderReadonlyItem = ({
  //   apicode,
  //   formitem,
  //   value,
  //   record,
  // }: {
  //   apicode?: string;
  //   formitem: any;
  //   value: string | any[];
  //   record?: Record<string, any>;
  // }) => {
  //   if (!formitem) {
  //     return value;
  //   }
  //   if (!formitem.type) {
  //     return '';
  //   }

  //   if (['Select', 'Cascader'].includes(formitem.type)) {
  //     // console.log(value, 'vlaues');
  //     // 多选的情况
  //     if (formitem.props.mode === 'multiple') {
  //       if (isArray(value)) {
  //         return value
  //           .map((v: any) => {
  //             return this.getLabelInOptions({
  //               value: v,
  //               options: formitem?.props.options || [],
  //             });
  //           })
  //           .join(',');
  //       } else {

  //         return value
  //           ? value
  //             .split(',')
  //             .map((v: any) => {
  //               return this.getLabelInOptions({
  //                 value: v,
  //                 options: formitem?.props.options || [],
  //               });
  //             })
  //             .join(',')
  //           : '';
  //       }
  //     } else {
  //       return this.getLabelInOptions({
  //         value,
  //         options: formitem?.props.options || [],
  //       });
  //     }
  //   } else if (['TreeSelect'].includes(formitem.type)) {
  //     // 多选的情况
  //     if (formitem.props?.treeCheckable && isArray(value)) {
  //       return value
  //         .map((v: any) => {
  //           return this.getLabelInOptions({
  //             value: typeof v !== 'string' ? v.value : v,
  //             options: formitem?.props.treeData || [],
  //           });
  //         })
  //         .join(',');
  //     } else {
  //       return this.getLabelInOptions({
  //         value,
  //         options: formitem?.props.treeData || [],
  //       });
  //     }
  //   } else if (['Date'].includes(formitem.type)) {
  //     if (value) {
  //       const isMot = moment.isMoment(value);
  //       if (isMot) {
  //         const creation = value.creationData();
  //         return value.format(formitem?.props?.format ?? (creation.format as string));
  //       } else {
  //         return moment(value).format(formitem?.props?.format ?? 'YYYY-MM-DD HH:mm:ss');
  //       }
  //     } else {
  //       return '';
  //     }
  //   } else if (['CompositeForm'].includes(formitem.type)) {
  //     if (value && typeof value === 'string') {
  //       if (String(value)?.includes('~%~')) {
  //         return `${value.split('~%~')[0] || ''}${find(formitem.props?.options, { id: value.split('~%~')[1] })?.name || ''}`;
  //       } else {
  //         return value;
  //       }
  //     }
  //     return '';
  //   } else {
  //     if (isArray(value)) {
  //       return value.join(',');
  //     } else {
  //       return value ?? '';
  //     }
  //   }
  // };
  // 转换值
  public static getLabelInOptions = (params: {
    value: string | boolean | string[];
    options: any & { label: string; value: string | boolean }[];
    adaptor?: {
      label: string;
      value: string;
      children?: string;
    };
  }) => {
    const { value, options, adaptor } = params;
    const valueType = Object.prototype.toString.call(value);

    const isValid = (value: any) => {
      return value !== '' && value !== undefined && value !== null;
    };
    if (!isValid(value)) {
      return '';
    }
    let valueLabel: any = '';
    if (valueType === '[object Array]') {
      valueLabel = [];
    }
    const fn = (childOptions: any) => {
      for (let index = 0; index < childOptions.length; index++) {
        const optionLabel = childOptions[index][adaptor ? adaptor.label : 'label'];
        const optionValue = childOptions[index][adaptor ? adaptor.value : 'value'];
        // 找到id === option.value
        if (valueType === '[object Array]') {
          //@ts-ignore
          if (value.includes(optionValue)) {
            valueLabel.push(optionLabel);
          }
        } else {
          if (value === optionValue) {
            valueLabel = optionLabel;
          }
        }

        if (childOptions[index].children && childOptions[index].children.length) {
          // 树状查找
          fn(childOptions[index].children);
        }
      }
    };
    fn(options);
    return valueLabel;
  };
}
