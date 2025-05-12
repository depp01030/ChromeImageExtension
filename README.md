my-extension/
├── manifest.json
├── background.js (或 .ts)
├── content/
│   └── unlock-right-click.js      # 注入解除右鍵限制
│   └── scrape-images.js           # 注入爬圖邏輯
├── ui/
│   ├── popup.html                 # 擴充 icon 點開的 UI
│   ├── popup.js
│   ├── popup.css
│   └── image-preview-card.js     # 單張圖卡元件（可複用）
├── options/
│   ├── options.html               # 使用者設定儲存資料夾的頁面
│   ├── options.js
│   └── options.css
├── assets/                       # UI 用圖示
│   └── icon.png
└── utils/
    └── downloader.js             # 負責下載邏輯
