import { ListCode } from "../constant/listCode";

export class Utils {
  // 处理返回后的列表数据
  public static adaptListItems: any = (list: Record<string, any>[] = []) => {
    return (list || []).map((item: any) => {
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
}
