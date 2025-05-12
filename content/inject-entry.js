// 📄 content/inject-entry.js

// ✅ 解鎖右鍵事件（避免頁面禁用右鍵）
document.addEventListener("contextmenu", (e) => e.stopPropagation(), true);
["selectstart", "dragstart"].forEach((type) => {
  document.addEventListener(type, (e) => e.stopPropagation(), true);
});

// ✅ 動態匯入控制面板的模組
let panelControl = null;

async function ensurePanelControlLoaded() {
  if (!panelControl) {
    panelControl = await import(
      chrome.runtime.getURL("content/floating-panel/panel-events.js")
    );
  }
}

// ✅ 頁面載入時，根據記錄的狀態自動插入面板
chrome.storage.local.get(["panelEnabled"], async (result) => {
  if (result.panelEnabled) {
    await ensurePanelControlLoaded();
    panelControl.insertPanel();
  }
});

// ✅ 接收 background 傳來的 togglePanel 指令
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "togglePanel") {
    await ensurePanelControlLoaded();
    if (panelControl?.panelIsActive?.()) {
      panelControl.removePanel();
    } else {
      panelControl.insertPanel();
    }
  }
});
