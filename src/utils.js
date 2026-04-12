function waitForElement(selector, observeElement = document.body, { childList = true, subtree = true } = {}) {
    return new Promise(resolve => {
        let element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }
        const elementObserver = new MutationObserver(() => {
            element = document.querySelector(selector);
            if (element) {
                resolve(element);
                elementObserver.disconnect();
            }
        });
        elementObserver.observe(observeElement, { childList: childList, subtree: subtree });
    });
}

function waitForElementTimeout(selector, observeElement = document.body, { childList = true, subtree = true, timeout_ms = 150 } = {}) {
    return new Promise(resolve => {
        let element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }
        let timer = null;
        const elementObserver = new MutationObserver(() => {
            element = document.querySelector(selector);
            if (element) {
                clearTimeout(timer);
                resolve(element);
                elementObserver.disconnect();
            }
        });
        elementObserver.observe(observeElement, { childList: childList, subtree: subtree });
        if (timeout_ms > 0)
            timer = setTimeout(() => {
                resolve(null);
                elementObserver.disconnect();
            }, timeout_ms);
    });
}

function hideElement(hide, element, onHideCallback = () => { }) {
    if (hide) {
        if (!element.hasAttribute("hidden")) {
            element.setAttribute("hidden", true);
            onHideCallback()
        }
    }
    else if (element.hasAttribute("hidden")) {
        element.removeAttribute("hidden");
    }
}

function manageObserver(selector, active, callback, aObserver = null, { childList = false, subtree = false, attributes = false } = {}) {
    if (aObserver === null && active) {
        waitForElement(selector, document.body).then((node) => {
            aObserver = new MutationObserver(callback);
            aObserver.observe(node, { childList: childList, subtree: subtree, attributes: attributes });
        });
    }
    else if (aObserver !== null && !active) {
        aObserver.disconnect();
        aObserver = null;
    }
    return aObserver;
}
