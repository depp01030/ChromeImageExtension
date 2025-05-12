// options/options.js
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("root-input");
    const status = document.getElementById("status");
  
    chrome.storage.sync.get(["defaultRoot"], (result) => {
      if (result.defaultRoot) {
        input.value = result.defaultRoot;
      }
    });
  
    document.getElementById("save-btn").addEventListener("click", () => {
      const newRoot = input.value.trim();
      chrome.storage.sync.set({ defaultRoot: newRoot }, () => {
        status.textContent = "✅ 設定已儲存";
        setTimeout(() => (status.textContent = ""), 1500);
      });
    });
  });
  