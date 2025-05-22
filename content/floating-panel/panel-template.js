// 📄 content/floating-panel/panel-template.js

export const panelHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h3 style="margin: 0;">📷 圖片工具箱</h3>
  </div>

  <div style="margin-top: 6px;">
    <label style="display: block; margin-bottom: 4px;">
      檔口：<input type="text" id="stall-input" style="width: 100%;" />
    </label>
    <label style="display: block; margin-bottom: 6px;">
      商品：<input type="text" id="product-input" style="width: 100%;" />
      </label>
      <button id="scrape-btn" style="margin-bottom: 8px;">擷取圖片</button>
      <button id="download-selected" style="margin-top: 10px;">⬇️ 下載選取圖片</button>
  </div>

  <div id="image-list-container" style="max-height: 320px; overflow-y: auto; border: 1px solid #ccc; padding: 6px;">
    <div id="image-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"></div>
  </div>


  <!-- 🔽 預覽區域（無 resize，改由 JS 控制） -->
  <div id="resizable-wrapper" style="
    overflow: auto;
    min-width: 320px;
    max-width: 100%;
    margin-top: 12px;
    padding: 6px;
    border: 1px solid #ccc;
  ">
    <div id="image-preview-box" style="
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      justify-content: center;
    "></div>
  </div>
`;
