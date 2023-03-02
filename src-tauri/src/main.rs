#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem,
    Manager,
    SystemTray,
    SystemTrayEvent,
    SystemTrayMenu,
    SystemTrayMenuItem,
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn open_login(handle: tauri::AppHandle) {
    tauri::WindowBuilder
        ::new(&handle, "Home", tauri::WindowUrl::App("/".into()))
        .inner_size(800.0, 600.0)
        .title("PLM DESIGNER")
        .center()
        .build()
        .unwrap();
}

#[tauri::command]
async fn exist(handle: tauri::AppHandle) {
    tauri::WindowBuilder
        ::new(&handle, "Login", tauri::WindowUrl::App("/login".into()))
        .inner_size(640.0, 354.0)
        .resizable(false)
        .title("登陆")
        .decorations(false)
        .center()
        .build()
        .unwrap();
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "关闭窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏窗口");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder
        ::default()
        // .invoke_handler(tauri::generate_handler![open_login])
        .invoke_handler(tauri::generate_handler![greet, open_login, exist])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| menu_handle(app, event))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn menu_handle(app_handle: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { position: _, size: _, .. } => {
            println!("鼠标-左击");
        }
        SystemTrayEvent::RightClick { position: _, size: _, .. } => {
            println!("鼠标-右击");
        }
        SystemTrayEvent::DoubleClick { position: _, size: _, .. } => {
            println!("鼠标-双击");
        }
        SystemTrayEvent::MenuItemClick { id, .. } =>
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let item_handle = app_handle.tray_handle().get_item(&id);
                    let window = app_handle.get_window("home").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                        item_handle.set_title("显示窗口").unwrap();
                    } else {
                        window.show().unwrap();
                        item_handle.set_title("隐藏窗口").unwrap();
                    }
                }
                _ => {}
            }
        _ => {}
    }
}