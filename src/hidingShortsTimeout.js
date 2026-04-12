let isHidingShortsTimeoutActive = false;
let timeoutId = -1;
let hidingShortsTimeoutTimeMs = 500;


function hidingShortsTimeout(callback) {
    if (isHidingShortsTimeoutActive) return;

    chrome.storage.local.get(null, function (value) {
        if (value.hidingShortsTimeoutTimeMs == undefined)
            chrome.storage.local.set({ hidingShortsTimeoutTimeMs: hidingShortsTimeoutTimeMs });
        else if (hidingShortsTimeoutTimeMs != value.hidingShortsTimeoutTimeMs) {
            clearShortsTimeout();
            hidingShortsTimeoutTimeMs = value.hidingShortsTimeoutTimeMs;
        }
    });

    isHidingShortsTimeoutActive = true;
    timeoutId = setTimeout(() => {
        callback();
        isHidingShortsTimeoutActive = false;
    }, hidingShortsTimeoutTimeMs);
}

function clearShortsTimeout() {
    clearTimeout(timeoutId);
    isHidingShortsTimeoutActive = false;
}
