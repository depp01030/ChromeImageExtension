// 📄 content/floating-panel/text-parsing.js

/**
 * 從指定的 container DOM 中解析出乾淨的文字段落。
 * - 自動移除空白行
 * - 自動去除重複段落
 * - 支援直接印出清理後的純文字清單
 *
 * @param {HTMLElement} container - 要擷取文字的 DOM 容器元素
 * @returns {string[]} 淨化過的文字段落陣列
 */
export function extractCleanText(container) {
    if (!container || typeof container.innerText !== "string") return [];
  
    return container.innerText
      .split(/\n+/)                     // 分段：每一段原本是換行的
      .map(t => t.trim())               // 移除前後空白
      .filter(t => t.length > 0)        // 移除空行
      .filter((t, i, arr) => arr.indexOf(t) === i); // 去除重複文字
  }
  
  /**
   * 從 container 中找出所有 <p> 標籤的文字段落
   * @param {HTMLElement} container
   * @returns {string[]}
   */
  export function extractParagraphs(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll("p"))
      .map(p => p.innerText.trim())
      .filter(text => text.length > 0);
  }
  
  /**
   * 擷取特定 class 或標籤的內容（進階版本）
   * @param {HTMLElement} container
   * @param {string} selector - CSS 選擇器，例如 ".notice"、".title", "span.highlight"
   * @returns {string[]}
   */
  export function extractBySelector(container, selector) {
    if (!container || !selector) return [];
    return Array.from(container.querySelectorAll(selector))
      .map(el => el.innerText.trim())
      .filter(Boolean);
  }
  