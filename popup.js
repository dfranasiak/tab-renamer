function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

function setStatus(msg, type = "") {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "hint " + type;
}

// Apply title directly in the tab — works even if content script isn't ready
function applyTitle(tabId, name) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (n) => {
      document.title = n;
      // Fight SPAs that reset document.title
      const titleEl = document.querySelector("title");
      if (titleEl && !titleEl._tabRenamerObserver) {
        const obs = new MutationObserver(() => { if (document.title !== n) document.title = n; });
        obs.observe(titleEl, { childList: true });
        titleEl._tabRenamerObserver = obs;
      }
    },
    args: [name],
  }).catch(() => {});
}

function clearTitle(tabId, originalTitle) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: (orig) => {
      const titleEl = document.querySelector("title");
      if (titleEl?._tabRenamerObserver) {
        titleEl._tabRenamerObserver.disconnect();
        delete titleEl._tabRenamerObserver;
      }
      if (orig) document.title = orig;
    },
    args: [originalTitle ?? ""],
  }).catch(() => {});
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) { setStatus("Cannot rename this page.", "error"); return; }

  const key = normalizeUrl(tab.url);
  document.getElementById("current-url").textContent = key;

  const result = await chrome.storage.local.get(key);
  if (result[key]) {
    document.getElementById("name-input").value = result[key];
  }

  document.getElementById("save-btn").addEventListener("click", async () => {
    const name = document.getElementById("name-input").value.trim();
    if (!name) { setStatus("Name cannot be empty.", "error"); return; }

    const origKey = "_original_" + key;
    const orig = await chrome.storage.local.get(origKey);
    if (!orig[origKey]) {
      await chrome.storage.local.set({ [origKey]: tab.title });
    }

    await chrome.storage.local.set({ [key]: name });
    await applyTitle(tab.id, name);
    setStatus("Saved!", "success");
  });

  document.getElementById("clear-btn").addEventListener("click", async () => {
    const origKey = "_original_" + key;
    const orig = await chrome.storage.local.get(origKey);
    await chrome.storage.local.remove([key, origKey]);
    await clearTitle(tab.id, orig[origKey]);
    document.getElementById("name-input").value = "";
    setStatus("Cleared.", "");
  });

  document.getElementById("name-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("save-btn").click();
  });
}

init();
