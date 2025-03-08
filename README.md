# Adblock Ultra

Adblock Ultra is a cutting-edge browser extension designed to block intrusive ads, popups, and trackers while safeguarding your privacy and improving your browsing experience. Built on Manifest Version 3 (MV3), this lightweight extension provides advanced filtering capabilities, dynamic popup detection, and WebRTC request blocking.

## Features

- 🚫 **Ad Blocking**: Automatically blocks ads, banners, and sponsored content from your favorite websites.
- 🛑 **Popup Detection**: Dynamically detects and blocks annoying popups without interrupting your browsing.
- 🔒 **Privacy Protection**: Prevents tracking by blocking analytics and fingerprinting attempts, including WebRTC requests.
- ⚡ **Performance Optimization**: Includes caching for ad requests, ensuring efficient filtering and a faster browsing experience.
- 🎯 **Customizable Rules**: Uses declarative rules to block specific ad networks and patterns.
- ✨ **Real-Time DOM Manipulation**: Removes ad elements and suspicious content directly from the webpage.
- 📊 **Developer-Friendly**: Includes logging functionality to debug and monitor blocked content.

## How It Works

1. **Declarative Rules**:
   - Predefined blocking rules are set in the `rules.json` file to target known ad networks and trackers.
   - Uses the `declarativeNetRequest` API to block ad-related network requests efficiently.

2. **Dynamic Popup Detection**:
   - Listens for new tabs or navigation events to identify and block ad-like URLs in real-time.
   - Collaborates with content scripts for advanced DOM analysis.

3. **WebRTC Blocking**:
   - Intercepts WebRTC requests and blocks those originating from tracking or ad sources.

4. **Content Script Integration**:
   - Scans and removes embedded ads and suspicious elements from the webpage DOM.

## Installation

### For Development
1. Clone this repository:
   ```bash
   git clone https://github.com/ScreamingQQ/Adblock-Ultra.git
   cd Adblock-Ultra

2. Open your browser and navigate to the extensions page:
- Chrome: Go to `chrome://extensions/`
- Edge: Go to `edge://extensions/`
3. Enable Developer Mode.
4. Click **Load unpacked** and select the `Adblock-Ultra` directory.
### Files and Structure

``` 
Adblock-Ultra/
├── content-script.js   # Handles DOM analysis and popup detection
├── service-worker.js   # Background logic for ad and popup filtering
├── manifest.json       # Extension configuration
├── rules.json          # Declarative rules for ad blocking
├── icon16.png          # 16x16 extension icon
├── icon48.png          # 48x48 extension icon
├── icon128.png         # 128x128 extension icon
└── README.md           # Documentation
```

### Configuration
`manifest.json`
>
This file contains the core configuration of the extension, including permissions, host access, and script references.
>
`rules.json`
>
Defines the declarative rules used to block down known ad networks and trackers. You can update this file to add or modify blocking rules.
### Example Rule:
>
<!NOTE>
>Json
```{
  "id": 1,
  "priority": 1,
  "action": {
    "type": "block"
  },
  "condition": {
    "urlFilter": "*://*ads/*",
    "resourceTypes": ["main_frame", "sub_frame"]
  }
}
```
### Development Notes
- `declarativeNetRequest`: Efficiently blocks network requests based on predefined rules.
- `tabs`: **API**: Listens for tab creation and navigation events to detect popups.
- `runtime` **API**: Facilitates communication between the service worker and content scripts.
### Debugging
Use the console to monitor the service worker and detect blocked content:
1. Go to `chrome://extensions/` (or `edge://extensions/`).
2. Find **Adblock Ultra** and click `Service Worker` under "Inspect views."
3. Check for logged details about blocked URLs and potential errors.
### Contributing
We welcome contributions! If you find a bug or have ideas for new features, feel free to:
- Open an issue
- Submit a pull request