function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

const key = normalizeUrl(window.location.href);

chrome.storage.local.get(key, (result) => {
  if (result[key]) {
    document.title = result[key];
    observeTitleChanges(result[key]);
  }
});

// Some SPAs reset document.title — re-apply if they do
function observeTitleChanges(name) {
  const titleEl = document.querySelector("title");
  if (!titleEl) return;

  const observer = new MutationObserver(() => {
    if (document.title !== name) {
      document.title = name;
    }
  });
  observer.observe(titleEl, { childList: true });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_TITLE") {
    document.title = msg.name;
    observeTitleChanges(msg.name);
  } else if (msg.type === "CLEAR_TITLE") {
    chrome.storage.local.get("_original_" + key, (r) => {
      if (r["_original_" + key]) document.title = r["_original_" + key];
    });
  }
});
