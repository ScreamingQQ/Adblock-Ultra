// Function to remove ad-related DOM elements dynamically
function removeAdElements() {
    const adSelectors = [
        "iframe[src*='ads']",
        "div[class*='ad']",
        "img[src*='ads']",
        "script[src*='ads']"
    ];
    adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });
}

// Apply DOM manipulations when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: removeAdElements
        });
    }
});

// Function to dynamically update rules
function updateRules(dynamicRules) {
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: dynamicRules.map(rule => rule.id),
        addRules: dynamicRules
    }, () => console.log("Dynamic rules updated"));
}

// Listen for rule update requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateRules") {
        updateRules(message.rules || []);
        sendResponse({ success: true });
    }
});

let dynamicBlacklist = [];
function fetchBlacklist() {
    fetch("https://example.com/updated-blacklist.json")
        .then(response => response.json())
        .then(data => {
            dynamicBlacklist = data.domains;
            updateRules(dynamicBlacklist.map((domain, index) => ({
                id: index + 1000, // Unique ID for dynamic rules
                priority: 1,
                action: { type: "block" },
                condition: { urlFilter: `*://${domain}/*` }
            })));
        })
        .catch(error => console.error("Blacklist update failed:", error));
}
setInterval(fetchBlacklist, 3600000); // Update every hour

function isHeuristicAd(url) {
    const keywords = ["ads", "track", "promo", "click", "banner", "analytics", "impression"];
    return keywords.some(keyword => url.includes(keyword)) && !url.includes("trusted-keyword");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "resource-usage" && (message.cpu > 80 || message.memory > 500)) {
        sendResponse({ block: true });
    }
});

function classifyAd(url) {
    // Placeholder for ML-based classification
    const mlModel = { classify: url => url.includes("ads") };
    return mlModel.classify(url);
}

// Function to dynamically remove ad-related DOM elements
function removeAdElements() {
    const adSelectors = [
        "iframe[src*='ads']",
        "div[class*='ad']",
        "img[src*='ads']",
        "script[src*='ads']",
        "aside[class*='ad']",
        "section[class*='ad']",
        "span[class*='ad']"
    ];
    adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
    });
}

// Dynamically manipulate DOM to remove ad-related elements on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: removeAdElements
        });
    }
});

// Function to manage updating blocking rules dynamically
function updateBlockingRules() {
    // Example of adding dynamic ad-related rules
    const dynamicRules = [
        {
            id: 1001,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: "*://*.exampleadnetwork.com/*" }
        },
        {
            id: 1002,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: "*://tracking.example.com/*" }
        }
    ];
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: dynamicRules.map(rule => rule.id),
        addRules: dynamicRules
    }, () => console.log("Dynamic blocking rules updated"));
}

// Set an interval to update rules every hour
setInterval(updateBlockingRules, 3600000);

// Listen for messages from other extension parts (e.g., popup or options page)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateBlacklist") {
        // Update blacklist dynamically
        const blacklistRules = message.blacklist.map((domain, index) => ({
            id: index + 2000,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: `*://${domain}/*` }
        }));
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: blacklistRules.map(rule => rule.id),
            addRules: blacklistRules
        }, () => {
            console.log("Blacklist updated successfully");
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async response
    }
});

// Advanced heuristic detection for ad requests
function isHeuristicAd(url) {
    const keywords = ["ads", "track", "promo", "banner", "analytics", "click", "impression"];
    return keywords.some(keyword => url.includes(keyword));
}

// Background listener for heuristic ad detection
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (isHeuristicAd(details.url)) {
            console.log(`Blocked heuristic ad: ${details.url}`);
            return { cancel: true };
        }
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// CPU and memory usage monitoring to prevent resource-heavy ads
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkResourceUsage" && (message.cpu > 80 || message.memory > 500)) {
        console.warn("Blocked resource-heavy ad!");
        sendResponse({ block: true });
    }
});

// Function to fetch and update blacklist from an external source
function fetchAndUpdateBlacklist() {
    const blacklistUrl = "https://example.com/blacklist.json";
    fetch(blacklistUrl)
        .then(response => response.json())
        .then(data => {
            const blacklistRules = data.domains.map((domain, index) => ({
                id: index + 3000,
                priority: 1,
                action: { type: "block" },
                condition: { urlFilter: `*://${domain}/*` }
            }));
            chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: blacklistRules.map(rule => rule.id),
                addRules: blacklistRules
            }, () => console.log("Blacklist fetched and updated"));
        })
        .catch(error => console.error("Failed to fetch blacklist:", error));
}

// Fetch and update blacklist every hour
setInterval(fetchAndUpdateBlacklist, 3600000);
