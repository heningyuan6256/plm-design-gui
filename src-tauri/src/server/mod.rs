mod handlers;

use std::{sync::Mutex};

use actix_web::{middleware, web, App, HttpServer};
use std::net::{TcpListener, IpAddr};
use tauri::AppHandle;

struct TauriAppState {
    app: Mutex<AppHandle>,
}

#[actix_web::main]
pub async fn init(app: AppHandle) -> std::io::Result<()> {
    let listener = TcpListener::bind("0.0.0.0:0")?; // 临时绑定一个端口
    let local_ip = listener.local_addr()?.ip(); // 获取本地 IP
    let tauri_app = web::Data::new(TauriAppState {
        app: Mutex::new(app),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(tauri_app.clone())
            .wrap(middleware::Logger::default())
            .service(handlers::solidworks::handle_pdf)
            .service(handlers::solidworks::handle_ostep)
    })
    .bind((local_ip, 14875))?
    .run()
    .await
}