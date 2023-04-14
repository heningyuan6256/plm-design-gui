use tauri::{ command };
extern crate libloading;
// 测试lib
#[command]
pub fn call_dynamic() -> &'static str {
    let result: &'static str = test().unwrap();
    // let str_num: String = result.to_string();
    println!("{}", result);
    return result;
}

fn test() -> Result<&'static str, libloading::Error> {
    unsafe {
        let lib = libloading::Library::new("lib/libmyfirst_rust_dll.dylib")?;
        let func: libloading::Symbol<unsafe extern fn() -> &'static str> = lib.get(b"hello_rust")?;
        Ok(func())
    }
}