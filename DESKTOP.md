# 离线桌面版

本项目使用同一套页面和资源构建网站版、macOS 桌面版、Windows 桌面版。桌面版不需要启动开发服务器。模型库、预览贴图、教程、插件及英中日名称数据随安装包提供，网络请求被离线页面策略限制。

## 构建

安装 Node.js 22+、Rust stable 和平台开发工具，然后执行 `npm ci`。

- macOS 通用版：安装 Xcode，执行 `rustup target add aarch64-apple-darwin x86_64-apple-darwin`，再执行 `npm run desktop:build:macos -- --ci`。
- Windows x64：安装 Visual Studio C++ Build Tools 和 Rust MSVC 工具链，执行 `npm run desktop:build:windows -- --ci`。
- 在 Apple Silicon Mac 上交叉构建 Windows：安装 rustup、LLVM、LLD、NSIS，执行 `rustup target add x86_64-pc-windows-msvc` 和 `cargo install --locked cargo-xwin --root .build-tools`，再执行同一个 Windows 构建命令。脚本自动选择 cargo-xwin。首次构建会下载 Microsoft SDK 和 WebView2 离线安装器。

下载依赖的构建过程需要联网；安装好的应用离线运行。Windows 安装包使用 NSIS，内置完整 WebView2 离线安装器，安装时无需下载组件。

Windows 使用与 Tauri CLI 2.11.5 对应的官方安装器模板，仅把资源压缩改为逐文件模式，避免包含 WebView2 后超过 2GiB 的原始数据在 macOS 上触发整块压缩崩溃。更新 Tauri CLI 时应同步检查该模板。

## 输出

- macOS：`src-tauri/target/universal-apple-darwin/release/bundle/dmg/` 中的 DMG，和 `bundle/macos/` 中的应用。
- Windows：`src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/` 中的 setup.exe。

macOS 版本包含 arm64 和 x86_64 两种架构。Windows 首版为 x64，目标 Windows 10/11。两者都包含约 2GB 的离线资源，安装时请预留足够空间。

下载插件、模型 ZIP 或自定义 T 恤贴图时，会弹出系统保存窗口，允许选择文件名和保存位置。取消后不写入文件；保存到已有文件时由系统确认是否替换。

## 验证

执行 `npm test` 检查离线页面、资源映射、语言数据、Windows 离线安装配置和 ZIP 保存路径。执行 `cargo test --manifest-path src-tauri/Cargo.toml --lib` 检查资源路径、视频范围请求及下载文件处理。最终还需在目标系统检查界面、三维预览、语言切换、模型下载和墨水颜色工具。

## 已知限制

Character Creator 的原下载地址已失效，仓库中没有 `add-ons/character.zip`。离线版会禁用该下载按钮；加入有效 ZIP 后重新构建即可启用。Discord 和外部文档入口在离线版本中不可用。

当前构建没有发行者证书签名或 Apple 公证。正式对外发行时应补充签名。

## 本地恢复记录

桌面源码和离线配置根据聊天 `01a0eb07-f528-7610-a985-31e603025b2c` 的修改记录恢复到本地，并补充 Windows 配置、T 恤贴图路径修正和原生 ZIP 保存。未复制远端构建缓存或旧安装包。
