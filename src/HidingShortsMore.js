
function _allChildrenHidden(element) {
	for (var i = 0; i < element.childElementCount; i++) {
		if (!element.children[i].hasAttribute("hidden")) return false;
	}
	return true;
}

function _findParentWithElementTag(element, container) {
	while (element.tagName.toLowerCase() != container && element.parentElement != null) {
		element = element.parentElement;
	}
	return element.tagName.toLowerCase() == container ? element : null;
}

function hideContainerOfElement(container, element) {
	if (_allChildrenHidden(element.parentElement)) {
		const parent = _findParentWithElementTag(element.parentElement, container);
		if (parent == null) return;
		parent.setAttribute("hidden", true);
	}
}

function showContainerOfElement(container, element) {
	const parent = _findParentWithElementTag(element.parentElement, container);
	if (parent == null || !parent.hasAttribute("hidden")) return;
	parent.removeAttribute("hidden");
}


// hide video renderer and its parent shelf renderer if it only contains 1 video renderer
class HidingShortsWithContainer {
	container = "ytd-shelf-renderer";
	elementTagName = "ytd-video-renderer";

	constructor(querySelectorVideo, shelfWithVideosTag) {
		this.container = shelfWithVideosTag
		this.elementTagName = querySelectorVideo;
	}

	hideShort(element) {
		// hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
		// and hide any video container that contains a ref link to shorts
		if (element.querySelector(SHORTS_HREF_SELECTOR) == null) return false;
		element.setAttribute("hidden", true);

		hideContainerOfElement(this.container, element);
		return true;
	}

	showShort(element) {
		// hide whole shelf if just contains "ytd-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
		// and hide any video container that contains a ref link to shorts
		if (element.querySelector(SHORTS_HREF_SELECTOR) == null) return;
		if (element.hasAttribute("hidden")) {
			element.removeAttribute("hidden");
			showContainerOfElement(this.container, element);
		}
	}
}

class RearrangeVideosInGrid {
	// for elements with ytd-rich-item-renderer
	RICH_GRID_ROW = "ytd-rich-grid-row";

	_countVisibleElementsInRow(row) {
		let visibleCount = 0;
		for (const child of row.children) {
			if (!child.hasAttribute("hidden")) {
				visibleCount++;
			}
		}
		return visibleCount;
	}

	_rearrangeVideosInRichGridRows(startFromRowElement, elementsPerRow) {
		// each rich_grid_row has a div element inside, and IT contains list of videos
		const richGridRows = startFromRowElement.parentElement.parentElement.querySelectorAll(this.RICH_GRID_ROW);
		const startIndex = Array.from(richGridRows).indexOf(startFromRowElement.parentElement);

		const amountOfVisibleElements = this._countVisibleElementsInRow(startFromRowElement);
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

	execute(element) {
		if (element.parentElement.parentElement.tagName.toLowerCase().match(this.RICH_GRID_ROW)
			&& element.hasAttribute("items-per-row")) {
			const pElement = element.parentElement;
			const itemsPerRow = element.getAttribute("items-per-row");
			element.remove();
			this._rearrangeVideosInRichGridRows(pElement, itemsPerRow);
		}
	}
}

function insertCloseShelfButton(element) {
	element.insertAdjacentHTML("afterbegin", `
    <div id="shelfCloseButton" class="style-scope ytd-menu-renderer">
      <a class="yt-spec-button-shape-next yt-spec-button-shape-next--text yt-spec-button-shape-next--call-to-action yt-spec-button-shape-next--size-m "
        aria-label="Close" rel="nofollow" force-new-state="true"
        onclick="this.closest('ytd-rich-shelf-renderer, ytd-item-section-renderer').setAttribute('hidden', true);">
        <div style="width: 24px; height: 24px;">
          <div class="style-scope yt-icon">
            <icon-shape class="yt-spec-icon-shape">
              <div style="width: 100%; height: 100%; fill: currentcolor;">
                <svg enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                  <path d="m12.71 12 8.15 8.15-.71.71L12 12.71l-8.15 8.15-.71-.71L11.29 12 3.15 3.85l.71-.71L12 11.29l8.15-8.15.71.71L12.71 12z"></path>
                </svg>
              </div>
            </icon-shape>
          </div>
        </div>
      </a>
    </div>
  `);
}
