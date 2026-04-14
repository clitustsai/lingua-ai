// Background service worker
const API_BASE = "https://lingua-ai.vercel.app"; // Change to your deployed URL

// Context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "lingua-lookup",
    title: "🔍 LinguaAI: Tra từ \"%s\"",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "lingua-save",
    title: "💾 LinguaAI: Lưu flashcard \"%s\"",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const word = info.selectionText?.trim();
  if (!word || !tab?.id) return;
  if (info.menuItemId === "lingua-lookup") {
    chrome.tabs.sendMessage(tab.id, { type: "LOOKUP_WORD", word });
  }
  if (info.menuItemId === "lingua-save") {
    chrome.tabs.sendMessage(tab.id, { type: "SAVE_WORD", word });
  }
});

// Handle API calls from content script / popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXPLAIN_WORD") {
    explainWord(msg.word, msg.context, msg.settings).then(sendResponse);
    return true; // async
  }
  if (msg.type === "SAVE_FLASHCARD") {
    saveFlashcard(msg.card).then(sendResponse);
    return true;
  }
  if (msg.type === "GET_FLASHCARDS") {
    chrome.storage.local.get("flashcards", (data) => {
      sendResponse(data.flashcards || []);
    });
    return true;
  }
});

async function explainWord(word, context, settings = {}) {
  try {
    const res = await fetch(`${API_BASE}/api/word-explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word,
        context: context || word,
        targetLanguage: settings.targetLanguage || "English",
        nativeLanguage: settings.nativeLanguage || "Vietnamese",
      }),
    });
    return await res.json();
  } catch (e) {
    return { error: "Cannot connect to LinguaAI" };
  }
}

async function saveFlashcard(card) {
  return new Promise((resolve) => {
    chrome.storage.local.get("flashcards", (data) => {
      const cards = data.flashcards || [];
      const exists = cards.some(c => c.word === card.word);
      if (!exists) cards.push({ ...card, id: Date.now().toString(), savedAt: new Date().toISOString() });
      chrome.storage.local.set({ flashcards: cards }, () => resolve({ success: true, total: cards.length }));
    });
  });
}
