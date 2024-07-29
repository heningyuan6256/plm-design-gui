use anyhow::Result;
use log::info;
use regex::Regex;
use tauri::Runtime;
// use serde_json::Value;
use std::{
    // collections::HashMap,
    fs::{ self, File },
    path::{ Path, PathBuf },
    process::Command,
};
// use tauri::updater::UpdateResponse;
use tauri::{ utils::config::Config };
// AppHandle, Manager, Wry
use tauri::Manager;
use tauri::{ command };

use window_shadows::set_shadow;
use opener;

use base64::Engine;
use base64::engine::general_purpose;


use ptr::null;
use winapi::um::shellapi::{SHFILEINFOW, SHGetFileInfoW};
use winapi::um::shellapi::SHGFI_ICON;
use winapi::um::shellapi::SHGFI_LARGEICON;
use winapi::um::winuser::{DestroyIcon, GetIconInfo, GetUserObjectSecurity, ICONINFO};
use winapi::um::wingdi::{BITMAP, BITMAPINFO, BITMAPINFOHEADER, DIB_RGB_COLORS, GetDIBits, GetObjectW, RGBQUAD};
use widestring::U16CString;
use std::{ptr, result};
use std::collections::HashMap;
use std::io::Write;
use std::sync::Mutex;
use image::{ImageBuffer, ImageEncoder, Rgba};
use image::codecs::png::PngEncoder;

pub fn get_icon(file_path: &str) -> Result<Vec<u8>,i32> {
    let file_path = file_path.replace("/", "\\");
    let file_path_u16 = U16CString::from_str(file_path.clone()).unwrap();
    
    let mut shfileinfo = SHFILEINFOW {
        hIcon: ptr::null_mut(),
        iIcon: 0,
        dwAttributes: 0,
        szDisplayName: [0; 260],
        szTypeName: [0; 80],
    };
    
    unsafe {
        let result = SHGetFileInfoW(
            file_path_u16.as_ptr(),
            0,
            &mut shfileinfo,
            std::mem::size_of::<SHFILEINFOW>() as u32,
            SHGFI_ICON | SHGFI_LARGEICON,
        );

        if shfileinfo.hIcon.is_null() { return Err(0); }
        
        let mut icon_info: ICONINFO = std::mem::zeroed();
        if GetIconInfo(shfileinfo.hIcon, &mut icon_info) == 0 {return Err(0); }
        let mut bitmap: BITMAP = std::mem::zeroed();
        GetObjectW(
            icon_info.hbmColor as *mut _,
            std::mem::size_of::<BITMAP>() as i32,
            &mut bitmap as *mut _ as *mut _,
        );

        let hdc = winapi::um::wingdi::CreateCompatibleDC(ptr::null_mut());
        if hdc.is_null() {
            println!("CreateCompatibleDC 함수 호출에 실패했습니다.");
            return Err(0);
        }

        let mut bmi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: bitmap.bmWidth,
                biHeight: -bitmap.bmHeight,
                biPlanes: 1,
                biBitCount: bitmap.bmBitsPixel,
                biCompression: 0,
                biSizeImage: 0,
                biXPelsPerMeter: 0,
                biYPelsPerMeter: 0,
                biClrUsed: 0,
                biClrImportant: 0,
            },
            bmiColors: [RGBQUAD{
                rgbBlue: 0,
                rgbGreen: 0,
                rgbRed: 0,
                rgbReserved: 0,
            }; 1],
        };

        let bits_size = ((bitmap.bmWidth * bitmap.bmBitsPixel as i32 + 31) / 32) * 4 * bitmap.bmHeight;
        let mut bits: Vec<u8> = vec![0; bits_size as usize];

        let scanlines_copied = GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            bitmap.bmHeight as u32,
            bits.as_mut_ptr() as *mut _,
            &mut bmi,
            DIB_RGB_COLORS,
        );

        winapi::um::wingdi::DeleteDC(hdc);
        
        // 비트맵 데이터를 RGBA 형식으로 변환하여 이미지 버퍼로 저장
        let mut image_buffer: ImageBuffer<Rgba<u8>, Vec<u8>> =
            ImageBuffer::new(bitmap.bmWidth as u32, bitmap.bmHeight as u32);

        let pixel_size = (bitmap.bmBitsPixel / 8) as usize;
        for y in 0..bitmap.bmHeight {
            for x in 0..bitmap.bmWidth {
                let offset = (y * bitmap.bmWidth + x) as usize * pixel_size;
                let pixel = if pixel_size == 4 {
                    // ARGB 형식인 경우
                    Rgba([
                        bits[offset + 2], // Red
                        bits[offset + 1], // Green
                        bits[offset],     // Blue
                        bits[offset + 3], // Alpha
                    ])
                } else {
                    // 다른 형식인 경우 (예: RGB)
                    Rgba([
                        bits[offset + 2], // Red
                        bits[offset + 1], // Green
                        bits[offset],     // Blue
                        255,              // Alpha (불투명)
                    ])
                };
                image_buffer.put_pixel(x as u32, y as u32, pixel);
            }
        }

        DestroyIcon(shfileinfo.hIcon);
        let mut png_data: Vec<u8> = Vec::new();
        // 이미지 파일로 저장
         PngEncoder::new(&mut png_data)
            .write_image(&image_buffer, bitmap.bmWidth as u32, bitmap.bmHeight as u32, image::ColorType::Rgba8)
            .unwrap();
        
        Ok(png_data)
    }
}

#[command]
pub fn get_icons(req:Vec<String>) -> Result<HashMap<String,String>,String> {
    let mut res: HashMap<String, String> = HashMap::new();
    for req_item in req {
        let icon = match get_icon(&req_item) {
            Ok(icon) => icon,
            Err(_) => continue
        };
        // icon vectors to base64
        res.insert(req_item.clone(),general_purpose::STANDARD.encode(&icon));
    }
    Ok(res)
}


#[command]
pub fn open_designer(path: &str){
    opener::open(path).map_err(|e| format!("Failed to open path: {}", e));
}

#[command]
pub fn reveal_file(path: &str){
    // opener::reveal(path).map_err(|e| format!("Failed to reveal path: {}", e));
}

pub fn set_window_shadow<R: Runtime>(app: &tauri::App<R>) {
    let window = app.get_window("Login").unwrap();
    set_shadow(&window, true).expect("Unsupported platform!");
}

#[command]
pub fn chat_root() -> PathBuf {
    tauri::api::path::home_dir().unwrap().join(".onChain")
}

#[command]
pub fn set_window_home_shadow(handle: tauri::AppHandle) {
    let window = handle.get_window("Home").unwrap();
    set_shadow(&window, true).expect("Unsupported platform!");
}


#[command]
pub fn init() -> bool {
    let conf_file = chat_root().join("onChain.conf.json");
    if !exists(&conf_file) {
        create_file(&conf_file).unwrap();
    }
    return exists(&conf_file);
}

#[command]
pub fn get_tauri_conf() -> Option<Config> {
    let config_file = include_str!("../../tauri.conf.json");
    let config: Config = serde_json
        ::from_str(config_file)
        .expect("failed to parse tauri.conf.json");
    Some(config)
}

#[command]
pub fn exists(path: &Path) -> bool {
    Path::new(path).exists()
}

#[command]
pub fn create_file(path: &Path) -> Result<File> {
    if let Some(p) = path.parent() {
        fs::create_dir_all(p)?;
    }
    File::create(path).map_err(Into::into)
}

// #[command]
// pub fn user_script() -> String {
//     let user_script_content = fs::read_to_string(script_path()).unwrap_or_else(|_| "".to_string());
//     format!(
//         "window.addEventListener('DOMContentLoaded', function() {{\n{}\n}})",
//         user_script_content
//     )
// }

#[command]
pub fn open_file(path: PathBuf) {
    info!("open_file: {}", path.to_string_lossy());
    #[cfg(target_os = "macos")]
    Command::new("open").arg("-R").arg(path).spawn().unwrap();

    #[cfg(target_os = "windows")]
    Command::new("explorer").arg("/select,").arg(path).spawn().unwrap();

    // https://askubuntu.com/a/31071
    #[cfg(target_os = "linux")]
    Command::new("xdg-open").arg(path).spawn().unwrap();
}

// #[command]
// pub fn clear_conf(app: &tauri::AppHandle) {
//     let root = chat_root();
//     let app2 = app.clone();
//     let msg = format!("Path: {}\nAre you sure to clear all onChain configurations? Please backup in advance if necessary!", root.to_string_lossy());
//     tauri::api::dialog::ask(
//         app.get_window("core").as_ref(),
//         "Clear Config",
//         msg,
//         move |is_ok| {
//             if is_ok {
//                 fs::remove_dir_all(root).unwrap();
//                 tauri::api::process::restart(&app2.env());
//             }
//         },
//     );
// }

// #[command]
// pub fn merge(v: &Value, fields: &HashMap<String, Value>) -> Value {
//     match v {
//         Value::Object(m) => {
//             let mut m = m.clone();
//             for (k, v) in fields {
//                 m.insert(k.clone(), v.clone());
//             }
//             Value::Object(m)
//         }
//         v => v.clone(),
//     }
// }

#[command]
pub fn gen_cmd(name: String) -> String {
    let re = Regex::new(r"[^a-zA-Z0-9]").unwrap();
    re.replace_all(&name, "_").to_lowercase()
}

// #[command]
// pub async fn get_data(
//     url: &str,
//     app: Option<&tauri::AppHandle>,
// ) -> Result<Option<String>, reqwest::Error> {
//     let res = reqwest::get(url).await?;
//     let is_ok = res.status() == 200;
//     let body = res.text().await?;

//     if is_ok {
//         Ok(Some(body))
//     } else {
//         info!("onChain_http_error: {}", body);
//         if let Some(v) = app {
//             tauri::api::dialog::message(v.get_window("core").as_ref(), "onChain HTTP", body);
//         }
//         Ok(None)
//     }
// }

// #[command]
// pub fn run_check_update(app: AppHandle<Wry>, silent: bool, has_msg: Option<bool>) {
//     info!("run_check_update: silent={} has_msg={:?}", silent, has_msg);
//     tauri::async_runtime::spawn(async move {
//         let result = app.updater().check().await;
//         let update_resp = result.unwrap();
//         if update_resp.is_update_available() {
//             if silent {
//                 tauri::async_runtime::spawn(async move {
//                     silent_install(app, update_resp).await.unwrap();
//                 });
//             } else {
//                 tauri::async_runtime::spawn(async move {
//                     prompt_for_install(app, update_resp).await.unwrap();
//                 });
//             }
//         } else if let Some(v) = has_msg {
//             if v {
//                 tauri::api::dialog::message(
//                     app.app_handle().get_window("core").as_ref(),
//                     "onChain",
//                     "Your onChain is up to date",
//                 );
//             }
//         }
//     });
// }

// Copy private api in tauri/updater/mod.rs. TODO: refactor to public api
// Prompt a dialog asking if the user want to install the new version
// Maybe we should add an option to customize it in future versions.
// #[command]
// pub async fn prompt_for_install(app: AppHandle<Wry>, update: UpdateResponse<Wry>) -> Result<()> {
//     info!("prompt_for_install");
//     let windows = app.windows();
//     let parent_window = windows.values().next();
//     let package_info = app.package_info().clone();

//     let body = update.body().unwrap();
//     // todo(lemarier): We should review this and make sure we have
//     // something more conventional.
//     let should_install = tauri::api::dialog::blocking::ask(
//         parent_window,
//         format!(r#"A new version of {} is available! "#, package_info.name),
//         format!(
//             r#"{} {} is now available -- you have {}.

// Would you like to install it now?

// Release Notes:
// {}"#,
//             package_info.name,
//             update.latest_version(),
//             package_info.version,
//             body
//         ),
//     );

//     if should_install {
//         // Launch updater download process
//         // macOS we display the `Ready to restart dialog` asking to restart
//         // Windows is closing the current App and launch the downloaded MSI when ready (the process stop here)
//         // Linux we replace the AppImage by launching a new install, it start a new AppImage instance, so we're closing the previous. (the process stop here)
//         update.download_and_install().await?;

//         // Ask user if we need to restart the application
//         let should_exit = tauri::api::dialog::blocking::ask(
//             parent_window,
//             "Ready to Restart",
//             "The installation was successful, do you want to restart the application now?",
//         );
//         if should_exit {
//             app.restart();
//         }
//     }

//     Ok(())
// }

// #[command]
// pub async fn silent_install(app: AppHandle<Wry>, update: UpdateResponse<Wry>) -> Result<()> {
//     info!("silent_install");
//     let windows = app.windows();
//     let parent_window = windows.values().next();

//     // Launch updater download process
//     // macOS we display the `Ready to restart dialog` asking to restart
//     // Windows is closing the current App and launch the downloaded MSI when ready (the process stop here)
//     // Linux we replace the AppImage by launching a new install, it start a new AppImage instance, so we're closing the previous. (the process stop here)
//     update.download_and_install().await?;

//     // Ask user if we need to restart the application
//     let should_exit = tauri::api::dialog::blocking::ask(
//         parent_window,
//         "Ready to Restart",
//         "The silent installation was successful, do you want to restart the application now?",
//     );
//     if should_exit {
//         app.restart();
//     }

//     Ok(())
// }