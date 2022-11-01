let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = false;

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
  let elements = document.querySelectorAll("ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer");
  elements.forEach(element => {
    if (element.innerHTML.search("href=\"/shorts/") != -1) {
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
  let elements = document.querySelector('ytd-guide-entry-renderer>a:not([href])');
  let miniElements = document.querySelector("ytd-mini-guide-entry-renderer>a:not([href])");

  if (hide) {
    if (elements !== null) {
      elements.setAttribute("hidden", true);
    }
    if (miniElements !== null) {
      miniElements.setAttribute("hidden", true);
    }
  }
  else {
    if (elements.length > 0 && elements[1].hasAttribute("hidden")) {
      elements[1].removeAttribute("hidden");
    }
    if (miniElements.length > 0 && miniElements[1].hasAttribute("hidden")) {
      miniElements[1].removeAttribute("hidden");
    }
  }
}

function addObserver() {
  if (observer === null && hideYTShortsVideos) {
    observer = new MutationObserver(hideShorts);
    observer.observe(document.getElementById("content"), {childList:true, subtree:true});
    hideShorts();
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
