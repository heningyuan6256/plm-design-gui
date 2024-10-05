import { createDir, exists, readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { homeDir } from "@tauri-apps/api/path";
import { BasicConfig } from "../../constant/config";
import { omit } from "lodash";
import { JsonToIni } from "../ini";


export interface LocationItemStruct {
    /**
     * 实例ID
     */
    insId:string,
    /**
     * 文件名称
     */
    fileName: string,
    /**
     * 文件本地位置
     */
    location:string,
    /**
     * 当前本地文件的版次
     */
    revision: string,
    /**
     * 最后一次修改的时间
     */
    lastModified: string 
}

/**
 * 记录下次下载文件，本地的文件缓存位置
 */
class RecLocation {
    public static judgeLoationDirExist = async () => {
        const homeDirPath = await homeDir();
        const path = `${homeDirPath}${BasicConfig.APPCacheFolder}/${BasicConfig.Location}`
        const judgeExist = await exists(path);
        if (!judgeExist) {
           await createDir(path)
        }
        return path
    }

    /**
     * 更新记录
     */
    // public static updateLocation  = async (params: LocationItemStruct) => {
    //     // const dir = await RecLocation.judgeLoationDirExist()
    //     // 查询目录下面是否有需要下载的文件
    //     // const entryList = await readDir(dir, { recursive: false })
    //     // const finded = entryList.find(item => item.name == params.insId)
    //     // if(finded){
    //     await RecLocation.modefiedLocation(params)
    //     // } else {
    //     //    await RecLocation.recordLocation(params)
    //     // }
    // }


    /**
     * 更新记录
     */
    public static modefiedLocation = async (params: LocationItemStruct) => {
        const dir = await RecLocation.judgeLoationDirExist()
        const iniData = JsonToIni({[params.fileName]:omit(params, ['fileName'])})
        await writeTextFile(`${dir}\\${params.insId}`, iniData)
    }
    // /**
    //  * 修改记录
    //  */
    // public static modefiedLocation = async (params: LocationItemStruct) => {
    //     const dir = await RecLocation.judgeLoationDirExist()
    //     const iniPath = `${dir}\\${params.insId}`
    //     const text = await readTextFile(iniPath)
    //     const iniData = InitToJson(text)
    //     iniData[params.fileName] = omit(params, ['fileName'])
    // }
}

export default RecLocation