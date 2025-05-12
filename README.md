# 資料夾結構
```
ChromeImageExtension/
├── manifest.json                    # 擴充的核心設定
├── assets/
│   └── icon.png                    # 工具列圖示
├── content/                        # 注入用內容腳本
│   ├── inject-entry.js            # 🔁 統一入口，注入 unlock + UI + 抓圖模組
│   ├── unlock-contextmenu.js      # 解除右鍵限制
│   ├── floating-panel/            # 浮動 UI 模組
│   │   ├── index.js               # 插入浮動面板的主程式
│   │   ├── panel-events.js        # 處理 UI 互動
│   │   └── panel.css              # 面板樣式
│   ├── scraper/
│   │   ├── scrape-images.js       # 擷取圖片邏輯
│   │   └── utils.js               # 解析工具、過濾、格式轉換等
├── background/
│   └── download-handler.js        # 執行圖片下載邏輯
├── options/
│   ├── options.html               # 使用者設定頁面
│   └── options.js
├── styles/
│   └── shared-vars.css            # 共用樣式變數
└── utils/
    └── storage.js                 # 封裝 chrome.storage 存取工具

```