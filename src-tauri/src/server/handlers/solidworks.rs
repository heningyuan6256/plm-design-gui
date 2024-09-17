use actix_web::{post, web, HttpResponse};
use tauri::api::process::Command;
use tauri::async_runtime::spawn;
use std::path::{Path, PathBuf};
use actix_web::http::header::{ContentDisposition, DispositionType, DispositionParam, ExtendedValue, Charset};
use std::fs::File;
use std::io::Read;
use urlencoding;


#[derive(serde::Deserialize)]
pub struct FilePaths {
    paths: Vec<String>,
}

#[post("/api/transformSlddrwToPDF")]
pub async fn handle_pdf(paths: web::Json<FilePaths>) -> actix_web::Result<HttpResponse> {
    let mut converted_paths = vec![];

    for path_str in &paths.paths {
        // 将路径字符串转换为 Path 对象
        let path = Path::new(path_str);

        // 获取文件名并替换后缀为 PDF
        if let Some(stem) = path.file_stem() {
            let new_file_name = format!("{}.pdf", stem.to_string_lossy());
            let new_path = path.with_file_name(new_file_name);
            converted_paths.push(new_path.to_string_lossy().to_string());

            // 这里可以调用命令行工具或其他逻辑进行文件转换
            let output = Command::new_sidecar("swextension")
                .expect("failed to create `my-sidecar` binary command")
                .args(["-pdf", path_str]) // 这里使用原始文件路径作为参数
                .output()
                .expect("Failed to spawn sidecar");

            // let cmd_evt = rx.recv().await.unwrap();

            spawn(async move {
                // 异步读取标准输出等事件
            });

            // 假设文件转换已经完成
            if new_path.exists() {
                // 使用标准库打开文件
                let mut file = File::open(&new_path).map_err(|_| actix_web::error::ErrorNotFound("File not found"))?;
                let mut buffer = Vec::new();
                
                // 读取文件内容
                file.read_to_end(&mut buffer).map_err(|_| actix_web::error::ErrorInternalServerError("Error reading file"))?;
                
                // 返回 PDF 文件流
                return Ok(HttpResponse::Ok()
                    .content_type("application/pdf")
                    .body(buffer));
            } else {
                return Err(actix_web::error::ErrorNotFound("Converted PDF not found"));
            }
        }
    }

    Err(actix_web::error::ErrorBadRequest("Invalid input"))
}


#[post("/api/transformSlddrwToOstep")]
pub async fn handle_ostep(paths: web::Json<FilePaths>) -> actix_web::Result<HttpResponse> {
    let mut converted_paths = vec![];

    for path_str in &paths.paths {
        // 将路径字符串转换为 Path 对象
        let path = Path::new(path_str);

        // 获取文件名并替换后缀为 PDF
        if let Some(stem) = path.file_stem() {
            let new_file_name = format!("{}.step", stem.to_string_lossy());
            let new_path = path.with_file_name(new_file_name);
            converted_paths.push(new_path.to_string_lossy().to_string());

            // 这里可以调用命令行工具或其他逻辑进行文件转换
            let output = Command::new_sidecar("swextension")
                .expect("failed to create `my-sidecar` binary command")
                .args(["-ostep", path_str]) // 这里使用原始文件路径作为参数
                .output()
                .expect("Failed to spawn sidecar");

            // let cmd_evt = rx.recv().await.unwrap();

            spawn(async move {
                // 异步读取标准输出等事件
            });

            // 假设文件转换已经完成
            if new_path.exists() {
                // 使用标准库打开文件
                let mut file = File::open(&new_path).map_err(|_| actix_web::error::ErrorNotFound("File not found"))?;
                let mut buffer = Vec::new();
                
                // 读取文件内容
                file.read_to_end(&mut buffer).map_err(|_| actix_web::error::ErrorInternalServerError("Error reading file"))?;
                let file_name = new_path.file_name().unwrap().to_string_lossy();

                let original = ContentDisposition {
                    disposition: DispositionType::Attachment, // 作为附件下载
                    parameters: vec![DispositionParam::FilenameExt(ExtendedValue {
                        charset:  Charset::Us_Ascii,
                        language_tag: None,
                        value: file_name.into_owned().into_bytes(),
                    })],
                }.to_string();

                  // 找到 `=` 符号的位置
                let eq_pos = original.find("filename*=").unwrap();
                let part_before_eq = &original[..eq_pos + "filename*=".len()]; // 包括 `filename*=`
                let part_after_eq = &original[eq_pos + "filename*=".len()..]; // 之后的部分

                let quoted = format!("{}\"{}\"", part_before_eq, part_after_eq);
                

                // 返回 PDF 文件流
                return Ok(HttpResponse::Ok()
                    .content_type("application/octet-stream;")
                    .header(
                        "Content-Disposition",
                        quoted.to_string().replace("\'", "").replace("*", "").replace("US-ASCII", "")
                    )
                    .body(buffer));
            } else {
                return Err(actix_web::error::ErrorNotFound("Converted STEP not found"));
            }
        }
    }

    Err(actix_web::error::ErrorBadRequest("Invalid input"))
}
