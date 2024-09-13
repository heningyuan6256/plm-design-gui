use tauri::command;
extern crate libloading;

// 测试lib
#[command]
pub fn call_dynamic() -> i32 {
    unsafe {
        // 调用 test 函数，获取整数结果
        let result: i32 = test().expect("Failed to load function from DLL");
        result
    }
}

fn test() -> Result<i32, libloading::Error> {
    unsafe {
        // 加载 DLL 文件
        let lib = libloading::Library::new("lib/SolidWorks_ADDIN/PLMDesignFusion.dll")?;
        println!("123");
        // 获取导出函数的符号
        let func: libloading::Symbol<unsafe extern fn() -> i32> = lib.get(b"add1")?;
        println!("456");
        // 调用函数，返回整数
        Ok(func())
    }
}
