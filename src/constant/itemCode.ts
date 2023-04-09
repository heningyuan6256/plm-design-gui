/**
 * Author: hny_147
 * Date: 2023/03/03 15:56:26
 * Description: 大类类型
 */
export enum BasicsItemCode {
    /** 物料 */
    material = "10001001",
    /** 文档 */
    document = "10001002",
    /** 变更申请 */
    changeRequest = "10001003",
    /** 变更指令 */
    changeInstruction = "10001004",
    /** 工程变更 */
    engineeringChange = "10001005",
    /** 文件 */
    file = "10001006",
    /** 问题报告 */
    problemReport = "10001007",
    /** 制造商变更 */
    manufacturerChange = "10001008",
    /** 状态变更 */
    statusChange = "10001009",
    /** 申请流程 */
    applicationProcess = "10001010",
    /** 供应商请求 */
    supplierRequest = "10001011",
    /** 制造商 */
    manufacturer = "10001012",
    /** 制造商部件 */
    manufacturerParts = "10001013",
    /** 供应商 */
    supplier = "10001014",
    /** 项目变更 */
    projectChange = "10001015",
    /** 项目 */
    project = "10001016",
    /** 用户 */
    user = "10001017",
    /** 用户组 */
    userGroup = "10001018",
    /**制造商变更 */
    manufactChange = "10001020",
}

export class ItemCode {
    /** 是否是物料 */
    public static isMaterial(code: string | number) {
        return code == BasicsItemCode.material;
    }

    /** 是否是文档 */
    public static isDocument(code: string | number) {
        return code == BasicsItemCode.document;
    }

    /** 是否是变更请求 */
    public static isChangeRequest(code: string | number) {
        return code == BasicsItemCode.changeRequest;
    }

    /** 是否是变更指令 */
    public static isChangeInstruction(code: string | number) {
        return code == BasicsItemCode.changeInstruction;
    }

    /** 是否是工程变更 */
    public static isEngineeringChange(code: string | number) {
        return code == BasicsItemCode.engineeringChange;
    }

    /** 是否是文件 */
    public static isFile(code: string | number) {
        return code == BasicsItemCode.file;
    }

    /** 是否是问题报告 */
    public static isProblemReport(code: string | number) {
        return code == BasicsItemCode.problemReport;
    }

    /** 是否是制造商变更 */
    public static isManufacturerChange(code: string | number) {
        return code == BasicsItemCode.manufacturerChange;
    }

    /** 是否是状态变更 */
    public static isStatusChange(code: string | number) {
        return code == BasicsItemCode.statusChange;
    }

    /** 是否是申请流程 */
    public static isApplicationProcess(code: string | number) {
        return code == BasicsItemCode.applicationProcess;
    }

    /** 是否是供应商请求 */
    public static isSupplierRequest(code: string | number) {
        return code == BasicsItemCode.supplierRequest;
    }

    /** 是否是制造商 */
    public static isManufacturer(code: string | number) {
        return code == BasicsItemCode.manufacturer;
    }

    /** 是否是制造商部件 */
    public static isManufacturerParts(code: string | number) {
        return code == BasicsItemCode.manufacturerParts;
    }

    /** 是否是供应商 */
    public static isSupplier(code: string | number) {
        return code == BasicsItemCode.supplier;
    }

    /** 是否是项目变更 */
    public static isProjectChange(code: string | number) {
        return code == BasicsItemCode.projectChange;
    }

    /** 是否是项目 */
    public static isProject(code: string | number) {
        return code == BasicsItemCode.project;
    }

    /** 是否是用户 */
    public static isUser(code: string | number) {
        return code == BasicsItemCode.user;
    }

    /** 是否是用户组 */
    public static isUserGroup(code: string | number) {
        return code == BasicsItemCode.userGroup;
    }

    /** 是否是制造商变更 */
    public static isManufactChange(code: string | number) {
        return code == BasicsItemCode.manufactChange;
    }
}
