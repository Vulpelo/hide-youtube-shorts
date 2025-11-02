const urlPattern = /https?:\/\/(www|m)\.youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
let shortsInOriginalVideoPlayer = false;

function onTabUpdated(tabId, changeInfo, x) {
    if (!shortsInOriginalVideoPlayer || !changeInfo.url) return;
    const found = changeInfo.url.match(urlPattern);
    if (found) {
        chrome.tabs.update(tabId, {
            url: `https://${found[1]}.youtube.com/watch?v=${found[2]}`
            });
    }
}

function setupBackground() {
    chrome.storage.local.get(null, function (value) {
        if (value.shortsInOriginalVideoPlayer == undefined)
            chrome.storage.local.set({ shortsInOriginalVideoPlayer: shortsInOriginalVideoPlayer });
        shortsInOriginalVideoPlayer = value.shortsInOriginalVideoPlayer
            
        if (shortsInOriginalVideoPlayer) {
            if (!chrome.tabs.onUpdated.hasListener(onTabUpdated)) {
                chrome.tabs.onUpdated.addListener(onTabUpdated);
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
