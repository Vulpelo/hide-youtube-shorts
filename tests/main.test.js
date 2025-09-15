
const videoElementUpcoming1 = require('./fixtures/video_element_UPCOMING-1.js')
const videoElementUpcoming2 = require('./fixtures/video_element_UPCOMING-2.js')
const videoElementLive1 = require('./fixtures/video_element_LIVE-1.js')
const videoElementLive2 = require('./fixtures/video_element_LIVE-2.js')
const videoElementNormal1 = require('./fixtures/video_element_NORMAL-1.js')
const videoElementNormal2 = require('./fixtures/video_element_NORMAL-2.js')
const playlistElement = require('./fixtures/playlist_element.js')
const videoElementListUpcoming1 = require('./fixtures/video_list_element_UPCOMING.js')

const VIDEO_ELEMENT_SELECTOR = "ytd-rich-item-renderer,ytd-video-renderer"

jsdom.reconfigure({
    url: 'https://www.youtube.com',
})


function hideVideoIfOfType(types, element) {
	const timeOverlay = element.querySelector("ytd-thumbnail-overlay-time-status-renderer")
    let toHide = false
	if (timeOverlay === null) {
		if (types.includes("UPCOMING")) {
            const foundElement = element.querySelector(`badge-shape.yt-badge-shape--thumbnail-default:has(div.yt-badge-shape__text):not(:has(div.yt-badge-shape__icon))`)
            const foundElement2 = element.querySelector(`toggle-button-view-model`) // Notification button
            const timeStatus = element.querySelector(`badge-shape.yt-badge-shape--thumbnail-default>div.yt-badge-shape__text`)
            if (foundElement !== null && foundElement2 != null && timeStatus !== null && !timeStatus.textContent.trim().match(/^([0-9]:[0-9]|[0-9])+$/)) {
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
	    return true; // hideElement()
    return false
}

function hideVideoIfBelowLength(element, minLengthSeconds) {
    const timeStatus = element.querySelector('.badge-shape-wiz__text,.yt-badge-shape__text')
    if (timeStatus != null) {
        const time = timeStatus.textContent.trim().split(':').reverse()
        const seconds = Number(time[0])
            + (time.length > 1 ? Number(time[1]) * 60 : 0)
            + (time.length > 2 ? Number(time[2]) * 3600 : 0)
        if (seconds != NaN && seconds <= minLengthSeconds) {
            return true
        }
    }
    return false
}

describe('Hiding UPCOMING type videos', () => {
    test('subscriptions in list mode - v1', () => {
        document.body.innerHTML = videoElementListUpcoming1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = hideVideoIfOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v1', () => {
        document.body.innerHTML = videoElementUpcoming1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = hideVideoIfOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v2', () => {
        document.body.innerHTML = videoElementUpcoming2
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = hideVideoIfOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType([], element)
        expect(x).toBe(false)
    });
})

describe('Hiding LIVE type videos', () => {
    test('subscriptions in grid mode - v1', () => {
        document.body.innerHTML = videoElementLive1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["LIVE"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["UPCOMING"], element)
        expect(x).toBe(false)

        x = hideVideoIfOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v2', () => {
        document.body.innerHTML = videoElementLive2
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        
        let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["LIVE"], element)
        expect(x).toBe(true)

        x = hideVideoIfOfType(["UPCOMING"], element)
        expect(x).toBe(false)

        x = hideVideoIfOfType([], element)
        expect(x).toBe(false)
    });
});

test('Dont hide NORMAL video when hiding LIVE and UPCOMING type videos - v1', () => {
    document.body.innerHTML = videoElementNormal1

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType([], element)
    expect(x).toBe(false)
});

test('Dont hide NORMAL video when hiding LIVE and UPCOMING type videos - v2', () => {
    document.body.innerHTML = videoElementNormal2

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType([], element)
    expect(x).toBe(false)
});

test("Don't hide playlist element", () => {
    document.body.innerHTML = playlistElement
    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

    let x = hideVideoIfOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = hideVideoIfOfType([], element)
    expect(x).toBe(false)

    x = hideVideoIfBelowLength(element, 60)
    expect(x).toBe(false)
})

describe('Hiding videos of length', () => {
    test('Hide NORMAL video when its length is shorter than specified time - v1', () => {
        document.body.innerHTML = videoElementNormal1

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = hideVideoIfBelowLength(element, 120)

        expect(x).toBe(true)
    });

    test('Dont hide NORMAL video when its length is longer than specified time - v1', () => {
        document.body.innerHTML = videoElementNormal1

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = hideVideoIfBelowLength(element, 60)

        expect(x).toBe(false)
    });

    test('Hide NORMAL video when its length is shorter than specified time - v2', () => {
        document.body.innerHTML = videoElementNormal2

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = hideVideoIfBelowLength(element, 120)

        expect(x).toBe(true)
    });

    test('Dont hide NORMAL video when its length is longer than specified time - v2', () => {
        document.body.innerHTML = videoElementNormal2

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = hideVideoIfBelowLength(element, 60)

        expect(x).toBe(false)
    });
});
