#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod app;
mod config;
use app::{ window, menu };
use config::{ utils };

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
                // window::is_window_maximized,
                window::open_login,
                window::exist,
                window::drag_window,
                window::open_info,
                // utils::create_chatgpt_prompts,
                // utils::silent_install,
                // utils::run_check_update,
                utils::gen_cmd,
                utils::init,
                // utils::prompt_for_install,
                utils::chat_root,
                utils::get_tauri_conf,
                utils::exists,
                // utils::create_file,
                // utils::create_chatgpt_prompts,
                // utils::script_path,
                // utils::user_script,
                utils::open_file,
                // utils::clear_conf,
                // utils::merge,
                utils::gen_cmd,
                // utils::get_data

            ]
        )
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| menu::menu_handle(app, event))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// #[tauri::command]
// fn get_active_document() -> Result<String, String> {
//     let sw_app = match sw_app::get_active_app() {
//         Ok(app) => app,
//         Err(e) => return Err(format!("Failed to get SolidWorks app: {}", e)),
//     };
//     let doc = match sw_app.get_active_doc() {
//         Ok(doc) => doc,
//         Err(e) => return Err(format!("Failed to get active document: {}", e)),
//     };
//     let name = match doc.get_name() {
//         Ok(name) => name,
//         Err(e) => return Err(format!("Failed to get document name: {}", e)),
//     };
//     Ok(name)
// }