let subscriptionPageOpenObserver = null;
let pageManagerNode = null;

function _defaultValues(value) {
    if (value.subscriptionShelfCloseButton == undefined)
        chrome.storage.local.set({ subscriptionShelfCloseButton: false });
}

function setupCloseShelfButtonOnSubscriptionPage() {
    chrome.storage.local.get(null, function (value) {
        _defaultValues(value);

        if (value.subscriptionShelfCloseButton) {
            waitForElementTimeout("#page-manager", document.body, { timeout_ms: 5000 }).then((wrapperElement1) => {
                pageManagerNode = wrapperElement1;
                /* MutationObserver for Subscription page when got opened/closed */
                waitForElement("ytd-browse[page-subtype='subscriptions']", pageManagerNode, { childList: true, subtree: false }).then((wrapperElement2) => {
                    _createOpenCloseSubscriptionPageObserver(wrapperElement2);
                });
            });
        }
    });
}

function _createOpenCloseSubscriptionPageObserver(node) {
    _addingCloseButtonForShelfOnSubscriptionsPage(node);
    subscriptionPageOpenObserver = manageObserver("ytd-browse[page-subtype='subscriptions']",
        true,
        () => { _addingCloseButtonForShelfOnSubscriptionsPage(node); },
        subscriptionPageOpenObserver,
        { attributes: true });
}

// the button will temporarly remove shelf from subscription page till next page reload
function _addingCloseButtonForShelfOnSubscriptionsPage(subscriptionNode) {
    // find one eather on grid mode or list mode
    waitForElementTimeout("ytd-rich-shelf-renderer, ytd-reel-shelf-renderer", subscriptionNode, { timeout_ms: 5000 }).then((element) => {
        if (element != null && element.querySelector("div[id='shelfCloseButton']") == null)
            insertCloseShelfButton(element.querySelector("[id=flexible-item-buttons]"));
    });
}
