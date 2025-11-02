const urlPattern = /https?:\/\/(www|m)\.youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
let shortsInOriginalVideoPlayer = false;
const isFirefoxMobile = /Android.+Firefox\//.test(navigator.userAgent);

function onTabUpdated(tabId, changeInfo, x) {
    if (!shortsInOriginalVideoPlayer || !changeInfo.url) return;
    const found = changeInfo.url.match(urlPattern);
    if (found) {
        const settings = {
            url: `https://${found[1]}.youtube.com/watch?v=${found[2]}`,
        }
        if (isFirefoxMobile) {
            chrome.tabs.update(tabId, settings);
        }
        else {
            chrome.tabs.update(tabId, { ...settings, loadReplace: true} );
        }
    }
}

function setupBackground() {
    chrome.storage.local.get(null, function (value) {
        if (value.shortsInOriginalVideoPlayer == undefined)
            chrome.storage.local.set({ shortsInOriginalVideoPlayer: shortsInOriginalVideoPlayer });
        shortsInOriginalVideoPlayer = value.shortsInOriginalVideoPlayer
            
        if (shortsInOriginalVideoPlayer) {
            if (!chrome.tabs.onUpdated.hasListener(onTabUpdated)) {
                if (isFirefoxMobile) {
                    chrome.tabs.onUpdated.addListener(onTabUpdated);
                }
                else {
                    chrome.tabs.onUpdated.addListener(onTabUpdated, { 
                        urls: ["https://*.youtube.com/shorts/*"] });
                }
            }
        }
        else {
            if (chrome.tabs.onUpdated.hasListener(onTabUpdated)) {
                chrome.tabs.onUpdated.removeListener(onTabUpdated);
            }
        }
    });
}

chrome.storage.onChanged.addListener(function () {
    setupBackground()
});

setupBackground()
