const API_BASE_DEFAULT = "https://lingua-ai.vercel.app";

// ── State ────────────────────────────────────────────────────────────────────
let settings = { targetLanguage: "English", nativeLanguage: "Vietnamese", apiUrl: API_BASE_DEFAULT };
let flashcards = [];
let currentWordData = null;

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  await loadFlashcards();
  setupTabs();
  setupSearch();
  setupButtons();
  updateUI();
});

async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(["settings", "streak"], (data) => {
      if (data.settings) settings = { ...settings, ...data.settings };
      if (data.streak > 0) {
        document.getElementById("streak-badge").classList.remove("hidden");
        document.getElementById("streak-count").textContent = data.streak;
      }
      // Populate settings form
      document.getElementById("target-lang").value = settings.targetLanguage;
      document.getElementById("native-lang").value = settings.nativeLanguage;
      document.getElementById("api-url").value = settings.apiUrl || API_BASE_DEFAULT;
      resolve();
    });
  });
}

async function loadFlashcards() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: "GET_FLASHCARDS" }, (cards) => {
      flashcards = cards || [];
      resolve();
    });
  });
}

function updateUI() {
  document.getElementById("card-count").textContent = flashcards.length;
  renderFlashcards();
}

function renderFlashcards() {
  const list = document.getElementById("flashcard-list");
  if (flashcards.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>Chưa có flashcard nào.</p><p class="hint">Highlight từ trên trang web → nhấn 💾 để lưu</p></div>`;
    return;
  }
  list.innerHTML = flashcards.slice().reverse().map((c, i) => `
    <div class="flashcard-item">
      <span class="fc-word" title="${esc(c.word)}">${esc(c.word)}</span>
      <span class="fc-trans" title="${esc(c.translation)}">${esc(c.translation || "—")}</span>
      <button class="fc-del" data-idx="${flashcards.length - 1 - i}" title="Xóa">✕</button>
    </div>
  `).join("");

  list.querySelectorAll(".fc-del").forEach(btn => {
    btn.addEventListener("click", () => deleteCard(parseInt(btn.dataset.idx)));
  });
}

function deleteCard(idx) {
  flashcards.splice(idx, 1);
  chrome.storage.local.set({ flashcards }, () => updateUI());
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove("hidden");
    });
  });
}

// ── Search ───────────────────────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById("word-input");
  const btn = document.getElementById("search-btn");

  btn.addEventListener("click", () => doSearch(input.value.trim()));
  input.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(input.value.trim()); });

  // Pre-fill with selected text on current page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => window.getSelection()?.toString().trim() || "",
    }, (results) => {
      const sel = results?.[0]?.result;
      if (sel && sel.length > 0 && sel.length < 60) {
        input.value = sel;
        doSearch(sel);
      }
    });
  });
}

async function doSearch(word) {
  if (!word) return;
  const section = document.getElementById("result-section");
  const content = document.getElementById("result-content");
  section.classList.remove("hidden");
  content.innerHTML = `<p class="result-loading">⏳ Đang tra từ "${esc(word)}"...</p>`;

  chrome.runtime.sendMessage(
    { type: "EXPLAIN_WORD", word, context: word, settings },
    (data) => {
      currentWordData = data;
      if (!data || data.error) {
        content.innerHTML = `<p class="result-error">❌ Không tìm được. Kiểm tra kết nối!</p>`;
        return;
      }
      content.innerHTML = `
        <div class="result-word">${esc(word)}</div>
        <div class="result-meta">
          ${data.ipa ? `<span class="result-ipa">[${esc(data.ipa)}]</span>` : ""}
          ${data.partOfSpeech ? `<span class="result-pos">${esc(data.partOfSpeech)}</span>` : ""}
          ${data.level ? `<span class="result-level">${esc(data.level)}</span>` : ""}
        </div>
        <p class="result-meaning">${esc(data.meaning || "")}</p>
        ${data.exampleSentence ? `<p class="result-example">"${esc(data.exampleSentence)}"</p>` : ""}
        ${data.exampleTranslation ? `<p class="result-example-trans">${esc(data.exampleTranslation)}</p>` : ""}
        <button class="result-save-btn" id="popup-save-btn">💾 Lưu vào Flashcard</button>
      `;
      document.getElementById("popup-save-btn")?.addEventListener("click", () => {
        chrome.runtime.sendMessage({
          type: "SAVE_FLASHCARD",
          card: { word, translation: data.meaning || "", example: data.exampleSentence || "", language: "en" },
        }, async (res) => {
          document.getElementById("popup-save-btn").textContent = `✅ Đã lưu! (${res?.total || ""} từ)`;
          await loadFlashcards();
          updateUI();
        });
      });
    }
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
function setupButtons() {
  document.getElementById("open-app-btn").addEventListener("click", () => {
    chrome.tabs.create({ url: settings.apiUrl || API_BASE_DEFAULT });
  });

  document.getElementById("clear-btn").addEventListener("click", () => {
    if (confirm("Xóa tất cả flashcard?")) {
      flashcards = [];
      chrome.storage.local.set({ flashcards }, () => updateUI());
    }
  });

  document.getElementById("save-settings-btn").addEventListener("click", () => {
    settings.targetLanguage = document.getElementById("target-lang").value;
    settings.nativeLanguage = document.getElementById("native-lang").value;
    settings.apiUrl = document.getElementById("api-url").value || API_BASE_DEFAULT;
    chrome.storage.local.set({ settings }, () => {
      document.getElementById("save-settings-btn").textContent = "✅ Đã lưu!";
      setTimeout(() => { document.getElementById("save-settings-btn").textContent = "Lưu cài đặt"; }, 1500);
    });
  });
}

function esc(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
