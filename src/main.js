let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = true;

let hidingShortsTimeoutActive = false;

let hidingShortVideosActive = false;
let hidingShortVideosTimeSeconds = 20;

let hideYTPlayables = false

const isMobile = location.hostname == "m.youtube.com";

const hidingShortsOnPathNames = {
    homePage: { active: true, reg: /^\/$/, nodeSelector: "ytd-browse[page-subtype='home']", node: null },
    subscriptionPage: { active: true, reg: /^\/feed\/subscriptions$/, nodeSelector: "ytd-browse[page-subtype='subscriptions']", node: null },
    searchPage: { active: true, reg: /^\/results$/, nodeSelector: "ytd-search", node: null },
    channelPage: { active: true, reg: /@[^\/]*(\/featured|\/search[^\/]*)?$/, nodeSelector: "ytd-browse[page-subtype='channels']", node: null },
    channelShortTabPage: { active: false, reg: /^\/@[^\/]*\/shorts$/, nodeSelector: "", node: null },
    // for hiding short videos on whole channel page
    channelPageNotHome: { active: false, reg: /@[^\/]*\/((?!featured).)*$/, nodeSelector: "ytd-browse[page-subtype='channels']", node: null }
};

// to hide videos/containers on Home page, Subscription page, Search page, Video page
const REST_SHORTS_CONTAINERS_TAG = isMobile ? [
    // shelf containing multiple shorts on Search page
    ["ytm-reel-shelf-renderer"],

    // videos on Home page
    ["ytm-rich-item-renderer"],
    // videos on Subscription page
    ["div[tab-identifier='FEsubscriptions']>ytm-section-list-renderer>lazy-list>ytm-item-section-renderer"],
    // videos in grid mode
    ["ytm-grid-video-renderer"],
    // videos on Search page and Video page
    ["ytm-video-with-context-renderer"]
].join(",") : [
    // shelf containing multiple shorts on Search page
    ["ytd-reel-shelf-renderer"],
    // extendable shelf with shorts on Search page
    ["grid-shelf-view-model"],
    // shelf containing multiple shorts on Home page
    ["ytd-rich-section-renderer:has(>div>ytd-rich-shelf-renderer)"],
    // container of videos on home/subscription page (so far only for shorts)
    ["ytd-rich-grid-group"],

    // videos on Home page and subscription page
    ["ytd-rich-item-renderer"],
    // (old) videos in grid mode might still be used
    ["ytd-grid-video-renderer"],
    // videos on Video page
    ["ytd-compact-video-renderer"],
].join(",")


/* ON MOBILE */
// videos in ytm-rich-section-renderer on Home page
const mHidingVideoRenderer = new HidingShortsWithContainer("ytm-shorts-lockup-view-model", "ytm-rich-section-renderer");

/* ON DESKTOP */
const dRearrangeVideosInGrid = new RearrangeVideosInGrid();
// hiding videos on Search page, videos in list mode on subscription page
const dHidingVideoRenderer = new HidingShortsWithContainer("ytd-video-renderer", "ytd-shelf-renderer");
// hiding videos on subscription page in list mode
const dHideVideoRendererSubscriptionPage = new HidingShortsWithContainer("ytd-video-renderer", "ytd-item-section-renderer");
const DESKTOP_SHORTS_MINI_TAB_SELECTOR = "ytd-mini-guide-entry-renderer>a[href='/shorts/']"
const DESKTOP_GUIDE_WRAPPER_SELECTOR = "div[id='guide-wrapper']";
const DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR = "ytd-mini-guide-renderer>div[id='items']";
const DESKTOP_NOTIFICATION_RENDERER = "ytd-notification-renderer";

const SHORTS_TAB_SELECTOR = isMobile ? "ytm-pivot-bar-item-renderer>div[class='pivot-bar-item-tab pivot-shorts']" : "ytd-guide-entry-renderer>a:not([href])"
const SHORTS_HREF_SELECTOR = `[href^="/shorts/"]`;
const PLAYABLES_HREF_SELECTOR = `[href^="/playables"]`;

/* dedicated shelfs for shorts */
const SHELF_TAG_REGEX = /yt[dm]-reel-shelf-renderer/gm
const SHELF_ITEM_TAG_SELECTOR = isMobile ? "ytm-reel-item-renderer" : "ytd-reel-item-renderer";

// Time overlay status on thumbnail
const TIME_OVERLAY_STATUS_TAG = isMobile ? 'ytm-thumbnail-overlay-time-status-renderer' : 'ytd-thumbnail-overlay-time-status-renderer';
const TIME_OVERLAY_STATUS_STYLE_ATTRIBUTE = isMobile ? "data-style" : "overlay-style";

/* Selectors used for searching shorts elements */
let combinedSelectorsToQuery;

let hidingMethodsToExecute = []


let hideShortsCallbackInner = () => { };
function hideShortsCallback() { hideShortsCallbackInner(); };

function loadVariables(value) {
    if (value.hideYTShortsVideos == undefined)
        chrome.storage.local.set({ hideYTShortsVideos: hideYTShortsVideos });
    else
        hideYTShortsVideos = value.hideYTShortsVideos;

    if (value.hideYTShortsTab == undefined)
        chrome.storage.local.set({ hideYTShortsTab: hideYTShortsTab });
    else
        hideYTShortsTab = value.hideYTShortsTab;

    if (value.hideYTShortsHome == undefined)
        chrome.storage.local.set({ hideYTShortsHome: true });
    hidingShortsOnPathNames.homePage.active = value.hideYTShortsHome;

    if (value.hideYTShortsVideosOnSubscriptionPage == undefined)
        chrome.storage.local.set({ hideYTShortsVideosOnSubscriptionPage: true });
    hidingShortsOnPathNames.subscriptionPage.active = value.hideYTShortsVideosOnSubscriptionPage;

    if (value.hideYTShortsVideosOnSearchPage == undefined)
        chrome.storage.local.set({ hideYTShortsVideosOnSearchPage: true });
    hidingShortsOnPathNames.searchPage.active = value.hideYTShortsVideosOnSearchPage;

    if (value.hideYTShortsVideosOnChannelPage == undefined)
        chrome.storage.local.set({ hideYTShortsVideosOnChannelPage: true });
    hidingShortsOnPathNames.channelPage.active = value.hideYTShortsVideosOnChannelPage;

    if (value.hidingShortsTimeoutActive == undefined)
        chrome.storage.local.set({ hidingShortsTimeoutActive: hidingShortsTimeoutActive });
    else if (hidingShortsTimeoutActive != value.hidingShortsTimeoutActive) {
        clearShortsTimeout();
        hidingShortsTimeoutActive = value.hidingShortsTimeoutActive;
    }

    if (value.hidingShortVideosTimeSeconds == undefined)
        chrome.storage.local.set({ hidingShortVideosTimeSeconds: hidingShortVideosTimeSeconds });
    else if (hidingShortVideosTimeSeconds != value.hidingShortVideosTimeSeconds) {
        hidingShortVideosTimeSeconds = value.hidingShortVideosTimeSeconds;
    }

    if (value.hidingShortVideosActive == undefined)
        chrome.storage.local.set({ hidingShortVideosActive: hidingShortVideosActive });
    else if (hidingShortVideosActive != value.hidingShortVideosActive) {
        hidingShortVideosActive = value.hidingShortVideosActive;
    }
    hidingShortsOnPathNames.channelPageNotHome.active = hidingShortVideosActive && hidingShortsOnPathNames.channelPage.active;

    if (value.hideYTPlayables == undefined)
        chrome.storage.local.set({ hideYTPlayables: hideYTPlayables });
    else
        hideYTPlayables = value.hideYTPlayables;
}

function executeMethods() {
    hidingMethodsToExecute.forEach(
        (method) => {
            method.call()
        })
}

function setup() {
    chrome.storage.local.get(null, function (value) {
        loadVariables(value);

        hidingMethodsToExecute = []

        combinedSelectorsToQuery = REST_SHORTS_CONTAINERS_TAG;

        let mainObserverSelector = ""
        let mainObserverActive = false
        if (isMobile) {
            if (hideYTShortsVideos) {
                hidingMethodsToExecute.push(() => hideShortsMobile(hideYTShortsVideos))
            }
            else {
                hideShortsMobile(hideYTShortsVideos)
            }

            if (hideYTShortsTab) {
                hidingMethodsToExecute.push(() => hideShortsTabMobile(hideYTShortsTab))
            }
            else {
                hideShortsTabMobile(hideYTShortsTab)
            }

            mainObserverSelector = "#app"
            mainObserverActive = hideYTShortsTab || hideYTShortsVideos
            combinedSelectorsToQuery += "," + mHidingVideoRenderer.elementTagName
        }
        else {
            if (hideYTShortsVideos || hideYTPlayables) {
                hidingMethodsToExecute.push(() => hideShortsDesktop(hideYTShortsVideos))
            }
            else {
                hideShortsDesktop(hideYTShortsVideos)
            }

            setupCloseShelfButtonOnSubscriptionPage();
            setupHidingNotificationsObserver();

            hideShortsTabDesktop(hideYTShortsTab);

            mainObserverSelector = "#content"
            mainObserverActive = hideYTShortsVideos
            combinedSelectorsToQuery += "," + dHidingVideoRenderer.elementTagName;
        }
        
        hideShortsCallbackInner =
            hidingShortsTimeoutActive ?
                () => { hidingShortsTimeout(executeMethods); }
                : executeMethods;


        observer = manageObserver(mainObserverSelector,
            mainObserverActive || hideYTPlayables,
            hideShortsCallback,
            observer,
            { childList: true, subtree: true });

        setupHidingCustomElements();

        hideShortsCallbackInner();
    });
}

function isLocationPathNameToIgnore() {
    const pathName = location.pathname;
    for (let key in hidingShortsOnPathNames) {
        if (hidingShortsOnPathNames[key].active == false && pathName.match(hidingShortsOnPathNames[key].reg))
            return true;
    }
    return false;
}

function childrenInPageManagerInUnknownPath() {
    if (pageManagerNode == null) return [document.body];
    let finalNodeList = Array.from(pageManagerNode.children);

    for (let key in hidingShortsOnPathNames) {
        if (hidingShortsOnPathNames[key].node == null)
            continue;
        let index = finalNodeList.indexOf(hidingShortsOnPathNames[key].node)
        if (index >= 0)
            finalNodeList.splice(index, 1);
    }
    return finalNodeList;
}

function locationPathNameNodes() {
    const pathName = location.pathname;
    for (let key in hidingShortsOnPathNames) {
        if (hidingShortsOnPathNames[key].node == null && hidingShortsOnPathNames[key].nodeSelector != "")
            hidingShortsOnPathNames[key].node = document.querySelector(hidingShortsOnPathNames[key].nodeSelector);
        if (hidingShortsOnPathNames[key].node != null && pathName.match(hidingShortsOnPathNames[key].reg))
            return [hidingShortsOnPathNames[key].node];
    }
    return childrenInPageManagerInUnknownPath();
}

function hideShortsDesktop(hide = true) {
    if (isLocationPathNameToIgnore())
        return;

    const nodes = locationPathNameNodes();
    for (let i = 0; i < nodes.length; i++) {
        let elements = nodes[i].querySelectorAll(combinedSelectorsToQuery);
        elements.forEach(element => {

            const elementTagName = element.tagName.toLowerCase();

            // subscription page in list mode
            if (location.pathname.match(hidingShortsOnPathNames.subscriptionPage.reg)
                && elementTagName.match(dHideVideoRendererSubscriptionPage.elementTagName)) {
                if (hide) {
                    if (!dHideVideoRendererSubscriptionPage.hideShort(element)) {
                        hideNonShorts(element)
                        hideContainerOfElement("ytd-item-section-renderer", element)
                    }
                }
                else
                    dHideVideoRendererSubscriptionPage.showShort(element);
            }
            // other pages with containers on search page and channel's search
            else if (elementTagName.match(dHidingVideoRenderer.elementTagName)) {
                if (hide) {
                    if (!dHidingVideoRenderer.hideShort(element)) {
                        hideNonShorts(element)
                        hideContainerOfElement("ytd-item-section-renderer", element)
                    }
                }
                else {
                    dHidingVideoRenderer.showShort(element);
                }
            }
            // hide whole shelf if just contains "yt[dm]-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
            // and hide any video container that contains a ref link to shorts
            else if ((elementTagName.match(SHELF_TAG_REGEX)
                && element.querySelector(SHELF_ITEM_TAG_SELECTOR) != null)
                || element.querySelector(SHORTS_HREF_SELECTOR) != null) {
                hideElement(hide, element, () => { dRearrangeVideosInGrid.execute(element) });
            }
            else if (element.querySelector(PLAYABLES_HREF_SELECTOR) != null) {
                hideElement(hideYTPlayables, element, () => { dRearrangeVideosInGrid.execute(element) });
            }
            else if (hide) {
                hideNonShorts(element)
            }
        });
    }
}

function hideShortsMobile(hide = true) {
    if (isLocationPathNameToIgnore())
        return;

    const nodes = locationPathNameNodes();
    for (let i = 0; i < nodes.length; i++) {
        let elements = nodes[i].querySelectorAll(combinedSelectorsToQuery);
        elements.forEach(element => {

            const elementTagName = element.tagName.toLowerCase();

            if (location.pathname.match(hidingShortsOnPathNames.homePage.reg)
                && elementTagName.match(mHidingVideoRenderer.elementTagName)) {
                if (hide) {
                    mHidingVideoRenderer.hideShort(element);
                }
                else {
                    mHidingVideoRenderer.showShort(element);
                }
            }
            // hide whole shelf if just contains "yt[dm]-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
            // and hide any video container that contains a ref link to shorts
            else if ((elementTagName.match(SHELF_TAG_REGEX)
                && element.querySelector(SHELF_ITEM_TAG_SELECTOR) != null)
                || element.querySelector(SHORTS_HREF_SELECTOR) != null) {
                hideElement(hide, element, () => { dRearrangeVideosInGrid.execute(element) });
            }
            else if (element.querySelector(PLAYABLES_HREF_SELECTOR) != null) {
                hideElement(hideYTPlayables, element, () => { dRearrangeVideosInGrid.execute(element) });
            }
            else if (hide) {
                hideNonShorts(element)
            }
        });
    }
}

function hideShortsTabDesktop(hide) {
    waitForElement(DESKTOP_GUIDE_WRAPPER_SELECTOR, document.body).then((wrapperElement) => {
        waitForElement(SHORTS_TAB_SELECTOR, wrapperElement).then((element) => {
            if (element != null)
                hideElement(hide, element)
        });
    });
    waitForElement(DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR, document.body).then((wrapperElement) => {
        waitForElement(DESKTOP_SHORTS_MINI_TAB_SELECTOR, wrapperElement).then((element) => {
            if (element != null)
                hideElement(hide, element)
        });
    });
}

function hideShortsTabMobile(hide) {
    let element = document.querySelector(SHORTS_TAB_SELECTOR);
    if (element)
        hideElement(hide, element.parentElement)
}

chrome.storage.onChanged.addListener(function () {
    setup();
});

setup();
