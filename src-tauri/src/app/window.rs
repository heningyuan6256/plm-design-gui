use tauri::{ command, AppHandle, Manager };
// 测试函数
#[command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 登陆到主页
#[command]
pub async fn open_login(handle: tauri::AppHandle) {
    tauri::WindowBuilder
        ::new(&handle, "Home", tauri::WindowUrl::App("/".into()))
        .inner_size(1440.0, 720.0)
        .title("PLM DESIGNER")
        .decorations(false)
        .center()
        .build()
        .unwrap();
}

// 打开关于界面
#[command]
pub async fn open_info(handle: tauri::AppHandle) {
    tauri::WindowBuilder
        ::new(&handle, "Info", tauri::WindowUrl::App("/info".into()))
        .inner_size(300.0, 400.0)
        .title("关于")
        // .decorations(false)
        .center()
        .build()
        .unwrap();
}


// 退出登录
#[command]
pub async fn exist(handle: tauri::AppHandle) {
    tauri::WindowBuilder
        ::new(&handle, "Login", tauri::WindowUrl::App("/login".into()))
        .inner_size(648.0, 347.0)
        .resizable(false)
        .title("登陆")
        .decorations(false)
        .center()
        .build()
        .unwrap();
}

#[command]
pub fn drag_window(app: AppHandle) {
    app.get_window("Home").unwrap().start_dragging().unwrap();
}