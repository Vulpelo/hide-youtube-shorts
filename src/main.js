let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;
let isHidingShortsTimeoutActive = false;

let timeoutId = -1;
let hidingShortsTimeoutActive = false;
let hidingShortsTimeoutTimeMs = 500;

let hidingShortsOnPathNames = [
  { name: "channelPage", active: true, reg: /@[^\/]*(\/featured)?$/},
  { name: "channelShortTabPage", active: false, reg: /^\/@[^\/]*\/shorts$/},
  { name: "searchPage", active: true, reg: /^\/results$/},
  { name: "homePage", active: true, reg: /^\/$/},
  { name: "subscriptionPage", active: true, reg: /^\/feed\/subscriptions$/}
];

/* ON DESKTOP */
let dOperationsAfterHidingElement = new OperationsAfterHidingElement();
// hiding videos on Search page, videos in list mode on subscription page 
let dHideVideoRenderer = new HidingShortsWithContainer("ytd-video-renderer", "ytd-shelf-renderer");
// to hide videos/containers on Home page, Subscription page, Search page, Video page
const REST_DESKTOP_SHORTS_CONTAINERS_TAG = [
  // shelf containing multiple shorts on Search page
  ["ytd-reel-shelf-renderer"],
  // shelf containing multiple shorts on Home page 
  ["ytd-rich-shelf-renderer"],

  // videos on Home page
  ["ytd-rich-item-renderer"],
  // videos in grid mode on Subscription page
  ["ytd-grid-video-renderer"],
  // videos on Video page
  ["ytd-compact-video-renderer"],
].join(",")
const DESKTOP_SHORTS_TAB_SELECTOR = "ytd-guide-entry-renderer>a:not([href])"
const DESKTOP_SHORTS_MINI_TAB_SELECTOR = "ytd-mini-guide-entry-renderer>a:not([href])"
const DESKTOP_GUIDE_WRAPPER_SELECTOR = "div[id='guide-wrapper']";
const DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR = "ytd-mini-guide-renderer";

/* ON MOBILE */
let isMobile = location.hostname == "m.youtube.com";
const MOBILE_SHORTS_CONTAINERS_TAG = [
  // shelf containing multiple shorts on Search page
  ["ytm-reel-shelf-renderer"],

  // videos on Home page
  ["ytm-rich-item-renderer"],
  // videos on Subscription page
  ["div[tab-identifier='FEsubscriptions']>ytm-section-list-renderer>lazy-list>ytm-item-section-renderer"],
  // videos on Search page and Video page
  ["ytm-video-with-context-renderer"],
].join(",")
const MOBILE_SHORTS_TAB_SELECTOR = "ytm-pivot-bar-item-renderer>div[class='pivot-bar-item-tab pivot-shorts']"

/* on desktop and mobile */
const SHELF_TAG_REGEX = /yt[dm]-reel-shelf-renderer/gm
const SHELF_ITEM_TAG_SELECTOR = "ytd-reel-item-renderer,ytm-reel-item-renderer";


function waitForElement(selector, observeElement = document.body) {
  return new Promise(resolve => {
    let element = document.querySelector(selector);
    if (element) {
      return resolve(document.querySelector(selector));
    }
    const elementObserver = new MutationObserver(() => {
      element = document.querySelector(selector);
      if (element) {
        resolve(element);
        elementObserver.disconnect();
      }
    });
    elementObserver.observe(observeElement, { childList: true, subtree: true });
  });
}

function hideElement(hide, element) {
  if (hide) {
    element.setAttribute("hidden", true);
  }
  else if (element.hasAttribute("hidden")) {
    element.removeAttribute("hidden");
  }
}

function hidingShortsTimeout(callback, timeMs) {
  if (isHidingShortsTimeoutActive) return;
  isHidingShortsTimeoutActive = true;
  timeoutId = setTimeout(() => {
    callback();
    isHidingShortsTimeoutActive = false;
  }, timeMs);
}

function clearShortsTimeout() {
  clearTimeout(timeoutId);
  isHidingShortsTimeoutActive = false;
}

let hideShortsCallbackInner = () => {};
function hideShortsCallback() { hideShortsCallbackInner(); };

function setup() {
  chrome.storage.local.get(null, function (value) {
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
    hidingShortsOnPathNames.find(a => a.name == "homePage").active = value.hideYTShortsHome;

    if (value.hideYTShortsVideosOnSubscriptionPage == undefined)
      chrome.storage.local.set({ hideYTShortsVideosOnSubscriptionPage: true });
    hidingShortsOnPathNames.find(a => a.name == "subscriptionPage").active = value.hideYTShortsVideosOnSubscriptionPage;

    if (value.hideYTShortsVideosOnSearchPage == undefined)
      chrome.storage.local.set({ hideYTShortsVideosOnSearchPage: true });
    hidingShortsOnPathNames.find(a => a.name == "searchPage").active = value.hideYTShortsVideosOnSearchPage;

    if (value.hideYTShortsVideosOnChannelPage == undefined)
      chrome.storage.local.set({ hideYTShortsVideosOnChannelPage: true });
    hidingShortsOnPathNames.find(a => a.name == "channelPage").active = value.hideYTShortsVideosOnChannelPage;

    if (value.hidingShortsTimeoutTimeMs == undefined)
      chrome.storage.local.set({ hidingShortsTimeoutTimeMs: hidingShortsTimeoutTimeMs });
    else if (hidingShortsTimeoutTimeMs != value.hidingShortsTimeoutTimeMs) {
      clearShortsTimeout();
      hidingShortsTimeoutTimeMs = value.hidingShortsTimeoutTimeMs;
    }

    if (value.hidingShortsTimeoutActive == undefined)
      chrome.storage.local.set({ hidingShortsTimeoutActive: hidingShortsTimeoutActive });
    else if (hidingShortsTimeoutActive != value.hidingShortsTimeoutActive) {
      clearShortsTimeout();
      hidingShortsTimeoutActive = value.hidingShortsTimeoutActive;
    }


    if (isMobile) {
      hideShortsCallbackInner =
        hidingShortsTimeoutActive ?
          () => {
            hidingShortsTimeout(() => {
              hideShorts(hideYTShortsVideos);
              hideShortsTab(hideYTShortsTab);
            }, hidingShortsTimeoutTimeMs);
          }
          :
          () => {
            hideShorts(hideYTShortsVideos);
            hideShortsTab(hideYTShortsTab);
          };
      hideShortsCallbackInner();

      observer = manageObserver("#app",
        hideYTShortsTab || hideYTShortsVideos,
        hideShortsCallback,
        observer);
    }
    else {
      hideShortsCallbackInner =
        hidingShortsTimeoutActive ?
          () => {
            hidingShortsTimeout(() => {
              hideShorts(hideYTShortsVideos);
            }, hidingShortsTimeoutTimeMs);
          }
          :
          () => {
            hideShorts(hideYTShortsVideos);
          };
      hideShortsCallbackInner();
      hideShortsTab(hideYTShortsTab);

      observer = manageObserver("#content",
        hideYTShortsVideos,
        hideShortsCallback,
        observer);
    }
  });
}

function isLocationPathNameToIgnore() {
  const pathName = location.pathname;
  for (let i = 0; i<hidingShortsOnPathNames.length; i++) {
    if (hidingShortsOnPathNames[i].active == false && pathName.match(hidingShortsOnPathNames[i].reg))
      return true;
  }
  return false;
}

function hideShorts(hide = true) {
  if (isLocationPathNameToIgnore())
    return;

  let selectorString = isMobile ?
    MOBILE_SHORTS_CONTAINERS_TAG
    : REST_DESKTOP_SHORTS_CONTAINERS_TAG + "," + dHideVideoRenderer.elementTagName;
  elements = document.querySelectorAll(selectorString);
  elements.forEach(element => {

    if (element.tagName.toLowerCase().match(dHideVideoRenderer.elementTagName)) {
      if (hide) {
        dHideVideoRenderer.hideShort(element);
      }
      else {
        dHideVideoRenderer.showShort(element);
      }
    }
    // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
    // and hide any video container that contains a ref link to shorts
    else if ((element.tagName.toLowerCase().match(SHELF_TAG_REGEX)
      && element.querySelector(SHELF_ITEM_TAG_SELECTOR) != null)
      || element.querySelector('[href^="/shorts/"]') != null) {
      if (hide) {
        if (!element.hasAttribute("hidden")) {
          element.setAttribute("hidden", true);
          dOperationsAfterHidingElement.doOperations(element);
        }
      }
      else if (element.hasAttribute("hidden")) {
        element.removeAttribute("hidden");
      }
    }
  });
}

function hideShortsTab(hide) {
  if (isMobile) {
    let element = document.querySelector(MOBILE_SHORTS_TAB_SELECTOR);
    if (element)
      hideElement(hide, element.parentElement)
  }
  else {
    waitForElement(DESKTOP_GUIDE_WRAPPER_SELECTOR, document.body).then((wrapperElement) => {
      waitForElement(DESKTOP_SHORTS_TAB_SELECTOR, wrapperElement).then((element) => {
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
}

function manageObserver(selector, active, callback, aObserver = null) {
  if (aObserver === null && active) {
    waitForElement(selector, document.body).then((node) => {
      aObserver = new MutationObserver(callback);
      aObserver.observe(node, { childList: true, subtree: true });
    });
  }
  else if (aObserver !== null && !active) {
    aObserver.disconnect();
    aObserver = null;
  }
  return aObserver;
}

chrome.storage.onChanged.addListener(function () {
  setup();
});

setup();
