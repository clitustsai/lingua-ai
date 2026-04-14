// Content script - runs on every webpage
let tooltip = null;
let currentWord = "";

// Listen for text selection
document.addEventListener("mouseup", (e) => {
  const selected = window.getSelection()?.toString().trim();
  if (selected && selected.length > 0 && selected.length < 100) {
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showTooltip(selected, rect, e);
  } else {
    hideTooltip();
  }
});

document.addEventListener("mousedown", (e) => {
  if (tooltip && !tooltip.contains(e.target)) hideTooltip();
});

function showTooltip(word, rect, e) {
  hideTooltip();
  currentWord = word;

  tooltip = document.createElement("div");
  tooltip.id = "lingua-tooltip";
  tooltip.innerHTML = `
    <div class="lingua-tooltip-header">
      <span class="lingua-word">${escapeHtml(word)}</span>
      <div class="lingua-actions">
        <button class="lingua-btn lingua-lookup-btn" title="Tra từ">🔍</button>
        <button class="lingua-btn lingua-save-btn" title="Lưu flashcard">💾</button>
        <button class="lingua-btn lingua-close-btn" title="Đóng">✕</button>
      </div>
    </div>
    <div class="lingua-result" id="lingua-result">
      <span class="lingua-hint">Nhấn 🔍 để tra từ</span>
    </div>
  `;

  // Position tooltip
  const x = Math.min(rect.left + window.scrollX, window.innerWidth - 320);
  const y = rect.bottom + window.scrollY + 8;
  tooltip.style.left = `${Math.max(8, x)}px`;
  tooltip.style.top = `${y}px`;

  document.body.appendChild(tooltip);

  // Button handlers
  tooltip.querySelector(".lingua-lookup-btn").addEventListener("click", () => lookupWord(word));
  tooltip.querySelector(".lingua-save-btn").addEventListener("click", () => saveWord(word));
  tooltip.querySelector(".lingua-close-btn").addEventListener("click", hideTooltip);
}

function hideTooltip() {
  if (tooltip) { tooltip.remove(); tooltip = null; }
}

async function lookupWord(word) {
  const resultEl = document.getElementById("lingua-result");
  if (!resultEl) return;
  resultEl.innerHTML = `<span class="lingua-loading">⏳ Đang tra từ...</span>`;

  const context = getContext(word);
  chrome.runtime.sendMessage(
    { type: "EXPLAIN_WORD", word, context },
    (data) => {
      if (!resultEl) return;
      if (data?.error || !data?.meaning) {
        resultEl.innerHTML = `<span class="lingua-error">❌ Không tìm được. Thử lại!</span>`;
        return;
      }
      resultEl.innerHTML = `
        <div class="lingua-meaning">
          ${data.ipa ? `<span class="lingua-ipa">[${escapeHtml(data.ipa)}]</span>` : ""}
          ${data.partOfSpeech ? `<span class="lingua-pos">${escapeHtml(data.partOfSpeech)}</span>` : ""}
          ${data.level ? `<span class="lingua-level">${escapeHtml(data.level)}</span>` : ""}
        </div>
        <p class="lingua-def">${escapeHtml(data.meaning)}</p>
        ${data.exampleSentence ? `<p class="lingua-example">"${escapeHtml(data.exampleSentence)}"</p>` : ""}
        ${data.exampleTranslation ? `<p class="lingua-example-trans">${escapeHtml(data.exampleTranslation)}</p>` : ""}
        <button class="lingua-save-full-btn">💾 Lưu vào Flashcard</button>
      `;
      resultEl.querySelector(".lingua-save-full-btn")?.addEventListener("click", () => {
        saveWordWithData(word, data);
      });
    }
  );
}

function saveWord(word) {
  const context = getContext(word);
  chrome.runtime.sendMessage(
    { type: "EXPLAIN_WORD", word, context },
    (data) => {
      if (data?.meaning) saveWordWithData(word, data);
      else {
        chrome.runtime.sendMessage({
          type: "SAVE_FLASHCARD",
          card: { word, translation: "", example: "", language: "en" },
        }, (res) => showSavedBadge(res?.total));
      }
    }
  );
}

function saveWordWithData(word, data) {
  chrome.runtime.sendMessage({
    type: "SAVE_FLASHCARD",
    card: {
      word,
      translation: data.meaning || "",
      example: data.exampleSentence || "",
      language: "en",
    },
  }, (res) => {
    showSavedBadge(res?.total);
    const btn = document.querySelector(".lingua-save-full-btn");
    if (btn) btn.textContent = "✅ Đã lưu!";
  });
}

function showSavedBadge(total) {
  const badge = document.createElement("div");
  badge.id = "lingua-saved-badge";
  badge.textContent = `✅ Đã lưu flashcard! (${total || ""} từ)`;
  document.body.appendChild(badge);
  setTimeout(() => badge.remove(), 2500);
}

function getContext(word) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return word;
  const range = sel.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const text = container.textContent || "";
  const idx = text.indexOf(word);
  if (idx === -1) return word;
  return text.slice(Math.max(0, idx - 60), idx + word.length + 60).trim();
}

function escapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LOOKUP_WORD") lookupWord(msg.word);
  if (msg.type === "SAVE_WORD") saveWord(msg.word);
});
