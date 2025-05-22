// background/download-handler.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "download" && message.url) {
    chrome.downloads.download(
      {
        url: message.url,
        filename: message.filename || "image.jpg",
        conflictAction: "uniquify",
        saveAs: false,
      },
      (downloadId) => {
        if (chrome.runtime.lastError || !downloadId) {
          console.warn("❌ 下載失敗：", chrome.runtime.lastError?.message);
          sendResponse({ success: false });
        } else {
          sendResponse({ success: true });
        }
      }
    );
    return true;
  }

  if (message.action === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

// ✅ 加入 icon 點擊時，通知 content script 切換面板
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "togglePanel" });
});
