# PLM-DESIGN

##### **technology stack**

1. react
2. ts
3. tailwind
4. three.js
5. tauri
6. rust

##### install dependencies

1. yarn
2. yarn start

##### run web

1. yarn dev

##### run tauri

1. yarn tauri dev

##### webview2

tauri/bundle/windows/增加
  "webviewInstallMode": {
    "type": "offlineInstaller"
  },



### Progblem
1 Failed to connect to static.crates.io port 443 after 21029 ms
切换镜像源
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
# 指定镜像
replace-with = 'ustc' # 如：tuna、sjtu、ustc，或者 rustcc
[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index"


    "updater": {
      "active": true,
      "dialog": true,
      "endpoints": ["https://heningyuan6256.github.io/install.json"],
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDg1RUQzNUQzRDNCOTQzQzAKUldUQVE3blQwelh0aGFFTzRjZEFkbnhQSXMwZ2U5R1lkZ2hDNW82QU81SGJvWVdJMC9GSnA3a3cK"
    },

   cargo.toml 增加 "devtools" 可以在生产环境打包


  # 安装出现 无法定位程序输入点processprng
  设计工具版本不能高于1.78.0

  # creo的注入程序如果在虚拟机上，可能会报错