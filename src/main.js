let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;
let rearrangeVideosAfterHidingAShort = false;

/* ON DESKTOP */
const DESKTOP_SHORTS_CONTAINERS_TAG = [
  // shelf containing multiple shorts on Search page
  ["ytd-reel-shelf-renderer"],
  // shelf containing multiple shorts on Home page 
  ["ytd-rich-shelf-renderer"],

  // videos on Home page
  ["ytd-rich-item-renderer"],
  // videos on Subscription page
  ["ytd-grid-video-renderer"], 
  // videos on Search page
  ["ytd-video-renderer"], 
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
    elementObserver.observe(observeElement, {childList: true, subtree: true});
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

    if (value.rearrangeVideosAfterHidingAShort == undefined) {
      chrome.storage.local.set({rearrangeVideosAfterHidingAShort: rearrangeVideosAfterHidingAShort});
    }
    else {
      rearrangeVideosAfterHidingAShort = value.rearrangeVideosAfterHidingAShort;
    }

    hideShorts(hideYTShortsVideos); 
    hideShortsTab(hideYTShortsTab)

    if (isMobile) {
      observer = manageObserver("#app", 
        hideYTShortsTab || hideYTShortsVideos, 
        () => {
          hideShorts(hideYTShortsVideos); 
          hideShortsTab(hideYTShortsTab);
        }, 
        observer);
    }
    else {
      observer = manageObserver("#content", 
      hideYTShortsVideos, 
      () => {
        hideShorts(hideYTShortsVideos); 
      }, 
      observer);
    }

  });
}

/* re-arranging video elements in richGridRows */
function countVisibleElementsInRow(row) {
  let visibleCount = 0;
  for (const child of row.children) {
    if (!child.hasAttribute("hidden")) {
      visibleCount++;
    }
  }
  return visibleCount;
}

function rearrangeVideosInRichGridRows(startFromRowElement, elementsPerRow) {
  // each rich_grid_row has a div element inside, and IT contains list of videos
  const richGridRows = startFromRowElement.parentElement.parentElement.querySelectorAll("ytd-rich-grid-row");
  const startIndex = Array.from(richGridRows).indexOf(startFromRowElement.parentElement);

  const amountOfVisibleElements = countVisibleElementsInRow(startFromRowElement);
  const elementsToMove = elementsPerRow - amountOfVisibleElements;
  
  for (let j = 0; j < elementsToMove; j++) {
    // for each next row, move one element to previous row
    for (let i = startIndex; i < richGridRows.length - 1; i++) {
      // assuming next row always has child and is visible.
      richGridRows[i].querySelector("div").appendChild(richGridRows[i + 1].querySelector("div").childNodes[0]);
    }
  }
}
/*!rearranging video elements in richGridRows */

function operationsAfterHidingShortElement(element) {
  if (rearrangeVideosAfterHidingAShort && element.parentElement.parentElement.tagName == "YTD-RICH-GRID-ROW") {
    if (element.hasAttribute("items-per-row")) {
      rearrangeVideosInRichGridRows(element.parentElement, element.getAttribute("items-per-row"));
    }
  }
}

function hideShorts(hide = true) {
  let selectorString = isMobile ? 
    MOBILE_SHORTS_CONTAINERS_TAG 
    : DESKTOP_SHORTS_CONTAINERS_TAG;
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
        operationsAfterHidingShortElement(element);
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
    let wrapperElement = document.querySelector(DESKTOP_GUIDE_WRAPPER_SELECTOR);
    waitForElement(DESKTOP_SHORTS_TAB_SELECTOR, wrapperElement).then((element) => {
      if (element != null)
        hideElement(hide, element)
    });
    let miniWrapperElement = document.querySelector(DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR);
    waitForElement(DESKTOP_SHORTS_MINI_TAB_SELECTOR, miniWrapperElement).then((element) => {
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
