let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;
let isHidingShortsTimeoutActive = false;

let notificationsObserver = null;
let hideYTShortsNotifications = true;

let pageManagerNode = null;
let subscriptionPageOpenObserver = null;
let subscriptionShelfCloseButton = false;

let timeoutId = -1;
let hidingShortsTimeoutActive = false;
let hidingShortsTimeoutTimeMs = 500;

const hidingShortsOnPathNames = {
  homePage: { active: true, reg: /^\/$/, nodeSelector: "ytd-browse[page-subtype='home']", node: null},
  subscriptionPage: { active: true, reg: /^\/feed\/subscriptions$/, nodeSelector: "ytd-browse[page-subtype='subscriptions']", node: null},
  searchPage: { active: true, reg: /^\/results$/, nodeSelector: "ytd-search", node: null},
  channelPage: { active: true, reg: /@[^\/]*(\/featured)?$/, nodeSelector: "ytd-browse[page-subtype='channels']", node: null},
  channelShortTabPage: { active: false, reg: /^\/@[^\/]*\/shorts$/, nodeSelector: "", node: null}
};

/* ON DESKTOP */
let dOperationsAfterHidingElement = new OperationsAfterHidingElement();
// hiding videos on Search page, videos in list mode on subscription page 
const dHideVideoRenderer = new HidingShortsWithContainer("ytd-video-renderer", "ytd-shelf-renderer");
// hiding videos on subscription page in list mode
const dHideVideoRendererSubscriptionPage = new HidingShortsWithContainer("ytd-video-renderer", "ytd-item-section-renderer");

// to hide videos/containers on Home page, Subscription page, Search page, Video page
const REST_DESKTOP_SHORTS_CONTAINERS_TAG = [
  // shelf containing multiple shorts on Search page
  ["ytd-reel-shelf-renderer"],
  // shelf containing multiple shorts on Home page 
  ["ytd-rich-shelf-renderer"],

  // videos on Home page and subscription page
  ["ytd-rich-item-renderer"],
  // (old) videos in grid mode might still be used
  ["ytd-grid-video-renderer"],
  // videos on Video page
  ["ytd-compact-video-renderer"],
].join(",")
const DESKTOP_SHORTS_TAB_SELECTOR = "ytd-guide-entry-renderer>a:not([href])"
const DESKTOP_SHORTS_MINI_TAB_SELECTOR = "ytd-mini-guide-entry-renderer>a:not([href])"
const DESKTOP_GUIDE_WRAPPER_SELECTOR = "div[id='guide-wrapper']";
const DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR = "ytd-mini-guide-renderer";

const DESKTOP_NOTIFICATION_RENDERER = "ytd-notification-renderer";

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

/* Selectors used for searching shorts elements */
let combinedSelectorsToQuery;

// Hiding videos below certain length
let hidingShortVideosActive = false;
let hidingShortVideosTimeSeconds = 20;


function waitForElement(selector, observeElement = document.body, {childList = true, subtree = true} = {}) {
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
    elementObserver.observe(observeElement, { childList: childList, subtree: subtree });
  });
}

function waitForElementTimeout(selector, observeElement = document.body, {childList = true, subtree = true, timeout_ms = 150} = {}) {
  return new Promise(resolve => {
    let element = document.querySelector(selector);
    if (element) {
      return resolve(document.querySelector(selector));
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
    elementObserver.observe(observeElement, {childList: childList, subtree: subtree});
    if (timeout_ms > 0)
      timer = setTimeout(() => {
        resolve(null);
        elementObserver.disconnect();
      }, timeout_ms);
  });
}

function hideElement(hide, element, onHideCallback = () => {}) {
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

function loadVariables(value) {
  if (value.hideYTShortsVideos == undefined)
    chrome.storage.local.set({ hideYTShortsVideos: hideYTShortsVideos });
  else
    hideYTShortsVideos = value.hideYTShortsVideos;

  if (value.hideYTShortsTab == undefined)
    chrome.storage.local.set({ hideYTShortsTab: hideYTShortsTab });
  else
    hideYTShortsTab = value.hideYTShortsTab;

  if (value.hideYTShortsNotifications == undefined)
    chrome.storage.local.set({ hideYTShortsNotifications: hideYTShortsNotifications });
  else
    hideYTShortsNotifications = value.hideYTShortsNotifications;

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

  if (value.subscriptionShelfCloseButton == undefined)
    chrome.storage.local.set({ subscriptionShelfCloseButton: subscriptionShelfCloseButton });
  else
    subscriptionShelfCloseButton = value.subscriptionShelfCloseButton;
}

function setup() {
  chrome.storage.local.get(null, function (value) {
    loadVariables(value);

    if (isMobile) {
      combinedSelectorsToQuery = MOBILE_SHORTS_CONTAINERS_TAG;

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
        observer,
        {childList: true, subtree: true});
    }
    else {
      combinedSelectorsToQuery = REST_DESKTOP_SHORTS_CONTAINERS_TAG + "," + dHideVideoRenderer.elementTagName;

      waitForElementTimeout("#page-manager", document.body, {timeout_ms: 5000}).then((wrapperElement1) => {
        pageManagerNode = wrapperElement1;
        if (subscriptionShelfCloseButton) {
          /* MutationObserver for Subscription page when got opened/closed */
          waitForElement("ytd-browse[page-subtype='subscriptions']", pageManagerNode, {childList: true, subtree: false}).then((wrapperElement2) => {
            createOpenCloseSubscriptionPageObserver(wrapperElement2);
          });
        }
      });

      
      notificationsObserver = manageObserver("ytd-popup-container",
        hideYTShortsNotifications,
        (mutationList, observer) => {
          for (const mutation of mutationList) {
            if (mutation.type === "childList" && mutation.target.tagName.toLowerCase() == "ytd-notification-renderer") { 
              if (mutation.target.querySelector('[href^="/shorts/"]') != null)
                hideElement(true, mutation.target)
            }
          }
        },
        notificationsObserver,
        {childList: true, subtree: true}
      )

      const popupContainer = document.querySelector("ytd-popup-container")
      if (popupContainer != null) {
        const nRenderers = popupContainer.querySelectorAll("ytd-notification-renderer")
        nRenderers.forEach((v)=>{
          if (v.querySelector('[href^="/shorts/"]') != null)
            hideElement(hideYTShortsNotifications, v)
        })
      }


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
        observer,
        {childList: true, subtree: true});
    }
  });
}

function createOpenCloseSubscriptionPageObserver(node) {
  addingCloseButtonForShelfOnSubscriptionsPage(node);
  subscriptionPageOpenObserver = manageObserver("ytd-browse[page-subtype='subscriptions']", 
    true, 
    () => {addingCloseButtonForShelfOnSubscriptionsPage(node);}, 
    subscriptionPageOpenObserver, 
    {attributes: true});
}

function isLocationPathNameToIgnore() {
  const pathName = location.pathname;
  for (var key in hidingShortsOnPathNames) {
    if (hidingShortsOnPathNames[key].active == false && pathName.match(hidingShortsOnPathNames[key].reg))
      return true;
  }
  return false;
}

function childrenInPageManagerWithoutKnownOnes() {
  if (pageManagerNode == null) return [document.body];
  let finalNodeList = Array.from(pageManagerNode.children);

  for (var key in hidingShortsOnPathNames) {
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
  for (var key in hidingShortsOnPathNames) {
    if (hidingShortsOnPathNames[key].node == null && hidingShortsOnPathNames[key].nodeSelector != "")
      hidingShortsOnPathNames[key].node = document.querySelector(hidingShortsOnPathNames[key].nodeSelector);
    if (hidingShortsOnPathNames[key].node != null && pathName.match(hidingShortsOnPathNames[key].reg)) 
      return [hidingShortsOnPathNames[key].node];
  }
  return childrenInPageManagerWithoutKnownOnes();
}

function hideShorts(hide = true) {
  if (isLocationPathNameToIgnore())
    return;

  const nodes = locationPathNameNodes();

  for (let i = 0; i < nodes.length; i++) {
    elements = nodes[i].querySelectorAll(combinedSelectorsToQuery);
    elements.forEach(element => {
      
      const elementTagName = element.tagName.toLowerCase();
      
      // subscription page in list mode
      if (location.pathname.match(hidingShortsOnPathNames.subscriptionPage.reg)  
        && elementTagName.match(dHideVideoRendererSubscriptionPage.elementTagName)) {
          if (hide)
            dHideVideoRendererSubscriptionPage.hideShort(element);
          else
            dHideVideoRendererSubscriptionPage.showShort(element);
      }
      // other pages with containers on search page
      else if (elementTagName.match(dHideVideoRenderer.elementTagName)) {
        if (hide) {
          dHideVideoRenderer.hideShort(element);
        }
        else {
          dHideVideoRenderer.showShort(element);
        }
      }
      // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
      // and hide any video container that contains a ref link to shorts
      else if ((elementTagName.match(SHELF_TAG_REGEX)
        && element.querySelector(SHELF_ITEM_TAG_SELECTOR) != null)
        || element.querySelector('[href^="/shorts/"]') != null) {
        hideElement(hide, element, () => {dOperationsAfterHidingElement.doOperations(element)});
      }
      // Hide videos that are too short
      else {
        if (hidingShortVideosActive && hide) {
          hideVideoIfBelowLength(element, hidingShortVideosTimeSeconds)
        }
      }
    });
  }
}

function hideVideoIfBelowLength(element, minLengthSeconds) {
  var vid = element.querySelector(`ytd-thumbnail-overlay-time-status-renderer`)
  if (vid != null) {
    var text = vid.querySelector('#text')
    if (text) {
      var time = text.textContent.trim().split(':').reverse()
      var seconds = Number(time[0]) 
        + (time.length > 1 ? Number(time[1]) * 60 : 0)
        + (time.length > 2 ? Number(time[2]) * 3600 : 0)
      if (seconds <= minLengthSeconds) {
        hideElement(true, element, () => {dOperationsAfterHidingElement.doOperations(element)});
      }
    }
  }
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

// the button will temporarly remove shelf from subscription page till next page reload
function addingCloseButtonForShelfOnSubscriptionsPage(subscriptionNode) {
  // find one eather on grid mode or list mode
  waitForElementTimeout("ytd-rich-shelf-renderer, ytd-reel-shelf-renderer", subscriptionNode, {timeout_ms: 5000}).then((element) => {
    if (element != null && element.querySelector("div[id='shelfCloseButton']") == null)
      insertCloseShelfButton(element.querySelector("[id=flexible-item-buttons]"));
  });
}

function manageObserver(selector, active, callback, aObserver = null, {childList = false, subtree = false, attributes = false} = {}) {
  if (aObserver === null && active) {
    waitForElement(selector, document.body).then((node) => {
      aObserver = new MutationObserver(callback);
      aObserver.observe(node, { childList: childList, subtree: subtree, attributes: attributes});
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
