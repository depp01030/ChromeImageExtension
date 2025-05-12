// 📄 content/floating-panel/panel-template.js

export const panelHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0;">📷 圖片工具箱</h3>
    <button id="close-btn" title="關閉面板">✕</button>
  </div>

  <div style="margin-top: 6px;">
    <label style="display: block; margin-bottom: 4px;">
      檔口：<input type="text" id="stall-input" style="width: 100%;" />
    </label>
    <label style="display: block; margin-bottom: 6px;">
      商品：<input type="text" id="product-input" style="width: 100%;" />
    </label>
    <button id="scrape-btn" style="margin-bottom: 8px;">擷取圖片</button>
  </div>

  <div id="image-list-container" style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 6px;">
    <div id="image-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"></div>
  </div>

  <button id="download-selected" style="margin-top: 10px;">⬇️ 下載選取圖片</button>
`;
