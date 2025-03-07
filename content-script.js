// Detect popups triggered by JavaScript (window.open)
(function() {
    if (window.open) {
      const originalOpen = window.open;
      window.open = function (...args) {
        chrome.runtime.sendMessage(
          { type: "detectPopup", url: args[0] },
          (response) => {
            if (response.isBlocked) {
              console.log("Blocked popup opened by JavaScript.");
            }
          }
        );
        return originalOpen.apply(window, args);
      };
    }
  })();
  
  // Analyze DOM for ad elements and remove them
  function removeAdElements() {
    const adSelectors = [
      ".ad-container", ".banner-ad", "[id^='ad-']", ".sticky-ad", // Common ad patterns
      ".sponsored", "[class*='advert']", "iframe[src*='ads']" // Flexible matching
    ];
  
    adSelectors.forEach((selector) => {
      const adElements = document.querySelectorAll(selector);
      adElements.forEach((ad) => {
        ad.remove();
        console.log("Ad element removed:", ad);
      });
    });
  }
  
  // Detect dark patterns in DOM (e.g., fake download buttons)
  function highlightDarkPatterns() {
    const suspiciousButtons = document.querySelectorAll("button, a");
    suspiciousButtons.forEach((el) => {
      if (
        /click here|download now|free|hurry/i.test(el.textContent) &&
        el.getBoundingClientRect().width > 100 // Likely a big button
      ) {
        el.style.border = "2px solid red"; // Highlight potentially deceptive elements
        console.log("Potential dark pattern detected:", el);
      }
    });
  }
  
  // Protect privacy: Disable access to sensitive APIs
  (function() {
    const sensitiveAPIs = ["canvas", "audioContext", "screen"];
    sensitiveAPIs.forEach((api) => {
      if (window[api]) {
        window[api] = () => console.log(`${api} API access blocked.`);
      }
    });
  })();
  
  // Detect potential overlays or popups dynamically (optional DOM observer)
  const observer = new MutationObserver(() => {
    removeAdElements(); // Dynamically handle new ad elements
    highlightDarkPatterns(); // Highlight new suspicious elements
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Initial DOM cleanup
  removeAdElements();
  highlightDarkPatterns();
  