let isHidingShortsTimeoutActive = false;
let timeoutId = -1;
let hidingShortsTimeoutTimeMs = 500;


function hidingShortsTimeout(callback) {
    if (isHidingShortsTimeoutActive) return;

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
