import { panelHTML } from "./panel-template.js";

const selectedSet = new Set();
let defaultRoot = "";
window.lastSelected = null;

chrome.storage.sync.get(["defaultRoot"], (result) => {
  if (result.defaultRoot) defaultRoot = result.defaultRoot;
});

// ✅ 工具函式
function toggleItem(el) {
  const url = el.dataset.url;
  const isSelected = selectedSet.has(url);
  el.style.border = isSelected ? "2px solid transparent" : "2px solid #007aff";
  isSelected ? selectedSet.delete(url) : selectedSet.add(url);
}

function selectItem(el) {
  const url = el.dataset.url;
  el.style.border = "2px solid #007aff";
  selectedSet.add(url);
}

// ✅ 新增圖片到預覽區域
function addThumb(img, list, added) {
  const src = img.src;
  if (!src || added.has(src)) return;
  added.add(src);

  const wrapper = document.createElement("div");
  wrapper.className = "image-wrapper";
  wrapper.dataset.url = src;
  wrapper.style.border = "2px solid transparent";
  Object.assign(wrapper.style, {
    cursor: "pointer", padding: "2px", maxWidth: "120px", boxSizing: "border-box"
  });

  const thumb = document.createElement("img");
  thumb.src = src;
  Object.assign(thumb.style, {
    width: "100%", maxHeight: "100px", objectFit: "cover"
  });

  wrapper.appendChild(thumb);
  wrapper.addEventListener("click", (e) => {
    const items = Array.from(list.querySelectorAll(".image-wrapper"));
    const currentIndex = items.indexOf(wrapper);
    const lastIndex = items.indexOf(window.lastSelected);

    if (e.shiftKey && window.lastSelected && currentIndex !== -1 && lastIndex !== -1) {
      const [from, to] = [Math.min(currentIndex, lastIndex), Math.max(currentIndex, lastIndex)];
      for (let i = from; i <= to; i++) {
        const el = items[i];
        const url = el.dataset.url;
        el.style.border = "2px solid #007aff";
        selectedSet.add(url);
      }
    } else {
      toggleItem(wrapper);
    }

    window.lastSelected = wrapper;
  });

  list.appendChild(wrapper);
}

// ✅ UI 主綁定
export function bindPanelEvents(panel, host, shadowRoot) {
    const container = document.createElement("div");
    container.style.position = "relative";
  
    panel.style.border = "2px solid #000";
    panel.style.background = "#fff";
    panel.style.padding = "8px";
    panel.style.boxSizing = "border-box";
    panel.style.position = "relative";
    panel.innerHTML = panelHTML;
  
    const settingsBtn = document.createElement("button");
    settingsBtn.textContent = "⚙️";
    settingsBtn.title = "設定預設根目錄";
    Object.assign(settingsBtn.style, {
      position: "absolute", top: "4px", left: "4px", border: "none",
      background: "transparent", cursor: "pointer", fontSize: "16px", zIndex: "10001"
    });
    settingsBtn.onclick = () => chrome.runtime.sendMessage({ action: "openOptions" });
    container.appendChild(settingsBtn);
  
    const controlRow = document.createElement("div");
    controlRow.style.margin = "4px 0 6px";
  
    const buttons = [
      {
        text: "✅ 全選", onclick: () =>
          panel.querySelectorAll(".image-wrapper").forEach(selectItem)
      },
      {
        text: "❌ 清除", onclick: () =>
          panel.querySelectorAll(".image-wrapper").forEach(el => {
            el.style.border = "2px solid transparent";
            selectedSet.delete(el.dataset.url);
          })
      }
    ];
  
    for (const btn of buttons) {
      const el = document.createElement("button");
      el.textContent = btn.text;
      el.onclick = btn.onclick;
      el.style.marginRight = "4px";
      el.style.padding = "2px 6px";
      controlRow.appendChild(el);
    }
  
    panel.insertBefore(controlRow, panel.querySelector("#image-list-container"));
  
    const thumbBox = document.createElement("div");
    thumbBox.id = "image-preview-box";
    Object.assign(thumbBox.style, {
      display: "flex", flexWrap: "wrap", marginTop: "12px"
    });
    panel.appendChild(thumbBox);
  
    container.appendChild(panel);
    shadowRoot.appendChild(container);
  
    // 📸 擷取圖片按鈕行為
    panel.querySelector("#scrape-btn")?.addEventListener("click", () => {
      const list = panel.querySelector("#image-list");
      list.innerHTML = "";
      selectedSet.clear();
      window.lastSelected = null;
  
      const added = new Set();
  
      // 初次擷取目前所有 <img>
      document.querySelectorAll("img").forEach((img) => {
        ensureImageLoaded(img);
        addThumb(img, list, added);
      });
  
      // 啟用 auto-observer：滑動觸發懶加載圖片自動加入預覽
      setupAutoImageDetection(list, added);
  
      console.log("圖片監控已啟動：懶加載圖片將自動加入預覽");
    });
  
    // 💾 圖片下載
    panel.querySelector("#download-selected")?.addEventListener("click", () => {
      const urls = Array.from(selectedSet);
      if (!urls.length) return alert("請先選取圖片");
  
      const stall = panel.querySelector("#stall-input")?.value.trim();
      const product = panel.querySelector("#product-input")?.value.trim();
  
      let successCount = 0;
      let failedCount = 0;
      let completed = 0;
  
      urls.forEach((url) => {
        try {
          const urlPath = new URL(url).pathname;
          const baseName = urlPath.split("/").pop() || "image.jpg";
          const filename = `${defaultRoot ? defaultRoot + "/" : ""}${stall || "unknown"}/${baseName}`;
  
          chrome.runtime.sendMessage({ action: "download", url, filename }, (response) => {
            if (chrome.runtime.lastError || !response || !response.success) {
              failedCount++;
            } else {
              successCount++;
            }
            completed++;
            if (completed === urls.length) {
              const toast = document.createElement("div");
              toast.textContent = `✅ 已成功下載 ${successCount} 張，失敗 ${failedCount} 張`;
              Object.assign(toast.style, {
                position: "fixed", bottom: "20px", right: "20px",
                background: "#222", color: "#fff", padding: "10px 16px",
                borderRadius: "6px", zIndex: 999999, fontSize: "14px"
              });
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 3000);
            }
          });
        } catch (err) {
          console.error("處理圖片網址失敗：", url, err);
          failedCount++;
          completed++;
        }
      });
    });
  
    // ✅ 懶加載圖片監控
    function setupAutoImageDetection(list, added) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const img = entry.target;
            ensureImageLoaded(img);
            addThumb(img, list, added);
            observer.unobserve(img);
          }
        }
      }, {
        root: null,
        rootMargin: "200px",
        threshold: 0.1
      });
  
      document.querySelectorAll("img").forEach((img) => {
        const src = img.src || img.dataset.src || img.dataset.lazySrc;
        if (!added.has(src)) observer.observe(img);
      });
    }
  
    // ✅ 確保圖片有 src（解決 lazy loading 問題）
    function ensureImageLoaded(img) {
      const lazySrc = img.dataset.src || img.dataset.lazySrc;
      if (lazySrc && !img.src) {
        img.src = lazySrc;
      }
      if (!img.complete || img.naturalWidth === 0) {
        img.addEventListener("load", () => {
          console.log(`Image loaded: ${img.src}`);
        });
      }
    }
  }
  