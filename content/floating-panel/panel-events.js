// 📄 content/floating-panel/panel-events.js

let panelRoot = null;
let panelInjected = false;

// ✅ 插入浮動面板（只有第一次會執行）
export async function insertPanel() {
  if (panelInjected) return;

  const { initFloatingPanel } = await import(
    chrome.runtime.getURL("content/floating-panel/index.js")
  );

  panelRoot = initFloatingPanel();
  if (panelRoot) {
    panelInjected = true;
    chrome.storage.local.set({ panelEnabled: true });
  }
}

// ✅ 移除浮動面板
export function removePanel() {
  try {
    panelRoot?.remove();
  } catch (e) {
    console.warn("移除面板時發生錯誤：", e);
  } finally {
    panelRoot = null;
    panelInjected = false;
    chrome.storage.local.set({ panelEnabled: false });
  }
}

// ✅ 判斷面板目前是否有插入
export function panelIsActive() {
  return panelInjected;
}
