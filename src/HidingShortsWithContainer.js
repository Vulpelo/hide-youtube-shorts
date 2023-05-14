
// hide video renderer and its parent shelf renderer if it only contains 1 video renderer
class HidingShortsWithContainer {
  querySelector = "ytd-video-renderer";
  shelfWithVideosTag = "ytd-shelf-renderer";

  constructor(querySelectorVideo, shelfWithVideosTag) {
    this.querySelector = querySelectorVideo;
    this.shelfWithVideosTag = shelfWithVideosTag;
  }

  allChildrenHidden(element) {
    for (var i = 0; i < element.childElementCount; i++) {
      if (!element.children[i].hasAttribute("hidden")) return false;
    }
    return true;
  }

  findParentWithShelfTag(element) { 
    while (element.tagName.toLowerCase() != this.shelfWithVideosTag && element.parentElement != null) {
      element = element.parentElement;
    }
    return element.tagName.toLowerCase() == this.shelfWithVideosTag ? element : null;
  }

  hideShorts() {
    const elements = document.querySelectorAll(this.querySelector);
    elements.forEach(element => {
      // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
      // and hide any video container that contains a ref link to shorts
      if (element.innerHTML.search("href=\"/shorts/") == -1) return; 
      element.setAttribute("hidden", true);

      // check if all children are hidden, if yes then find parent with tag "ytd-shelf-renderer" and hide that too
      if (this.allChildrenHidden(element.parentElement)) {
        const parent = this.findParentWithShelfTag(element.parentElement);
        if (parent == null) return;
        parent.setAttribute("hidden", true);
      }
    });
  }

  showShorts() {
    const elements = document.querySelectorAll(this.querySelector);
    elements.forEach(element => {
      // hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
      // and hide any video container that contains a ref link to shorts
      if (element.innerHTML.search("href=\"/shorts/") != -1) {
        if (element.hasAttribute("hidden")) {
          element.removeAttribute("hidden");

          const parent = this.findParentWithShelfTag(element.parentElement);
          if (parent == null || !parent.hasAttribute("hidden")) return;
          parent.removeAttribute("hidden");
        }
      }
    });
  }
}
