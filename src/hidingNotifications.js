let notificationsObserver = null;

function _defaultValues(value) {
    if (value.hideYTShortsNotifications == undefined)
        chrome.storage.local.set({ hideYTShortsNotifications: true });
}

function setupHidingNotificationsObserver() {
    chrome.storage.local.get(null, function (value) {
        _defaultValues(value);

        notificationsObserver = manageObserver("ytd-popup-container",
            value.hideYTShortsNotifications,
            (mutationList, observer) => {
                for (const mutation of mutationList) {
                    if (mutation.type === "childList" && mutation.target.tagName.toLowerCase() == DESKTOP_NOTIFICATION_RENDERER) {
                        if (mutation.target.querySelector(SHORTS_HREF_SELECTOR) != null)
                            hideElement(true, mutation.target);
                    }
                }
            },
            notificationsObserver,
            { childList: true, subtree: true }
        );

        const popupContainer = document.querySelector("ytd-popup-container")
        if (popupContainer != null) {
            const nRenderers = popupContainer.querySelectorAll(DESKTOP_NOTIFICATION_RENDERER)
            nRenderers.forEach((v) => {
                if (v.querySelector(SHORTS_HREF_SELECTOR) != null)
                    hideElement(value.hideYTShortsNotifications, v)
            })
        }

    });
}


