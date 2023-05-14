
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

class OperationsAfterHidingElement {
  rearrangeVideosAfterHidingAShort = false;
  // for elements with ytd-rich-item-renderer
  RICH_GRID_ROW = "ytd-rich-grid-row";

  countVisibleElementsInRow(row) {
    let visibleCount = 0;
    for (const child of row.children) {
      if (!child.hasAttribute("hidden")) {
        visibleCount++;
      }
    }
    return visibleCount;
  }

  rearrangeVideosInRichGridRows(startFromRowElement, elementsPerRow) {
    // each rich_grid_row has a div element inside, and IT contains list of videos
    const richGridRows = startFromRowElement.parentElement.parentElement.querySelectorAll(RICH_GRID_ROW);
    const startIndex = Array.from(richGridRows).indexOf(startFromRowElement.parentElement);

    const amountOfVisibleElements = countVisibleElementsInRow(startFromRowElement);
    const elementsToMove = elementsPerRow - amountOfVisibleElements;

    for (let j = 0; j < elementsToMove; j++) {
      // for each next row, move one element to previous row
      for (let i = startIndex; i < richGridRows.length - 1; i++) {
        // assuming next row always has child and is visible.
        const nextRitchRowDiv = richGridRows[i + 1].querySelector("div");
        if (nextRitchRowDiv.childElementCount <= 0)
          break;
        richGridRows[i].querySelector("div").appendChild(nextRitchRowDiv.childNodes[0]);
      }
    }
  }
  /*!rearranging video elements in richGridRows */

  doOperations(element) {
    if (this.rearrangeVideosAfterHidingAShort) {
      if (element.parentElement.parentElement.tagName.toLowerCase().match(RICH_GRID_ROW) &&
        element.hasAttribute("items-per-row")) {
        rearrangeVideosInRichGridRows(element.parentElement, element.getAttribute("items-per-row"));
      }
    }
  }
}
