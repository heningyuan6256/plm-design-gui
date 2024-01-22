#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app;
mod config;
use app::{menu, solidworks, window};
use config::utils;
use tauri::Manager;

// use tauri::api::process::{Command, CommandEvent};
// // extern crate libloading;

use tauri::{utils::config::AppUrl, WindowUrl};
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[cfg(debug_assertions)]
const USE_LOCALHOST_SERVER: bool = false;
#[cfg(not(debug_assertions))]
const USE_LOCALHOST_SERVER: bool = true;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

fn main() {
    // let _a = call_dynamic();
    let quit = CustomMenuItem::new("quit".to_string(), "关闭窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏窗口");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    // `new_sidecar()` expects just the filename, NOT the whole path like in JavaScript
    // let (mut rx, mut child) = Command::new_sidecar("OnChain_DesignFusion")
    // .expect("failed to create `my-sidecar` binary command")
    // .args(["-t", "solidworks", "-m", "createcube", "-o", "aaa"])
    // .spawn()
    // .expect("Failed to spawn sidecar");

    // tauri::async_runtime::spawn(async move {
    // // read events such as stdout
    // while let Some(event) = rx.recv().await {
    //     // if let CommandEvent::Stdout(line) = event {
    //     //     println!("{}", line);
    //     //     // window
    //     //     //     .emit("message", Some(format!("'{}'", line)))
    //     //     //     .expect("failed to emit event");
    //     //     // // write to stdin
    //     //     child.write("message from Rust\n".as_bytes()).unwrap();
    //     // }
    //     if let CommandEvent::Error(line) = event {
    //         println!("{}", line);
    //         // window
    //         //     .emit("message", Some(format!("'{}'", line)))
    //         //     .expect("failed to emit event");
    //         // // write to stdin
    //         child.write("message from Rust\n".as_bytes()).unwrap();
    //     }
    // }

    // while let Some(event) = rx.recv().await {
    //     if let CommandEvent::Stdout(line) = event {
    //         println!("{}", line);
    //         // window
    //         //     .emit("message", Some(format!("'{}'", line)))
    //         //     .expect("failed to emit event");
    //         // // write to stdin
    //         child.write("message from Rust\n".as_bytes()).unwrap();
    //     }
    //     // if let CommandEvent::Error(line) = event {
    //     //     println!("{}", line);
    //     //     // window
    //     //     //     .emit("message", Some(format!("'{}'", line)))
    //     //     //     .expect("failed to emit event");
    //     //     // // write to stdin
    //     //     child.write("message from Rust\n".as_bytes()).unwrap();
    //     // }
    // }
    // });
    let port = 1420;

    let window_url = if USE_LOCALHOST_SERVER {
        WindowUrl::External(format!("http://localhost:{}", port).parse().unwrap())
    } else {
        WindowUrl::App("index.html".into())
    };

    let mut context = tauri::generate_context!();
    let mut builder = tauri::Builder::default();

    if USE_LOCALHOST_SERVER {
        // rewrite the config so the IPC is enabled on this URL
        context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());
        context.config_mut().build.dev_path = AppUrl::Url(window_url.clone());
        builder = builder
            .plugin(tauri_plugin_localhost::Builder::new(port).build())
            .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
                println!("{}, {argv:?}, {cwd}", app.package_info().name);

                // app.emit_all("single-instance", Payload { args: argv, cwd })
                //     .unwrap();
            }));
    }

    tauri_plugin_deep_link::prepare("com.ONCHAIN.build");

    builder
        // .setup(move |app| {
        //     WindowBuilder::new(app, "main".to_string(), window_url)
        //       .title("Localhost Example")
        //       .build()?;
        //     Ok(())
        //   })
        // .invoke_handler(tauri::generate_handler![open_login])
        .invoke_handler(tauri::generate_handler![
            window::greet,
            // window::is_window_maximized,
            window::open_login,
            window::exist,
            window::drag_window,
            window::open_info,
            window::open_attr_map,
            window::open_home,
            window::open_stock,
            window::open_active,
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
            solidworks::call_dynamic // utils::get_data
        ])
        .setup(|app| {
            let handle = app.handle();
            utils::set_window_shadow()
            tauri_plugin_deep_link::register("onchain", move |request| {
                dbg!(&request); // 调用的时候会在控制台打印
                                // 将参数传递到前端，前端使用listen监听
                handle.emit_all("onchain", request).unwrap();
                // 但是经过尝试，我只能在应用已经打开的时候获取到传递的参数，大概率是因为第一次发送的时候，前端的监听事件还没有开启，插件的作者正在添加新的API:get_last_url实现
            })
            .unwrap();
            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(2) {
                // app.emit_all("test", url).unwrap();
            }
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| menu::menu_handle(app, event))
        .run(context)
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
