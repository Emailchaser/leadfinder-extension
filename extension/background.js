// --- Mixpanel analytics (anonymous, extension-scoped) ---
// Public Mixpanel project token (browser tokens are safe to expose in clients).
const MIXPANEL_TOKEN = "db71a24a899cbc4f74f913ce7ecebff6";

function getDistinctId() {
  return new Promise((resolve) => {
    chrome.storage.local.get("mp_distinct_id", (result) => {
      let id = result && result.mp_distinct_id;
      if (!id) {
        id = "ext_" + crypto.randomUUID();
        chrome.storage.local.set({ mp_distinct_id: id });
      }
      resolve(id);
    });
  });
}

async function trackMixpanel(eventName, props = {}) {
  try {
    const distinctId = await getDistinctId();
    const version = chrome.runtime.getManifest().version;
    const payload = [
      {
        event: eventName,
        properties: {
          token: MIXPANEL_TOKEN,
          distinct_id: distinctId,
          $insert_id: crypto.randomUUID(),
          extension_version: version,
          surface: "leadfinder_extension",
          ...props,
        },
      },
    ];
    await fetch("https://api.mixpanel.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Mixpanel track failed", error);
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    trackMixpanel("Extension Installed");
  } else if (details.reason === "update") {
    trackMixpanel("Extension Updated", {
      previous_version: details.previousVersion,
    });
  }
});

try {
  chrome.webRequest.onSendHeaders.addListener(
    function (details) {
      // Check if the request is not for the linkedin sales api search
      if (
        !details.url.startsWith(
          "https://www.linkedin.com/sales-api/salesApiLeadSearch"
        ) &&
        !details.url.startsWith(
          "https://www.linkedin.com/sales-api/salesApiPeopleSearch"
        )
      ) {
        return;
      }

      // Check if the request is initiated by linkedin
      if (
        details.initiator !== "https://www.linkedin.com" &&
        details.initiator !== "https://linkedin.com"
      ) {
        return;
      }

      // Get the extension version
      extensionVersion = chrome.runtime.getManifest().version;

      // Create request data object
      let requestData = {
        time: Date.now(),
        data: {
          url: details.url,
          headers: details.requestHeaders,
          extension: extensionVersion,
        },
        version: "v1",
      };

      // Save the request data to local storage without encoding
      chrome.storage.local.set({ [details.tabId]: requestData }, function () {
      });

      return;
    },
    {
      urls: [
        "https://www.linkedin.com/sales-api/salesApiLeadSearch*",
        "https://www.linkedin.com/sales-api/salesApiPeopleSearch*",
      ],
    },
    ["requestHeaders", "extraHeaders"]
  );
} catch (e) {
  console.log(e);
}

chrome.runtime.onMessageExternal.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.action === "GET_DATA") {
    // Retrieve data for the given ID
    chrome.storage.local.get(request.id, function (result) {
      if (result[request.id]) {
        // Fetch IP information
        fetch("https://freeipapi.com/api/json")
          .then((response) => response.json())
          .then((ipData) => {
            // Add IP information to the result
            result[request.id].data.ip = ipData;

            // Convert the entire object to a JSON string
            const jsonString = JSON.stringify(result[request.id]);

            // Encode the JSON string to base64
            const base64String = btoa(String.fromCharCode(...new TextEncoder().encode(jsonString)));

            sendResponse({ data: base64String });
          })
          .catch((error) => {
            console.error("Error fetching IP info:", error);
            // If IP fetch fails, still send the data without IP info
            const jsonString = JSON.stringify(result[request.id]);
            const base64String = btoa(String.fromCharCode(...new TextEncoder().encode(jsonString)));
            sendResponse({ data: base64String });
          });
      } else {
        sendResponse({ data: null });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_IDS") {
    sendResponse({
      tabId: sender.tab.id,
      extensionId: chrome.runtime.id,
    });
  }

  if (message.action === "TRACK") {
    trackMixpanel(message.event, message.props || {});
  }
});

// Cleanup old data
function cleanupOldData() {
  const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const now = Date.now();

  chrome.storage.local.get(null, function (items) {
    for (let key in items) {
      if (items[key].time && now - items[key].time > ONE_DAY) {
        chrome.storage.local.remove(key, function () {
        });
      }
    }
  });
}

// Run cleanup when the browser starts or the extension is installed or updated
chrome.runtime.onStartup.addListener(cleanupOldData);
chrome.runtime.onInstalled.addListener(cleanupOldData);
