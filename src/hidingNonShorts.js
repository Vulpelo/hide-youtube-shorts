const isMobile = location.hostname == "m.youtube.com";

// Hide video types
const LIVE = "LIVE"
const UPCOMING = "UPCOMING"
let hidingVideoTypes = []

// Time overlay status on thumbnail
const TIME_OVERLAY_STATUS_TAG = isMobile ? 'ytm-thumbnail-overlay-time-status-renderer' : 'ytd-thumbnail-overlay-time-status-renderer';

// Hide custom elements
const MOBILE_POSTS_RENDERER = "ytm-rich-section-renderer:has(>div>ytm-backstage-post-thread-renderer)";

// Selector for upcoming video text badges (without icons)
const UPCOMING_BADGE_SELECTOR = 
    "badge-shape.yt-badge-shape--thumbnail-default:has(div.yt-badge-shape__text):not(:has(div.yt-badge-shape__icon))," // v1
    + "badge-shape.ytBadgeShapeThumbnailDefault:has(div.ytBadgeShapeText):not(:has(div.ytBadgeShapeIcon))"; // v2
const NOTIFICATION_BUTTON_SELECTOR = "toggle-button-view-model" // v1/2
const TIME_STATUS_SELECTOR = 
    "badge-shape.yt-badge-shape--thumbnail-default>div.yt-badge-shape__text," // v1
    + "badge-shape.ytBadgeShapeThumbnailDefault>div.ytBadgeShapeText"; // v2
const LIVE_BADGE_SELECTOR = 
    "yt-thumbnail-badge-view-model>badge-shape.badge-shape-wiz--thumbnail-live,ytd-badge-supported-renderer>div.badge-style-type-live-now-alternate," // v1
    + "yt-thumbnail-badge-view-model>badge-shape.yt-badge-shape--thumbnail-live,yt-thumbnail-badge-view-model>badge-shape.ytBadgeShapeThumbnailLive"; // v2

let hideCustomElements = ""

function _defaultValues(value) {
    if (value.hidingLiveVideosActive == undefined)
        chrome.storage.local.set({ hidingLiveVideosActive: false });

    if (value.hidingUpcomingVideosActive == undefined)
        chrome.storage.local.set({ hidingUpcomingVideosActive: false });

    if (value.userDefinedElementsToHide == undefined)
        chrome.storage.local.set({ userDefinedElementsToHide: "" });

    if (value.hidingCustomElementsActive == undefined)
        chrome.storage.local.set({ hidingCustomElementsActive: false });

    if (value.hidingPostsActive == undefined)
        chrome.storage.local.set({ hidingPostsActive: false });
}

function setupHidingCustomElements() {
    chrome.storage.local.get(null, function (value) {
        _defaultValues(value);

        hidingVideoTypes = []
        if (value.hidingLiveVideosActive === true)
            hidingVideoTypes.push(LIVE)
        if (value.hidingUpcomingVideosActive === true)
            hidingVideoTypes.push(UPCOMING)

        let newHideCustomElements = "";
        if (isMobile && value.hidingPostsActive) {
            newHideCustomElements = MOBILE_POSTS_RENDERER;
        }

        if (value.hidingCustomElementsActive && value.userDefinedElementsToHide != "") {
            if (newHideCustomElements != "") newHideCustomElements = newHideCustomElements + ","
            newHideCustomElements = newHideCustomElements + formatUserDefinedElements(value.userDefinedElementsToHide)
        }

        if (newHideCustomElements != "") {
            hidingMethodsToExecute.push(() => _hideCustom(true));
        }
        if (newHideCustomElements != hideCustomElements) {
            if (hideCustomElements != "" && hideCustomElements != "") {
                _hideCustom(false);
            }
            hideCustomElements = newHideCustomElements;
        }
    });
}

function formatUserDefinedElements(userDefinedElementsToHide) {
    formatted = ""
    let lines = userDefinedElementsToHide.split('\n')
    for (let i = 0; i<lines.length; i += 1) {
        lines[i] = lines[i].trim()
        if (lines[i].length === 0 || lines[i].startsWith('//')) continue

        formatted += "," + lines[i]
    }
    if (formatted.length === 0) return ""
    return formatted.substr(1)
}

function _hideCustom(hide = true) {
    try {
        document.querySelectorAll(hideCustomElements).forEach((element) => {
            hideElement(hide, element)
        })
    } catch (error) { }
}

function hideNonShorts(element) {
    // Hide videos that are too short
    if (hidingShortVideosActive) {
        _hideVideoIfBelowLength(element, hidingShortVideosTimeSeconds)
    }
    // Hide videos of type
    if (hidingVideoTypes.length > 0)
        _hideVideoIfOfType(hidingVideoTypes, element)
}

function _hideVideoIfOfType(types, element) {
    if (_shouldHideVideoOfType(types, element))
        hideElement(true, element, () => { dRearrangeVideosInGrid.execute(element) });
}

function _shouldHideVideoOfType(types, element) {
    const timeOverlay = element.querySelector(TIME_OVERLAY_STATUS_TAG);
    let toHide = false;
    if (timeOverlay === null) {
        if (types.includes("UPCOMING")) {
            const upcomingBadge = element.querySelector(UPCOMING_BADGE_SELECTOR);
            const notificationButton = element.querySelector(NOTIFICATION_BUTTON_SELECTOR);
            const timeStatuses = element.querySelectorAll(TIME_STATUS_SELECTOR);
            let nonHaveTimeStatus = true;
            timeStatuses.forEach(timeStatus => {
                if (timeStatus.textContent && timeStatus.textContent.trim().match(/^([0-9]:[0-9]|[0-9])+$/)) {
                    nonHaveTimeStatus = false;
                    return;
                }
            });
            if (upcomingBadge !== null && notificationButton !== null && timeStatuses.length > 0 && nonHaveTimeStatus) {
                toHide = true;
            }
        }

        if (!toHide && types.includes("LIVE")) {
            // on home/subscription pages, live videos have different tree and tags
            const liveBadgeOverlay = element.querySelector(LIVE_BADGE_SELECTOR);
            toHide = liveBadgeOverlay !== null;
        }
    }
    else if (timeOverlay.hasAttribute("overlay-style") && types.includes(timeOverlay.getAttribute("overlay-style"))) {
        toHide = true;
    }
    return toHide;
}

function _hideVideoIfBelowLength(element, minLengthSeconds) {
    if (_shouldHideVideoBelowLength(element, minLengthSeconds)) {
        hideElement(true, element, () => { dRearrangeVideosInGrid.execute(element) });
    }
}

function _shouldHideVideoBelowLength(element, minLengthSeconds) {
    const timeStatus = element.querySelector('.badge-shape-wiz__text,.yt-badge-shape__text')
    if (timeStatus != null) {
        const time = timeStatus.textContent.trim().split(':').reverse()
        const seconds = Number(time[0])
            + (time.length > 1 ? Number(time[1]) * 60 : 0)
            + (time.length > 2 ? Number(time[2]) * 3600 : 0)
        if (seconds != NaN && seconds <= minLengthSeconds) {
            return true;
        }
    }
    return false;
}

if (typeof module === 'object') {
    module.exports = {_shouldHideVideoOfType, _shouldHideVideoBelowLength}
}