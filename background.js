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
    "*://*.yahoo.com/ads/*",
    "*://*.adnxs.com/*",
    "*://*.rubiconproject.com/*",
    "*://*.openx.net/*",
    "*://*.pubmatic.com/*",
    "*://*.appnexus.com/*",
    "*://*.casalemedia.com/*",
    "*://*.contextweb.com/*",
    "*://*.lijit.com/*",
    "*://*.moatads.com/*",
    "*://*.spotxchange.com/*",
    "*://*.teads.tv/*",
    "*://*.brightcove.com/*",
    "*://*.videologygroup.com/*",
    "*://*.yieldmo.com/*",
    "*://*.gumgum.com/*",
    "*://*.adform.net/*",
    "*://*.smartadserver.com/*",
    "*://*.adition.com/*",
    "*://*.adscale.de/*",
    "*://*.adspirit.de/*",
    "*://*.adtech.de/*",
    "*://*.adverline.com/*",
    "*://*.adzerk.net/*",
    "*://*.bidtellect.com/*",
    "*://*.bidvertiser.com/*",
    "*://*.bluekai.com/*",
    "*://*.chartbeat.com/*",
    "*://*.clicktale.net/*",
    "*://*.comscore.com/*",
    "*://*.connatix.com/*",
    "*://*.crwdcntrl.net/*",
    "*://*.demdex.net/*",
    "*://*.drawbridge.com/*",
    "*://*.everesttech.net/*",
    "*://*.flashtalking.com/*",
    "*://*.gigya.com/*",
    "*://*.indexexchange.com/*",
    "*://*.krxd.net/*",
    "*://*.liveintent.com/*",
    "*://*.mathtag.com/*",
    "*://*.mediamath.com/*",
    "*://*.ml314.com/*",
    "*://*.onetag.com/*",
    "*://*.quantcast.com/*",
    "*://*.rfihub.com/*",
    "*://*.rlcdn.com/*",
    "*://*.skimresources.com/*",
    "*://*.stackadapt.com/*",
    "*://*.tapad.com/*",
    "*://*.xaxis.com/*",
    // More URLs can be added here
];

// Additional functions to dynamically detect ad patterns
function isAdRequest(url) {
    const adKeywords = ["ads", "adservice", "banner", "promotions", "track", "analytics"];
    return adKeywords.some(keyword => url.includes(keyword));
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // Check if the request matches known ad filters
        if (defaultFilters.some(filter => details.url.includes(filter))) {
            return { cancel: true };
        }
        // Additional heuristic to check for ad-related patterns
        if (isAdRequest(details.url)) {
            return { cancel: true };
        }
        return { cancel: false };
    },
    { urls: ["<all_urls>"] }, // Listen to all URLs for more comprehensive blocking
    ["blocking"]
);

// Block specific DOM elements (e.g., iframes or scripts) that contain ads
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "blockAds") {
        const adElements = document.querySelectorAll("iframe[src*='ads'], script[src*='ads']");
        adElements.forEach(element => element.remove());
        sendResponse({ success: true });
    }
});

function isRegexAdRequest(url) {
    const adPatterns = /ads?|track|promo|click|banner|impression|analytics|metrics|adserver/i;
    return adPatterns.test(url);
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (isRegexAdRequest(details.url)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);


chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        const referrerKeywords = ["ad", "tracker", "promo"];
        const referrer = details.requestHeaders.find(header => header.name.toLowerCase() === "referer");
        if (referrer && referrerKeywords.some(keyword => referrer.value.includes(keyword))) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        return {
            requestHeaders: details.requestHeaders.filter(header => header.name.toLowerCase() !== "cookie"),
        };
    },
    { urls: defaultFilters },
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        const blockedTypes = ["image", "script", "sub_frame"];
        if (blockedTypes.includes(details.type)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        const sizeLimit = 500000; // Approx. 500 KB
        const contentLengthHeader = details.responseHeaders.find(
            header => header.name.toLowerCase() === "content-length"
        );
        if (contentLengthHeader && parseInt(contentLengthHeader.value, 10) > sizeLimit) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking", "responseHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return new Promise(resolve => setTimeout(() => resolve({ cancel: false }), 2000)); // 2-second delay
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        const blockedHeaders = ["x-advertisement", "x-tracking-id"];
        if (
            details.requestHeaders.some(header =>
                blockedHeaders.includes(header.name.toLowerCase())
            )
        ) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const blockedExtensions = [".swf", ".gif", ".mp4", ".flv"];
        if (blockedExtensions.some(ext => details.url.endsWith(ext))) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

const slowRequests = {};
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        slowRequests[details.requestId] = Date.now();
    },
    { urls: ["<all_urls>"] },
    []
);

chrome.webRequest.onCompleted.addListener(
    function(details) {
        const timeTaken = Date.now() - slowRequests[details.requestId];
        if (timeTaken > 1000) { // Block requests taking more than 1 second
            delete slowRequests[details.requestId];
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        const blockedSources = ["adserver.com", "ads.example.com"];
        const refererHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "referer");
        const originHeader = details.requestHeaders.find(header => header.name.toLowerCase() === "origin");

        if (
            (refererHeader && blockedSources.some(domain => refererHeader.value.includes(domain))) ||
            (originHeader && blockedSources.some(domain => originHeader.value.includes(domain)))
        ) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                const adElements = document.querySelectorAll("iframe[src*='ads'], div[class*='ad'], img[src*='ads']");
                adElements.forEach(el => el.remove());
            },
        });
    }
});

function isAdML(url) {
    // Placeholder ML model logic for classification
    const mlModel = { classify: url => url.includes("ads") || url.includes("track") };
    return mlModel.classify(url);
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (isAdML(details.url)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

function isSuspiciousUrl(url) {
    const suspiciousPatterns = ["ads", "promo", "banner"];
    const repeatedSubstrings = url.match(/(.+)\1+/g); // Detect repeated patterns
    const longUrl = url.length > 100; // Check for unusually long URLs

    return suspiciousPatterns.some(pattern => url.includes(pattern)) || repeatedSubstrings || longUrl;
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (isSuspiciousUrl(details.url)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

async function isMaliciousUrl(url) {
    const apiKey = "your_api_key_here"; // Replace with your API key
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${encodeURIComponent(url)}`, {
        method: "GET",
        headers: { "x-apikey": apiKey },
    });
    const data = await response.json();
    // Check if the URL is flagged as malicious
    return data.data.attributes.last_analysis_stats.malicious > 0;
}

chrome.webRequest.onBeforeRequest.addListener(
    async function(details) {
        if (await isMaliciousUrl(details.url)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const maliciousPatterns = [/malware/, /phishing/, /cryptominer/, /trojan/i];
        if (maliciousPatterns.some(pattern => pattern.test(details.url))) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.contentSettings.javascript.set({
    primaryPattern: "<all_urls>",
    setting: "block",
});

chrome.webRequest.onBeforeRedirect.addListener(
    function(details) {
        if (details.redirects && details.redirects > 5) { // Block after 5 redirects
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.webRequest.onCompleted.addListener(
    function(details) {
        fetch(details.url)
            .then(response => response.text())
            .then(body => {
                const maliciousPatterns = [/eval\(/, /document\.write/, /unescape/, /iframe/];
                if (maliciousPatterns.some(pattern => pattern.test(body))) {
                    console.warn(`Blocked malicious response from ${details.url}`);
                }
            })
            .catch(error => console.error(error));
    },
    { urls: ["<all_urls>"] },
    []
);

let dynamicBlacklist = [];

function updateBlacklist() {
    fetch("https://example.com/malicious-domains-list.json")
        .then(response => response.json())
        .then(data => {
            dynamicBlacklist = data.domains;
        });
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "resource-usage") {
        if (message.cpu > 80 || message.memory > 500) { // Thresholds for CPU and memory
            sendResponse({ block: true });
        }
    }
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const exploitPatterns = [/script=/, /<script>/, /SELECT.*FROM/, /INSERT.*INTO/];
        if (exploitPatterns.some(pattern => pattern.test(details.url))) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

