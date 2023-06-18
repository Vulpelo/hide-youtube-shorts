let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;
let isHidingShortsTimeoutActive = false;

let hidingShortsTimeoutActive = false;
let hidingShortsTimeoutTimeMs = 500;

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
const SHELF_ITEM_TAG_REGEX = /yt[dm]-reel-item-renderer/gm


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
  setTimeout(() => {
    callback();
    isHidingShortsTimeoutActive = false;
  }, timeMs);
}


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

    if (value.rearrangeVideosAfterHidingAShort == undefined)
      chrome.storage.local.set({ rearrangeVideosAfterHidingAShort: dOperationsAfterHidingElement.rearrangeVideosAfterHidingAShort });
    else
      dOperationsAfterHidingElement.rearrangeVideosAfterHidingAShort = value.rearrangeVideosAfterHidingAShort;

    if (value.hidingShortsTimeoutTimeMs == undefined)
      chrome.storage.local.set({ hidingShortsTimeoutTimeMs: hidingShortsTimeoutTimeMs });
    else
      hidingShortsTimeoutTimeMs = value.hidingShortsTimeoutTimeMs;

    if (value.hidingShortsTimeoutActive == undefined)
      chrome.storage.local.set({ hidingShortsTimeoutActive: hidingShortsTimeoutActive });
    else
      hidingShortsTimeoutActive = value.hidingShortsTimeoutActive;


    if (isMobile) {
      const mHideShorts =
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
          }
      mHideShorts();

      observer = manageObserver("#app",
        hideYTShortsTab || hideYTShortsVideos,
        mHideShorts,
        observer);
    }
    else {
      const dHidingShorts =
        hidingShortsTimeoutActive ?
          () => {
            hidingShortsTimeout(() => {
              hideShorts(hideYTShortsVideos);
            }, hidingShortsTimeoutTimeMs);
          }
          :
          () => {
            hideShorts(hideYTShortsVideos);
          }
      dHidingShorts();
      hideShortsTab(hideYTShortsTab);

      observer = manageObserver("#content",
        hideYTShortsVideos,
        dHidingShorts,
        observer);
    }
  });
}

function hideShorts(hide = true) {
  console.log("Hiding!");
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
      && element.innerHTML.search(SHELF_ITEM_TAG_REGEX) != -1)
      || element.innerHTML.search("href=\"/shorts/") != -1) {
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
