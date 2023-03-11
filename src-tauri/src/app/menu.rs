// 菜单

use tauri::{ Manager, SystemTrayEvent, command };

// 菜单点击事件
#[command]
pub fn menu_handle(app_handle: &tauri::AppHandle, event: SystemTrayEvent) {
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