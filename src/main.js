let observer = null;
let hideYTShortsVideos = true;
let hideYTShortsTab = true;
let isHidingShortsTimeoutActive = false;

let notificationsObserver = null;
let hideYTShortsNotifications = true;

let pageManagerNode = null;
let subscriptionPageOpenObserver = null;
let subscriptionShelfCloseButton = false;

let timeoutId = -1;
let hidingShortsTimeoutActive = false;
let hidingShortsTimeoutTimeMs = 500;

let hidingShortVideosActive = false;
let hidingShortVideosTimeSeconds = 20;

const isMobile = location.hostname == "m.youtube.com";

const hidingShortsOnPathNames = {
	homePage: { active: true, reg: /^\/$/, nodeSelector: "ytd-browse[page-subtype='home']", node: null },
	subscriptionPage: { active: true, reg: /^\/feed\/subscriptions$/, nodeSelector: "ytd-browse[page-subtype='subscriptions']", node: null },
	searchPage: { active: true, reg: /^\/results$/, nodeSelector: "ytd-search", node: null },
	channelPage: { active: true, reg: /@[^\/]*(\/featured|\/search[^\/]*)?$/, nodeSelector: "ytd-browse[page-subtype='channels']", node: null },
	channelShortTabPage: { active: false, reg: /^\/@[^\/]*\/shorts$/, nodeSelector: "", node: null },
	// for hiding short videos on whole channel page
	channelPageNotHome: { active: false, reg: /@[^\/]*\/((?!featured).)*$/, nodeSelector: "ytd-browse[page-subtype='channels']", node: null }
};

// to hide videos/containers on Home page, Subscription page, Search page, Video page
const REST_SHORTS_CONTAINERS_TAG = isMobile ? [
	// shelf containing multiple shorts on Search page
	["ytm-reel-shelf-renderer"],

	// videos on Home page
	["ytm-rich-item-renderer"],
	// videos on Subscription page
	["div[tab-identifier='FEsubscriptions']>ytm-section-list-renderer>lazy-list>ytm-item-section-renderer"],
	// videos in grid mode
	["ytm-grid-video-renderer"],
	// videos on Search page and Video page
	["ytm-video-with-context-renderer"],
].join(",") : [
	// shelf containing multiple shorts on Search page
	["ytd-reel-shelf-renderer"],
	// extendable shelf with shorts on Search page 
	["grid-shelf-view-model"],
	// shelf containing multiple shorts on Home page 
	["ytd-rich-shelf-renderer"],
	// container of videos on home/subscription page (so far only for shorts)
	["ytd-rich-grid-group"],

	// videos on Home page and subscription page
	["ytd-rich-item-renderer"],
	// (old) videos in grid mode might still be used
	["ytd-grid-video-renderer"],
	// videos on Video page
	["ytd-compact-video-renderer"],
].join(",")


/* ON MOBILE */
// videos in ytm-rich-section-renderer on Home page
const mHidingVideoRenderer = new HidingShortsWithContainer("ytm-shorts-lockup-view-model", "ytm-rich-section-renderer");

/* ON DESKTOP */
const dRearrangeVideosInGrid = new RearrangeVideosInGrid();
// hiding videos on Search page, videos in list mode on subscription page 
const dHidingVideoRenderer = new HidingShortsWithContainer("ytd-video-renderer", "ytd-shelf-renderer");
// hiding videos on subscription page in list mode
const dHideVideoRendererSubscriptionPage = new HidingShortsWithContainer("ytd-video-renderer", "ytd-item-section-renderer");
const DESKTOP_SHORTS_MINI_TAB_SELECTOR = "ytd-mini-guide-entry-renderer>a:not([href])"
const DESKTOP_GUIDE_WRAPPER_SELECTOR = "div[id='guide-wrapper']";
const DESKTOP_GUIDE_WRAPPER_MINI_SELECTOR = "ytd-mini-guide-renderer";
const DESKTOP_NOTIFICATION_RENDERER = "ytd-notification-renderer";

const SHORTS_TAB_SELECTOR = isMobile ? "ytm-pivot-bar-item-renderer>div[class='pivot-bar-item-tab pivot-shorts']" : "ytd-guide-entry-renderer>a:not([href])"
const SHORTS_HREF_SELECTOR = `[href^="/shorts/"]`;

/* dedicated shelfs for shorts */
const SHELF_TAG_REGEX = /yt[dm]-reel-shelf-renderer/gm
const SHELF_ITEM_TAG_SELECTOR = isMobile ? "ytm-reel-item-renderer" : "ytd-reel-item-renderer";

// Time overlay status on thumbnail
const TIME_OVERLAY_STATUS_TAG = isMobile ? 'ytm-thumbnail-overlay-time-status-renderer' : 'ytd-thumbnail-overlay-time-status-renderer';
const TIME_OVERLAY_STATUS_STYLE_ATTRIBUTE = isMobile ? "data-style" : "overlay-style";

/* Selectors used for searching shorts elements */
let combinedSelectorsToQuery;

// Hide other video types
const LIVE = "LIVE"
const UPCOMING = "UPCOMING"
let hidingVideoTypes = []


function waitForElement(selector, observeElement = document.body, { childList = true, subtree = true } = {}) {
	return new Promise(resolve => {
		let element = document.querySelector(selector);
		if (element) {
			return resolve(element);
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

function waitForElementTimeout(selector, observeElement = document.body, { childList = true, subtree = true, timeout_ms = 150 } = {}) {
	return new Promise(resolve => {
		let element = document.querySelector(selector);
		if (element) {
			return resolve(element);
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
		elementObserver.observe(observeElement, { childList: childList, subtree: subtree });
		if (timeout_ms > 0)
			timer = setTimeout(() => {
				resolve(null);
				elementObserver.disconnect();
			}, timeout_ms);
	});
}

function hideElement(hide, element, onHideCallback = () => { }) {
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

let hideShortsCallbackInner = () => { };
function hideShortsCallback() { hideShortsCallbackInner(); };

function loadVariables(value) {
	hidingVideoTypes = []
	if (value.hidingLiveVideosActive == undefined)
		chrome.storage.local.set({ hidingLiveVideosActive: false });
	if (value.hidingLiveVideosActive === true)
		hidingVideoTypes.push(LIVE)

	if (value.hidingUpcomingVideosActive == undefined)
		chrome.storage.local.set({ hidingUpcomingVideosActive: false });
	if (value.hidingUpcomingVideosActive === true)
		hidingVideoTypes.push(UPCOMING)

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
	hidingShortsOnPathNames.channelPageNotHome.active = hidingShortVideosActive && hidingShortsOnPathNames.channelPage.active;

	if (value.subscriptionShelfCloseButton == undefined)
		chrome.storage.local.set({ subscriptionShelfCloseButton: subscriptionShelfCloseButton });
	else
		subscriptionShelfCloseButton = value.subscriptionShelfCloseButton;
}

function setup() {
	chrome.storage.local.get(null, function (value) {
		loadVariables(value);

		combinedSelectorsToQuery = REST_SHORTS_CONTAINERS_TAG;
		if (isMobile) {
			combinedSelectorsToQuery += "," + mHidingVideoRenderer.elementTagName
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
				{ childList: true, subtree: true });
		}
		else {
			combinedSelectorsToQuery += "," + dHidingVideoRenderer.elementTagName;
			waitForElementTimeout("#page-manager", document.body, { timeout_ms: 5000 }).then((wrapperElement1) => {
				pageManagerNode = wrapperElement1;
				if (subscriptionShelfCloseButton) {
					/* MutationObserver for Subscription page when got opened/closed */
					waitForElement("ytd-browse[page-subtype='subscriptions']", pageManagerNode, { childList: true, subtree: false }).then((wrapperElement2) => {
						createOpenCloseSubscriptionPageObserver(wrapperElement2);
					});
				}
			});


			notificationsObserver = manageObserver("ytd-popup-container",
				hideYTShortsNotifications,
				(mutationList, observer) => {
					for (const mutation of mutationList) {
						if (mutation.type === "childList" && mutation.target.tagName.toLowerCase() == DESKTOP_NOTIFICATION_RENDERER) {
							if (mutation.target.querySelector(SHORTS_HREF_SELECTOR) != null)
								hideElement(true, mutation.target)
						}
					}
				},
				notificationsObserver,
				{ childList: true, subtree: true }
			)

			const popupContainer = document.querySelector("ytd-popup-container")
			if (popupContainer != null) {
				const nRenderers = popupContainer.querySelectorAll(DESKTOP_NOTIFICATION_RENDERER)
				nRenderers.forEach((v) => {
					if (v.querySelector(SHORTS_HREF_SELECTOR) != null)
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
				{ childList: true, subtree: true });
		}
	});
}

function createOpenCloseSubscriptionPageObserver(node) {
	addingCloseButtonForShelfOnSubscriptionsPage(node);
	subscriptionPageOpenObserver = manageObserver("ytd-browse[page-subtype='subscriptions']",
		true,
		() => { addingCloseButtonForShelfOnSubscriptionsPage(node); },
		subscriptionPageOpenObserver,
		{ attributes: true });
}

function isLocationPathNameToIgnore() {
	const pathName = location.pathname;
	for (let key in hidingShortsOnPathNames) {
		if (hidingShortsOnPathNames[key].active == false && pathName.match(hidingShortsOnPathNames[key].reg))
			return true;
	}
	return false;
}

function childrenInPageManagerWithoutKnownOnes() {
	if (pageManagerNode == null) return [document.body];
	let finalNodeList = Array.from(pageManagerNode.children);

	for (let key in hidingShortsOnPathNames) {
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
	for (let key in hidingShortsOnPathNames) {
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
		let elements = nodes[i].querySelectorAll(combinedSelectorsToQuery);
		elements.forEach(element => {

			const elementTagName = element.tagName.toLowerCase();

			// subscription page in list mode
			if (location.pathname.match(hidingShortsOnPathNames.subscriptionPage.reg)
				&& elementTagName.match(dHideVideoRendererSubscriptionPage.elementTagName)) {
				if (hide) {
					if (!dHideVideoRendererSubscriptionPage.hideShort(element)) {
						hideNonShorts(element)
						hideContainerOfElement("ytd-item-section-renderer", element)
					}
				}
				else
					dHideVideoRendererSubscriptionPage.showShort(element);
			}
			else if (isMobile === true
				&& location.pathname.match(hidingShortsOnPathNames.homePage.reg)
				&& elementTagName.match(mHidingVideoRenderer.elementTagName)) {
				if (hide) {
					mHidingVideoRenderer.hideShort(element);
				}
				else {
					mHidingVideoRenderer.showShort(element);
				}
			}
			// other pages with containers on search page and channel's search
			else if (elementTagName.match(dHidingVideoRenderer.elementTagName)) {
				if (hide) {
					if (!dHidingVideoRenderer.hideShort(element)) {
						hideNonShorts(element)
						hideContainerOfElement("ytd-item-section-renderer", element)
					}
				}
				else {
					dHidingVideoRenderer.showShort(element);
				}
			}
			// hide whole shelf if just contains "yt[dm]-reel-item-renderer" tag. For now seems to be only used for yt-shorts videos
			// and hide any video container that contains a ref link to shorts
			else if ((elementTagName.match(SHELF_TAG_REGEX)
				&& element.querySelector(SHELF_ITEM_TAG_SELECTOR) != null)
				|| element.querySelector(SHORTS_HREF_SELECTOR) != null) {
				hideElement(hide, element, () => { dRearrangeVideosInGrid.execute(element) });
			}
			else if (hide) {
				hideNonShorts(element)
			}
		});
	}
}

function hideNonShorts(element) {
	// Hide videos that are too short
	if (hidingShortVideosActive) {
		hideVideoIfBelowLength(element, hidingShortVideosTimeSeconds)
	}
	// Hide videos of type
	if (hidingVideoTypes.length > 0)
		hideVideoIfOfType(hidingVideoTypes, element)
}

function hideVideoIfOfType(types, element) {
	const timeOverlay = element.querySelector(TIME_OVERLAY_STATUS_TAG)
    let toHide = false
	if (timeOverlay === null) {
		if (types.includes("UPCOMING")) {
            const foundElement = element.querySelector(`badge-shape.yt-badge-shape--thumbnail-default:has(div.yt-badge-shape__text):not(:has(div.yt-badge-shape__icon))`)
            const foundElement2 = element.querySelector(`toggle-button-view-model`) // Notification button
            const timeStatuses = element.querySelectorAll(`badge-shape.yt-badge-shape--thumbnail-default>div.yt-badge-shape__text`)
            let nonHaveTimeStatus = true
            timeStatuses.forEach(timeStatus => {
                if (timeStatus.textContent && timeStatus.textContent.trim().match(/^([0-9]:[0-9]|[0-9])+$/)) {
                    nonHaveTimeStatus = false
                    return
                }
            })
            if (foundElement !== null && foundElement2 !== null && timeStatuses.length > 0 && nonHaveTimeStatus) {
                toHide = true
            }
        }

        if (!toHide && types.includes("LIVE")) {
            // on home/subscription pages, live videos have different tree and tags
            const liveBadgeOverlay = element.querySelector("yt-thumbnail-badge-view-model>badge-shape.badge-shape-wiz--thumbnail-live,ytd-badge-supported-renderer>div.badge-style-type-live-now-alternate,yt-thumbnail-badge-view-model>badge-shape.yt-badge-shape--thumbnail-live")
            toHide = liveBadgeOverlay !== null
        }
	}
	else if (timeOverlay.hasAttribute("overlay-style") && types.includes(timeOverlay.getAttribute("overlay-style"))) {
		toHide = true
	}

    if (toHide)
	    hideElement(true, element, () => { dRearrangeVideosInGrid.execute(element) });
}

function hideVideoIfBelowLength(element, minLengthSeconds) {
	const timeStatus = element.querySelector('.badge-shape-wiz__text')
	if (timeStatus != null) {
		const time = timeStatus.textContent.trim().split(':').reverse()
		const seconds = Number(time[0])
			+ (time.length > 1 ? Number(time[1]) * 60 : 0)
			+ (time.length > 2 ? Number(time[2]) * 3600 : 0)
		if (seconds != NaN && seconds <= minLengthSeconds) {
			hideElement(true, element, () => { dRearrangeVideosInGrid.execute(element) });
		}
	}
}

function hideShortsTab(hide) {
	if (isMobile) {
		let element = document.querySelector(SHORTS_TAB_SELECTOR);
		if (element)
			hideElement(hide, element.parentElement)
	}
	else {
		waitForElement(DESKTOP_GUIDE_WRAPPER_SELECTOR, document.body).then((wrapperElement) => {
			waitForElement(SHORTS_TAB_SELECTOR, wrapperElement).then((element) => {
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
	waitForElementTimeout("ytd-rich-shelf-renderer, ytd-reel-shelf-renderer", subscriptionNode, { timeout_ms: 5000 }).then((element) => {
		if (element != null && element.querySelector("div[id='shelfCloseButton']") == null)
			insertCloseShelfButton(element.querySelector("[id=flexible-item-buttons]"));
	});
}

function manageObserver(selector, active, callback, aObserver = null, { childList = false, subtree = false, attributes = false } = {}) {
	if (aObserver === null && active) {
		waitForElement(selector, document.body).then((node) => {
			aObserver = new MutationObserver(callback);
			aObserver.observe(node, { childList: childList, subtree: subtree, attributes: attributes });
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
