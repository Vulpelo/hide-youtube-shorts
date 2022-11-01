let observer = null;
let hideYTShortsVideos = false;

function setup() {
  chrome.storage.local.get(null, function(value){
    hideYTShortsVideos = value.hideYTShortsVideos == undefined ? false : value.hideYTShortsVideos;
    
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
  let elements = document.querySelectorAll("ytd-guide-entry-renderer");
  let miniElements = document.querySelectorAll("ytd-mini-guide-entry-renderer");

  // Assuming that shorts tab is always on second position (between Home and Subscription button)
  if (hide) {
    if (elements.length > 0) {
      elements[1].setAttribute("hidden", true);
    }
    if (miniElements.length > 0) {
      miniElements[1].setAttribute("hidden", true);
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

// when settings in popup have changed, then update webpage
chrome.storage.onChanged.addListener(function() {
  setup();
});

window.addEventListener('yt-page-data-updated', (event) => { 
  addObserver();
});

window.onfocus = function() {
  setup();
}

setup();
