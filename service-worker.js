// Cache to optimize performance
const urlCache = new Set();
const adPatterns = [
  /\bads?\b/i,             // Matches "ad" or "ads" as standalone words
  /\bpopup\b/i,            // Matches "popup" as a standalone word
  /\btracking\b/i,         // Matches "tracking" as a standalone word
  /\bclick\b/i,            // Matches "click" as a standalone word
  /\bmarketing\b/i,        // Matches "marketing" as a standalone word
  /\badsystem\b/i          // Ensures "adsystem" is included, but not unrelated matches like "add"
];

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl && isSuspiciousURL(tab.pendingUrl)) {
    console.log(`Blocked popup: ${tab.pendingUrl}`);
    chrome.tabs.remove(tab.id, () => {
      if (chrome.runtime.lastError) {
        console.warn(`Failed to close popup tab: ${chrome.runtime.lastError.message}`);
      }
    }); // Close the popup safely
  }
});

// Detect completed navigation in tabs
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.warn(`No tab with id: ${details.tabId}. Error: ${chrome.runtime.lastError.message}`);
      return;
    }
    if (tab && isSuspiciousURL(tab.url)) {
      console.log(`Blocked ad URL: ${tab.url}`);
      chrome.tabs.remove(tab.id, () => {
        if (chrome.runtime.lastError) {
          console.warn(`Failed to close ad tab: ${chrome.runtime.lastError.message}`);
        }
      }); // Close the tab safely
    }
  });
});

// Handle WebRTC request blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "blockWebRTC") {
    const { url } = message;
    const isBlocked = adPatterns.some((pattern) => pattern.test(url)) || /track|analytics/.test(url);
    if (isBlocked) {
      console.log(`Blocked WebRTC Request: ${url}`);
    }
    sendResponse({ isBlocked });
  }
});

// Log request details for debugging
function logRequest(details, isBlocked) {
  console.log(`Request URL: ${details.url}, Type: ${details.type}, Blocked: ${isBlocked}`);
}

// Function to detect ad-like or popup-like URLs
function isSuspiciousURL(url) {
  if (urlCache.has(url)) {
    return true; // Immediately block cached URLs
  }

  // Refine matching to reduce false positives
  const isAd = adPatterns.some((pattern) => pattern.test(url));
  if (isAd) {
    console.log(`Caching ad URL for blocking: ${url}`);
    urlCache.add(url); // Cache the result
  }
  return isAd;
}

// Replace unsupported webRequest with declarativeNetRequest
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: "*://*ads/*", resourceTypes: ["main_frame", "sub_frame"] }
      },
      {
        id: 2,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: "*://*popup/*", resourceTypes: ["main_frame", "sub_frame"] }
      },
      {
        id: 3,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: "*://*marketing/*", resourceTypes: ["main_frame", "sub_frame"] }
      }
    ],
    removeRuleIds: [1, 2, 3]
  });
  console.log("DeclarativeNetRequest rules added.");
});

// Advanced popup detection via content script messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "detectPopup") {
    if (!sender.tab || !sender.tab.id) {
      console.warn("No valid tab associated with the popup message.");
      sendResponse({ isBlocked: false });
      return;
    }

    const isPopup = adPatterns.some((pattern) => pattern.test(message.url));
    if (isPopup) {
      chrome.tabs.remove(sender.tab.id, () => {
        if (chrome.runtime.lastError) {
          console.warn(`Failed to close popup tab: ${chrome.runtime.lastError.message}`);
        }
      });
      console.log(`Blocked popup: ${message.url}`);
    }
    sendResponse({ isBlocked: isPopup });
  }
});
