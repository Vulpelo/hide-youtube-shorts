# Hide YouTube-Shorts

[![Extension's Mozilla Rating](https://img.shields.io/amo/rating/hide-youtube-shorts?color=green&label=Mozilla%20Rating&logo=FirefoxBrowser)](https://addons.mozilla.org/en-US/firefox/addon/hide-youtube-shorts/)
[![Extension's Mozilla users](https://img.shields.io/amo/users/hide-youtube-shorts?label=Mozilla%20Users&logo=FirefoxBrowser)](https://addons.mozilla.org/en-US/firefox/addon/hide-youtube-shorts/)
[![Extension's Chrome Web Store rating](https://img.shields.io/chrome-web-store/rating/ankepacjgoajhjpenegknbefpmfffdic?label=Chrome%20Rating&logo=google%20chrome)](https://chrome.google.com/webstore/detail/hide-shorts-for-youtube/ankepacjgoajhjpenegknbefpmfffdic)
[![Extension's Chrome Web Store users](https://img.shields.io/chrome-web-store/users/ankepacjgoajhjpenegknbefpmfffdic?label=Chrome%20Users&logo=google%20chrome)](https://chrome.google.com/webstore/detail/hide-shorts-for-youtube/ankepacjgoajhjpenegknbefpmfffdic)
[![Licence](https://img.shields.io/github/license/Vulpelo/hide-youtube-shorts)](https://github.com/Vulpelo/hide-youtube-shorts/blob/master/LICENCE.md)

Firefox add-on that hides YouTube-shorts videos from home page, subscriptions and search results. 
Also allows you to hide "Shorts" tab.

## Features

- Hiding Shorts tab
- Hiding Shorts only selected pages (home/subscription/channel/search page)
- Hiding shorts in notifications menu
- Setting a timeout to not allow checking for shorts more often than a specified time (to reduce calling hiding shorts function to reduce page load) (off by default)
- Adds a close button to a section with shorts located on the subscriptions page (off by default)
- Hiding videos that are shorter than specified time (experimental, off by default)
- Hiding live videos (experimental, off by default)
- Hiding 'Upcoming' videos (experimental, off by default)
- Redirect shorts to original video player (experimental, off by default)

## Installation

### Firefox 

Install from [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/hide-youtube-shorts/) webpage

or add the Add-on temporarily:
1. Download the project
2. Rename 'manifest-firefox.json' file to 'manifest.json'
3. In Firefox browser go to the debugging page by typing in url <b>[about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)</b>
4. Click on <b>Load Temporary Add-on...</b>
5. Select a file (eg. 'manifest.json' file) inside of downloaded git project. Or you can ZIP contents of the project and select it instead.

### Google Chrome

Install from [Chrome web store](https://chrome.google.com/webstore/detail/hide-shorts-for-youtube/ankepacjgoajhjpenegknbefpmfffdic) webpage

or add the Add-on manually:
1. Download the project
2. Rename 'manifest-chrome.json' file to 'manifest.json'
3. In Chrome browser go to the Extensions page (or type in url <b>[chrome://extensions/](chrome://extensions/)</b>)
4. Enable the <b>Developer Mode</b>
5. Click the <b>Load unpacked</b> button
6. Select the directory of downloaded git project.

## License

[GPL-3.0](https://github.com/Vulpelo/hide-youtube-shorts/blob/master/LICENCE.md)

# FAQ
- Going "Back" in navigation again redirects tab to the original video player
    - Chrome and Firefox on Android don't support [loadReplace option](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update), meaning that clicking "Back" button will direct to the original video URL (not the page from which video was clicked on). This will then again redirect the page. You can click and hold the back button to display list of previous pages and select desired page from here. 
- After addon installation shorts are still visible on youtube's page
    - It is also required to refresh the youtube's page in order for the scripts to load.
- After a while youtube starts slowing down
    - Extension hides (not removes) shorts and their containers so they still take up some memory. Depending on how many shorts got hidden the website can start slowing down. Refreshing the page will clean up website from leftover elements.
