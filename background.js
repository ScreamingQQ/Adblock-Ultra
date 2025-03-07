// Define rules for blocking ads
chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "*://*/*ads*",
          resourceTypes: ["script", "image", "stylesheet"]
        }
      },
      {
        id: 2,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "*://*/*advert*",
          resourceTypes: ["script", "image", "stylesheet"]
        }
      }
    ],
    removeRuleIds: [1, 2]
  });
  
  // Log a message to confirm the ad blocker is running
  console.log("Ultimate Adblocker is now active!");
  