// content/floating-panel/panel-ui-events.js
import { panelHTML } from "./panel-template.js";
import { extractCleanText } from "./text-parsing.js";

const selectedSet = new Set();
let defaultRoot = "";
window.lastSelected = null;

chrome.storage.sync.get(["defaultRoot"], (result) => {
  if (result.defaultRoot) defaultRoot = result.defaultRoot;
});

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

export function bindPanelEvents(panel, host, shadowRoot) {
  const container = document.createElement("div");
  container.style.position = "relative";

  Object.assign(panel.style, {
    border: "2px solid #000",
    background: "#fff",
    padding: "8px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "auto",
    minWidth: "320px",
    minHeight: "240px",
    maxWidth: "100vw",
    maxHeight: "100vh"
  });

  panel.innerHTML = panelHTML;

  // 🔧 左上角設定按鈕
  const settingsBtn = document.createElement("button");
  settingsBtn.textContent = "⚙️";
  settingsBtn.title = "設定預設根目錄";
  Object.assign(settingsBtn.style, {
    position: "absolute",
    top: "4px",
    left: "4px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "16px",
    zIndex: "10001"
  });
  settingsBtn.onclick = () => chrome.runtime.sendMessage({ action: "openOptions" });
  container.appendChild(settingsBtn);

  // 🔧 控制列
  const controlRow = document.createElement("div");
  controlRow.style.margin = "4px 0 6px";
  const buttons = [
    {
      text: "✅ 全選",
      onclick: () => panel.querySelectorAll(".image-wrapper").forEach(selectItem)
    },
    {
      text: "❌ 清除",
      onclick: () => panel.querySelectorAll(".image-wrapper").forEach(el => {
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
  container.appendChild(panel);
  shadowRoot.appendChild(container);

  // ✅ 左下角 resize 控制點
  const resizeHandle = document.createElement("div");
  Object.assign(resizeHandle.style, {
    position: "absolute",
    width: "14px",
    height: "14px",
    background: "#000",
    bottom: "0px",
    left: "0px",
    cursor: "nwse-resize",
    zIndex: "10002"
  });
  resizeHandle.className = "resize-handle";
  panel.appendChild(resizeHandle);

  let isResizing = false;
  let startX, startY, startWidth, startHeight;

  resizeHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = panel.offsetWidth;
    startHeight = panel.offsetHeight;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isResizing) return;
    const dx = startX - e.clientX;
    const dy = e.clientY - startY;
    panel.style.width = `${startWidth + dx}px`;
    panel.style.height = `${startHeight + dy}px`;
  }

  function onMouseUp() {
    isResizing = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  const downloadBtn = panel.querySelector("#download-selected");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
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
          const filename = `${stall || "unknown"}/${baseName}`;

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
  }

  panel.querySelector("#scrape-btn")?.addEventListener("click", () => {
    const list = panel.querySelector("#image-list");
    list.innerHTML = "";
    selectedSet.clear();
    window.lastSelected = null;

    const added = new Set();
    const containers = [...document.querySelectorAll(".se-main-container")];

    let target = null;
    if (containers.length > 0) {
      target = containers.reduce((a, b) =>
        b.querySelectorAll("img").length > a.querySelectorAll("img").length ? b : a
      );
    } else {
      target = document;
    }

    const parsedText = extractCleanText(target);
    console.log("📝 擷取到的文字段落：", parsedText);

    let foundImage = false;

    target.querySelectorAll("img").forEach((img) => {
      const lazySrc = img.dataset.src || img.dataset.lazySrc;
      if (lazySrc && !img.src.startsWith("http")) img.src = lazySrc;

      const src = img.src;
      if (!src || src.startsWith("data:image/") || added.has(src)) return;
      addThumb(img, list, added);
      foundImage = true;
    });

    target.querySelectorAll("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.startsWith("url(")) {
        const url = bg.slice(5, -2).replace(/^\"(.*)\"$/, "$1");
        if (!added.has(url)) {
          const fakeImg = new Image();
          fakeImg.src = url;
          addThumb(fakeImg, list, added);
          added.add(url);
          foundImage = true;
        }
      }
    });

    if (!foundImage) {
      alert("⚠️ 找不到任何圖片，請確認已滑到底並載入完成再試一次");
    }
  });


  // 📦 自動調整 image-list 欄數（每排圖片數）
  const imageList = panel.querySelector("#image-list");

  const updateGridColumns = () => {
    const containerWidth = imageList.offsetWidth;
    const cardMinWidth = 132 + 8; // 140px 圖 + padding/margin 保守估算
    const columns = Math.max(1, Math.floor(containerWidth / cardMinWidth));
    imageList.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  };

  const resizeObserver = new ResizeObserver(() => {
    updateGridColumns();
  });
  resizeObserver.observe(panel);

  // 初始執行一次（避免第一次為空）
  updateGridColumns();
}
