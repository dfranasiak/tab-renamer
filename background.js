chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const key = normalizeUrl(tab.url);
  chrome.storage.local.get(key, (result) => {
    const customName = result[key];
    if (!customName) return;

    chrome.scripting.executeScript({
      target: { tabId },
      func: (name) => { document.title = name; },
      args: [customName],
    });
  });
});

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    // Key on origin + pathname, ignoring query/hash
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}
