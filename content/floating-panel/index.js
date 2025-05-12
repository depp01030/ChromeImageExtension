// 📄 content/floating-panel/index.js

import { panelHTML } from "./panel-template.js";
import { bindPanelEvents } from "./panel-ui-events.js";

/**
 * 初始化並插入浮動面板
 * - 建立 #floating-panel-host 並掛上 Shadow DOM
 * - 插入面板 HTML 結構
 * - 綁定內部功能按鈕事件
 * 
 * @returns {HTMLElement|null} 面板 host 元素，若已存在則回傳 null
 */
export function initFloatingPanel() {
  if (document.getElementById("floating-panel-host")) return null;

  const host = document.createElement("div");
  host.id = "floating-panel-host";
  Object.assign(host.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: "999999"
  });

  const shadowRoot = host.attachShadow({ mode: "open" });

  const panel = document.createElement("div");
  panel.id = "floating-panel";
  panel.innerHTML = panelHTML;

  bindPanelEvents(panel, host, shadowRoot);

  document.body.appendChild(host);
  return host;
}
