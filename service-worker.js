// Cache to optimize performance
const urlCache = new Set();
const adPatterns = [/ads?/i, /popup/i, /tracking/i, /click/i, /marketing/i];

// Detect when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl && isSuspiciousURL(tab.pendingUrl)) {
    console.log(`Blocked popup: ${tab.pendingUrl}`);
    chrome.tabs.remove(tab.id); // Close the popup
  }
});

// Detect completed navigation in tabs
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
    if (tab && isSuspiciousURL(tab.url)) {
      console.log(`Blocked ad URL: ${tab.url}`);
      chrome.tabs.remove(tab.id); // Close the tab
    }
  });
});

// Handle WebRTC request blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "blockWebRTC") {
    const { url } = message;
    const isBlocked = /ads|track|analytics/.test(url);
    if (isBlocked) console.log(`Blocked WebRTC Request: ${url}`);
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

  const isAd = adPatterns.some((pattern) => pattern.test(url));
  if (isAd) urlCache.add(url); // Cache the result
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
      }
    ],
    removeRuleIds: [1, 2]
  });
  console.log("DeclarativeNetRequest rules added.");
});

// Advanced popup detection via content script messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "detectPopup") {
    const isPopup = adPatterns.some((pattern) => pattern.test(message.url));
    if (isPopup) {
      chrome.tabs.remove(sender.tab.id);
      console.log(`Blocked popup: ${message.url}`);
    }
    sendResponse({ isBlocked: isPopup });
  }
});
