# 多功能圖片編輯與裁切工具 / Multi-functional Image Editor and Cropper

[English](#english) | [中文](#中文)

## English

A powerful web-based image editing tool that allows you to crop, erase backgrounds, and add text to images with ease.

### Features

- **Crop Mode**
  - Multiple crop areas support
  - Custom aspect ratio
  - Lock aspect ratio option
  - Batch crop and download

- **Background Eraser Mode**
  - Custom background color
  - Adjustable opacity
  - Multiple eraser areas support

- **Text Mode**
  - Add multiple text blocks
  - Custom font selection
  - Font size and color customization
  - Text style options (bold, italic, underline)

- **Multi-language Support**
  - Switch between English and Traditional Chinese
  - Instant language switching
  - Automatic language preference saving
  - Language settings persist across sessions

### Usage

1. Click "Choose Image" to upload your image
2. Select the desired mode (Crop/Erase/Text)
3. Use the tools to edit your image
4. Download the result

### Language Settings
1. Click on the "Settings" tab
2. Select your preferred language from the language options
3. The interface will update immediately to your chosen language
4. Your language preference will be automatically saved and restored next time you visit

### Technical Requirements

- Modern web browser with JavaScript enabled
- Internet connection (for loading external libraries)
- Web browser with localStorage support
- Web server to run the application

### Dependencies

- Font Awesome 6.5.1 (for icons)
- JSZip 3.10.1 (for batch download)
- Google Fonts (Noto Sans TC)

### File Structure

```
imgediter/
├── index.html      # Main HTML file
├── styles.css      # CSS styles
├── script.js       # JavaScript functionality
├── i18n/           # Language files
│   ├── en.json    # English translations
│   └── zh-TW.json # Traditional Chinese translations
└── README.md       # This file
```

---

## 中文

一個功能強大的網頁版圖片編輯工具，讓您輕鬆裁切圖片、去除背景並添加文字。

### 功能特點

- **裁切模式**
  - 支援多個裁切區域
  - 自訂長寬比例
  - 鎖定比例選項
  - 批次裁切並下載

- **去背模式**
  - 自訂背景顏色
  - 可調整透明度
  - 支援多個去背區域

- **文字模式**
  - 可添加多個文字區塊
  - 自訂字體選擇
  - 字體大小和顏色自訂
  - 文字樣式選項（粗體、斜體、底線）

- **多語系支援**
  - 可切換繁體中文和英文介面
  - 即時語言切換
  - 自動儲存語言偏好設定
  - 語言設定會在下次造訪時自動套用

### 使用方法

1. 點擊「選擇圖片」上傳您的圖片
2. 選擇需要的模式（裁切/去背/文字）
3. 使用工具編輯圖片
4. 下載結果

### 語言設定
1. 點擊「設定」標籤
2. 從語言選項中選擇偏好的語言
3. 介面會立即更新為選擇的語言
4. 您的語言偏好設定會自動儲存，下次造訪時會自動套用

### 技術需求

- 支援 JavaScript 的現代網頁瀏覽器
- 網路連線（用於載入外部函式庫）
- 支援 localStorage 的網頁瀏覽器
- 網頁伺服器來運行應用程式

### 相依套件

- Font Awesome 6.5.1（用於圖示）
- JSZip 3.10.1（用於批次下載）
- Google Fonts（思源黑體）

### 檔案結構

```
imgediter/
├── index.html      # 主要 HTML 檔案
├── styles.css      # CSS 樣式
├── script.js       # JavaScript 功能
├── i18n/           # 語系檔案
│   ├── en.json    # 英文翻譯
│   └── zh-TW.json # 繁體中文翻譯
└── README.md       # 本文件
```
