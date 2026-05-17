# Tab Renamer

A Chrome extension that lets you give any browser tab a custom name. The name persists across page refreshes and is automatically re-applied whenever you navigate to that URL.

![Tab Renamer icon](icons/icon48.png)

## Features

- Rename any tab with a custom title in one click
- Names persist across refreshes — stored locally in the browser
- Works on SPAs (React, Vue, etc.) that reset `document.title` dynamically
- Keyed on `origin + pathname`, so query strings and fragments don't create duplicates
- Clear a saved name to restore the original page title

## Installation

1. Clone or download this repository and unzip it
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `tab-renamer` folder
5. The pencil icon will appear in your toolbar

> **Firefox:** Go to `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** → select `manifest.json`. Works until the browser is closed. For a permanent install use Firefox Developer Edition with `xpinstall.signatures.required` set to `false` in `about:config`.

## Usage

1. Navigate to any page
2. Click the **Tab Renamer** toolbar icon
3. Type a custom name and press **Save** (or hit Enter)
4. The tab title updates immediately — and will be restored automatically on every future visit to that URL
5. Click **Clear** to remove the saved name and revert to the original title

## Project Structure

```
tab-renamer/
├── manifest.json    # MV3 extension manifest
├── background.js    # Service worker — re-applies saved names on tab load
├── content.js       # Injected into pages — applies name on load, guards against SPA resets
├── popup.html       # Toolbar popup UI
├── popup.css        # Popup styles
├── popup.js         # Popup logic — save/clear via chrome.scripting.executeScript
└── icons/
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    └── icon.svg     # Source icon (pencil on blue background)
```

## How It Works

| Component | Role |
|---|---|
| `popup.js` | Reads/writes `chrome.storage.local` and calls `chrome.scripting.executeScript` to rename the active tab immediately — no reload required |
| `background.js` | Listens for `chrome.tabs.onUpdated` and re-injects the saved name whenever a tab finishes loading |
| `content.js` | Applied on page load; also uses a `MutationObserver` on `<title>` to prevent SPAs from overriding a custom name |

Names are stored under a key of `origin + pathname` (e.g. `https://github.com/user/repo`), which means:
- Query strings and URL fragments are ignored
- The same name applies to all query variants of a URL
- Each unique path gets its own name

## Permissions

| Permission | Why |
|---|---|
| `storage` | Persist custom names locally |
| `tabs` | Read the active tab's URL and title |
| `scripting` | Inject title changes into the page without a reload |
| `host_permissions: <all_urls>` | Allow renaming tabs on any website |
