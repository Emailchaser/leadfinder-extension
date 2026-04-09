# Lead finder by Emailchaser (Chrome extension)

> [!NOTE]
> This extension was removed from the Chrome Web Store, so this repository explains how to manually install it.

Use this extension to scrape leads and find their emails from **LinkedIn Sales Navigator** with your **Emailchaser** account.

## 🚀 What this extension does

- Adds an **"Export with Emailchaser"** button inside Sales Navigator people searches/lists.
- Captures the current Sales Navigator search request context.
- Opens the Emailchaser app to continue processing that search.

## ✅ Requirements

- Google Chrome (latest stable recommended)
- An active [Emailchaser](https://app.emailchaser.com/) account
- Access to LinkedIn Sales Navigator

## 🛠️ Manual installation

1. Download the latest ZIP and extract it:

https://github.com/emailchaser/leadfinder-extension/archive/refs/heads/main.zip

Alternative (for developers):

```bash
git clone https://github.com/emailchaser/leadfinder-extension.git
```

2. Open Chrome and go to:

```text
chrome://extensions/
```

3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked**.
5. Select the `extension` folder from this repository:

```text
leadfinder-extension/extension
```

6. Confirm the extension appears as **Lead Finder by Emailchaser**.

## ▶️ How to use

1. Open Sales Navigator people search:
   https://www.linkedin.com/sales/search/people?viewAllFilters=true
2. Run your filters/search.
3. Click **Export with Emailchaser** on the Sales Navigator page.
4. A new Emailchaser tab opens and continues the workflow.

## 🔄 Updating the extension manually

If extension files changed (after re-downloading the ZIP or pulling with Git):

1. Go to `chrome://extensions/`
2. Find **Lead Finder by Emailchaser**
3. Click the **Reload** button

## 🔐 Permissions (why they are needed)

- `webRequest`: Detects Sales Navigator search requests you want to export.
- `storage`: Temporarily stores the selected search context locally.
- LinkedIn host permissions: Limits operation to Sales Navigator pages/API requests.
- `freeipapi.com` host permission: Adds IP metadata used by the Emailchaser flow.

## 🧩 Troubleshooting

- If the export button does not appear:
  - Make sure you are on a supported Sales Navigator URL (people search/list pages).
  - Refresh the Sales Navigator tab once after installation.
  - Verify the extension is enabled in `chrome://extensions/`.
  - Disable or uninstall other LinkedIn-related Chrome extensions, since they can conflict with button injection/page behavior.
- If nothing happens after clicking export:
  - Confirm pop-ups are allowed for LinkedIn and Emailchaser in Chrome.
  - Click the extension icon in Chrome (top-right) to open the extension popup, then use the "Open Sales Navigator lead search" link.
- If you updated files and changes are not reflected:
  - Reload the extension in `chrome://extensions/` and refresh LinkedIn.

## 📝 Notes

- This extension is a companion connector. Email enrichment/export happens in your Emailchaser account.
- Not affiliated with or endorsed by LinkedIn. LinkedIn is a registered trademark of its owner.
