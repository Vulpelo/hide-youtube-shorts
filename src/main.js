let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;

const SHORTS_CONTAINERS_TAG = "ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer"
const SHELF_TAG = "ytd-reel-shelf-renderer"


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

    hideShortsTab(value.hideYTShortsTab);
    addObserver();
  });
}

function hideShorts(hide = true) {
  let elements = document.querySelectorAll(SHORTS_CONTAINERS_TAG + ", " + SHELF_TAG);
  elements.forEach(element => {
    // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
    // and hide any video container that contains a ref link to shorts
    if ((element.tagName.toLowerCase() === SHELF_TAG.toLowerCase() && element.innerHTML.search("ytd-reel-item-renderer") != -1) 
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
  let tabElement = document.querySelector('ytd-guide-entry-renderer>a:not([href])');
  let miniTabElement = document.querySelector("ytd-mini-guide-entry-renderer>a:not([href])");

  if (hide) {
    if (tabElement !== null) {
      tabElement.setAttribute("hidden", true);
    }
    if (miniTabElement !== null) {
      miniTabElement.setAttribute("hidden", true);
    }
  }
  else {
    if (tabElement.hasAttribute("hidden")) {
      tabElement.removeAttribute("hidden");
    }
    if (miniTabElement.hasAttribute("hidden")) {
      miniTabElement.removeAttribute("hidden");
    }
  }
}


function addObserver() {
  if (observer === null && hideYTShortsVideos) {
    observer = new MutationObserver(hideShorts);
    observer.observe(document.getElementById("content"), {childList:true, subtree:true});
    hideShorts(true);
  }
  else if (observer !== null && !hideYTShortsVideos) {
    observer.disconnect();
    observer = null;
    hideShorts(false);
  }
}

chrome.storage.onChanged.addListener(function() {
  setup();
});

window.addEventListener('yt-rendererstamper-finished', (event) => { 
  setup();
});
