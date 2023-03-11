#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod app;
use app::{ window, menu };

use tauri::{ CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem };
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

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
        .invoke_handler(
            tauri::generate_handler![
                window::greet,
                window::open_login,
                window::exist,
                window::drag_window,
            ]
        )
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| menu::menu_handle(app, event))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}