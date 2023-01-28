let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;

/* ON DESKTROP */
const DESKTOP_SHORTS_CONTAINERS_TAG = [
  // videos on Home page
  ["ytd-rich-item-renderer"],
  // videos on Subscription page
  ["ytd-grid-video-renderer"], 
  // videos on Search page
  ["ytd-video-renderer"], 
  // videos on Video page
  ["ytd-compact-video-renderer"],
].join(",")
const DESKTOP_SHELF_TAG = "ytd-reel-shelf-renderer"
const DESKTOP_SHORTS_TAB_SELECTOR = "ytd-guide-entry-renderer>a:not([href])"
const DESKTOP_SHORTS_MINI_TAB_SELECTOR = "ytd-mini-guide-entry-renderer>a:not([href])"

/* ON MOBILE */
let isMobile = location.hostname == "m.youtube.com";
const MOBILE_SHORTS_CONTAINERS_TAG = [
  // videos on Home page
  ["ytm-rich-item-renderer"], 
  // videos on Subscription page
  ["div[tab-identifier='FEsubscriptions']>ytm-section-list-renderer>lazy-list>ytm-item-section-renderer"], 
  // videos on Search page and Video page
  ["ytm-video-with-context-renderer"],
].join(",")
const MOBILE_SHELF_TAG = "ytm-reel-shelf-renderer"
const MOBILE_SHORTS_TAB_SELECTOR = "ytm-pivot-bar-item-renderer>div[class='pivot-bar-item-tab pivot-shorts']"

/* on desktop and mobile */
const SHELF_TAG_REGEX = /yt[dm]-reel-shelf-renderer/gm
const SHELF_ITEM_TAG_REGEX = /yt[dm]-reel-item-renderer/gm


function waitForElement(selector, timeout_ms = 5000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      resolve(null);
    }, timeout_ms);

    let element = document.querySelector(selector);
    if (element) {
      clearTimeout(timer);
      return resolve(document.querySelector(selector));
    }
    const observer = new MutationObserver(() => {
      element = document.querySelector(selector);
      if (element) {
        clearTimeout(timer);
        resolve(element);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
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


function setup() {
  chrome.storage.local.get(null, function(value){
    if (value.hideYTShortsVideos == undefined) {
      chrome.storage.local.set({hideYTShortsVideos: hideYTShortsVideos});
    }
    else {
      hideYTShortsVideos = value.hideYTShortsVideos;
    }

    if (value.hideYTShortsTab == undefined) {
      chrome.storage.local.set({hideYTShortsTab: hideYTShortsTab});
    }
    else {
      hideYTShortsTab = value.hideYTShortsTab;
    }

    hideShorts(hideYTShortsVideos); 
    hideShortsTab(hideYTShortsTab)

    observer = manageObserver(isMobile ? "#app" : "#content", 
      hideYTShortsTab || hideYTShortsVideos, 
      () => {
        hideShorts(hideYTShortsVideos); 
        hideShortsTab(hideYTShortsTab);
      }, 
      observer);
  });
}

function hideShorts(hide = true) {
  let selectorString = isMobile ? 
    MOBILE_SHORTS_CONTAINERS_TAG + "," + MOBILE_SHELF_TAG 
    : DESKTOP_SHORTS_CONTAINERS_TAG + "," + DESKTOP_SHELF_TAG;
  elements = document.querySelectorAll(selectorString);
  elements.forEach(element => {
    // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
    // and hide any video container that contains a ref link to shorts
    if ((element.tagName.toLowerCase().match(SHELF_TAG_REGEX) 
      && element.innerHTML.search(SHELF_ITEM_TAG_REGEX) != -1) 
      || element.innerHTML.search("href=\"/shorts/") != -1)
    {
      if (hide) {
        element.setAttribute("hidden", true);
      }
      else if (element.hasAttribute("hidden")) {
        element.removeAttribute("hidden");
      }
    }
  });
}

function hideShortsTab(hide) {
  if (isMobile) {
    waitForElement(MOBILE_SHORTS_TAB_SELECTOR).then((element) => {
      if (element != null)
        hideElement(hide, element.parentElement)
    });
  }
  else {
    waitForElement(DESKTOP_SHORTS_TAB_SELECTOR).then((element) => {
      if (element != null)
        hideElement(hide, element)
    });
    waitForElement(DESKTOP_SHORTS_MINI_TAB_SELECTOR).then((element) => {
      if (element != null)
        hideElement(hide, element)
    });
  }
}

function manageObserver(selector, active, callback, aObserver = null) {
  if (aObserver === null && active) {
    aObserver = new MutationObserver(callback);
    aObserver.observe(document.querySelector(selector), {childList:true, subtree:true});
  }
  else if (aObserver !== null && !active) {
    aObserver.disconnect();
    aObserver = null;
  }
  return aObserver;
}

chrome.storage.onChanged.addListener(function() {
  setup();
});

setup();
