// Define default filters for known ad domains
const defaultFilters = [
    "*://*.doubleclick.net/*",
    "*://partner.googleadservices.com/*",
    "*://*.googlesyndication.com/*",
    "*://*.google-analytics.com/*",
    "*://creative.ak.fbcdn.net/*",
    "*://*.adbrite.com/*",
    "*://*.exponential.com/*",
    "*://*.quantserve.com/*",
    "*://*.scorecardresearch.com/*",
    "*://*.zedo.com/*",
    "*://*.adroll.com/*",
    "*://*.mediaplex.com/*",
    "*://*.outbrain.com/*",
    "*://*.taboola.com/*",
    "*://*.popads.net/*",
    "*://*.adsterra.com/*",
    "*://*.adtechus.com/*",
    "*://*.revcontent.com/*",
    "*://*.criteo.com/*",
    "*://*.adnxs.com/*",
    "*://*.rubiconproject.com/*",
    "*://*.openx.net/*",
    "*://*.pubmatic.com/*",
    "*://*.appnexus.com/*",
    "*://*.spotxchange.com/*",
    "*://*.teads.tv/*",
    "*://*.bidtellect.com/*",
    "*://*.indexexchange.com/*",
    "*://*.contextweb.com/*",
];

// Function to detect ad-related requests heuristically
function isAdRequest(url) {
    const adKeywords = ["ads", "track", "promo", "banner", "metrics", "analytics"];
    return adKeywords.some(keyword => url.includes(keyword));
}

// Function to detect malicious URLs
function isMaliciousUrl(url) {
    const maliciousPatterns = [/malware/, /phishing/, /cryptominer/, /trojan/i];
    return maliciousPatterns.some(pattern => pattern.test(url));
}

// Listen for web requests and block matching ones
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // Check against default filters
        if (defaultFilters.some(filter => details.url.includes(filter))) {
            return { cancel: true };
        }

        // Check for heuristic ad detection
        if (isAdRequest(details.url)) {
            return { cancel: true };
        }

        // Check for malicious patterns
        if (isMaliciousUrl(details.url)) {
            return { cancel: true };
        }

        // Allow request if no blocking criteria are met
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Block malicious scripts or excessive resource usage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "resource-usage") {
        if (message.cpu > 80 || message.memory > 500) {
            sendResponse({ block: true });
        }
    }
});

// DOM manipulation to remove ad-related elements dynamically
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                const adElements = document.querySelectorAll(
                    "iframe[src*='ads'], div[class*='ad'], img[src*='ads'], script[src*='ads']"
                );
                adElements.forEach(el => el.remove());
            },
        });
    }
});

// Regularly update the blacklist dynamically
let dynamicBlacklist = [];
function updateBlacklist() {
    fetch("https://example.com/malicious-domains-list.json")
        .then(response => response.json())
        .then(data => {
            dynamicBlacklist = data.domains;
        })
        .catch(error => console.error("Error updating blacklist:", error));
}
setInterval(updateBlacklist, 3600000); // Update every hour

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (dynamicBlacklist.some(domain => details.url.includes(domain))) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
