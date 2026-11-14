const { loadContentScripts } = require('./helpers/content-script-env')
const videoElementNormal1 = require('./fixtures/video_element_NORMAL-1.js')
const videoElementLive1 = require('./fixtures/video_element_LIVE-1.js')

const t = loadContentScripts()

VIDEO_ELEMENT_SELECTOR = 'ytd-rich-item-renderer,ytd-video-renderer'
/* the normal fixture is placed directly inside the browse node, so this
 * selects the fixture root (not the other elements of a test's DOM) */
NORMAL_VIDEO_SELECTOR = 'ytd-browse > ytd-rich-item-renderer:not([id])'

/* full set of variables main.js expects inside its storage values */
const baseValues = () => ({
    hideYTShortsVideos: true,
    hideYTShortsTab: true,
    hideYTShortsHome: true,
    hideYTShortsVideosOnSubscriptionPage: true,
    hideYTShortsVideosOnSearchPage: true,
    hideYTShortsVideosOnChannelPage: true,
    hidingShortsTimeoutActive: false,
    hidingShortVideosTimeSeconds: 20,
    hidingShortVideosActive: false,
    hideYTPlayables: false,
})

const applyState = (overrides = {}) => {
    const value = baseValues()
    Object.assign(value, overrides)
    t.loadVariables(value)
}

const chrome = t.chromeGet()

beforeEach(() => {
    t.pathNamesReset()
    document.body.innerHTML = ''
    // clean up leftovers from previous tests (stub storage persistes within the file)
    for (const key of Object.keys(chrome._storage)) delete chrome._storage[key]
    chrome._fireStorageChanged({}) // re-runs setup() with empty values -> resets state
    applyState()
})

describe('isLocationPathNameToIgnore', () => {
    test.each([
        ['https://www.youtube.com/', false],
        ['https://www.youtube.com/feed/subscriptions', false],
        ['https://www.youtube.com/results?search_query=x', false],
        ['https://www.youtube.com/@channel/featured', false],
        // active: false per default
        ['https://www.youtube.com/@channel/shorts', true],
        // channelPageNotHome (inactive per default) ignores the rest of a channel page
        ['https://www.youtube.com/@channel/videos', true],
    ])('%s', (url, shouldBeIgnored) => {
        jsdom.reconfigure({ url })
        t.pathNamesReset()
        expect(t.isLocationPathNameToIgnore()).toBe(shouldBeIgnored)
    })

    test('page setting toggles the ignore state', () => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/@channel/videos' })
        t.pathNamesReset()
        expect(t.isLocationPathNameToIgnore()).toBe(true)

        applyState({ hidingShortVideosActive: true })
        t.pathNamesReset()
        expect(t.isLocationPathNameToIgnore()).toBe(false)

        // but turning the whole channel page off keeps it ignored
        applyState({ hidingShortVideosActive: true, hideYTShortsVideosOnChannelPage: false })
        t.pathNamesReset()
        expect(t.isLocationPathNameToIgnore()).toBe(true)
    })
})

describe('locationPathNameNodes', () => {
    test('returns the matching page node', () => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/' })
        document.body.innerHTML = '<ytd-browse id="home" page-subtype="home"></ytd-browse>'

        const nodes = t.locationPathNameNodes()
        expect(nodes).toEqual([document.getElementById('home')])
    })

    test('falls back to document.body for an unknown path', () => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/watch?v=abcdefghijk' })
        expect(t.locationPathNameNodes()).toEqual([document.body])
    })
})

describe('hideShortsDesktop on the home page', () => {
    beforeEach(() => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/' })
    })

    const homeWith = (...children) => {
        document.body.innerHTML =
            '<ytd-browse page-subtype="home">' + children.join('\n') + '</ytd-browse>'
    }

    test('hides items with a shorts link and keeps normal videos', () => {
        homeWith(
            '<ytd-rich-item-renderer id="shortsItem" items-per-row="3"><a href="/shorts/abcdefghijk"></a></ytd-rich-item-renderer>',
            videoElementNormal1
        )

        t.hideShortsDesktop(true)

        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(true)
        const normalVideo = document.querySelector(NORMAL_VIDEO_SELECTOR)
        expect(normalVideo.hasAttribute('hidden')).toBe(false)
    })

    test('hides reel shelves', () => {
        homeWith('<ytd-reel-shelf-renderer id="shelf"><ytd-reel-item-renderer><a href="/shorts/abcdefghijk"></a></ytd-reel-item-renderer></ytd-reel-shelf-renderer>')

        t.hideShortsDesktop(true)

        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(true)
    })

    test('does not hide a reel shelf with contents other than shorts items', () => {
        homeWith('<ytd-reel-shelf-renderer id="shelf"><div></div></ytd-reel-shelf-renderer>')

        t.hideShortsDesktop(true)

        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(false)
    })

    test('hides containers with shorts links (grid-shelf-view-model)', () => {
        homeWith('<grid-shelf-view-model id="gridShelf"><div><a href="/shorts/abcdefghijk"></a></div></grid-shelf-view-model>')

        t.hideShortsDesktop(true)

        expect(document.getElementById('gridShelf').hasAttribute('hidden')).toBe(true)
    })

    test('show unhides shorts videos the extension hid before', () => {
        homeWith('<ytd-rich-item-renderer id="shortsItem" items-per-row="3"><a href="/shorts/abcdefghijk"></a></ytd-rich-item-renderer>')

        t.hideShortsDesktop(true)
        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(true)

        t.hideShortsDesktop(false)
        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(false)
    })

    test('playables are hidden only when hideYTPlayables is on', () => {
        homeWith('<ytd-rich-item-renderer id="playablesItem" items-per-row="3"><a href="/playables/bbbbbbbbbbb"></a></ytd-rich-item-renderer>')

        t.hideShortsDesktop(true)
        expect(document.getElementById('playablesItem').hasAttribute('hidden')).toBe(false)

        t.hideShortsDesktop(true) // second run, still disabled
        expect(document.getElementById('playablesItem').hasAttribute('hidden')).toBe(false)
    })
})

describe('hiding short videos by length on the home page', () => {
    beforeEach(() => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/' })
    })

    test('hides NORMAL videos below the configured length', () => {
        applyState({ hidingShortVideosActive: true, hidingShortVideosTimeSeconds: 120 })
        document.body.innerHTML =
            '<ytd-browse page-subtype="home">' + videoElementNormal1 + '</ytd-browse>'

        // the video is 1:22 (82 seconds) long
        t.hideShortsDesktop(true)
        const normalVideo = document.querySelector(NORMAL_VIDEO_SELECTOR)
        expect(normalVideo.hasAttribute('hidden')).toBe(true)
    })

    test('keeps videos longer than the configured length', () => {
        applyState({ hidingShortVideosActive: true, hidingShortVideosTimeSeconds: 60 })
        document.body.innerHTML =
            '<ytd-browse page-subtype="home">' + videoElementNormal1 + '</ytd-browse>'

        t.hideShortsDesktop(true)
        const normalVideo = document.querySelector(NORMAL_VIDEO_SELECTOR)
        expect(normalVideo.hasAttribute('hidden')).toBe(false)
    })
})

describe('subscription page in list mode', () => {
    beforeEach(() => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/feed/subscriptions' })
    })

    const makeList = (children) => {
        document.body.innerHTML =
            '<ytd-item-section-renderer id="itemSection">' + children.join('\n') + '</ytd-item-section-renderer>'
    }

    test('hides a ytd-video-renderer with a shorts link', () => {
        makeList([
            '<ytd-video-renderer id="shortsVideo"><a href="/shorts/abcdefghijk"></a></ytd-video-renderer>',
            '<ytd-video-renderer id="normalVideo"><a href="/watch?v=abcdefghijk"></a></ytd-video-renderer>',
        ])

        t.hideShortsDesktop(true)

        expect(document.getElementById('shortsVideo').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('normalVideo').hasAttribute('hidden')).toBe(false)
        // the container is kept because a video is still visible
        expect(document.getElementById('itemSection').hasAttribute('hidden')).toBe(false)
    })

    test('hides the container when all videos inside are shorts', () => {
        makeList([
            '<ytd-video-renderer id="shortsVideo1"><a href="/shorts/aaaaaaaaaaa"></a></ytd-video-renderer>',
            '<ytd-video-renderer id="shortsVideo2"><a href="/shorts/bbbbbbbbbbb"></a></ytd-video-renderer>',
        ])

        t.hideShortsDesktop(true)

        expect(document.getElementById('itemSection').hasAttribute('hidden')).toBe(true)
    })

    test('show unhides videos and the container', () => {
        makeList(['<ytd-video-renderer id="shortsVideo"><a href="/shorts/abcdefghijk"></a></ytd-video-renderer>'])

        t.hideShortsDesktop(true)
        expect(document.getElementById('shortsVideo').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('itemSection').hasAttribute('hidden')).toBe(true)

        t.hideShortsDesktop(false)
        expect(document.getElementById('shortsVideo').hasAttribute('hidden')).toBe(false)
        expect(document.getElementById('itemSection').hasAttribute('hidden')).toBe(false)
    })
})

describe('live/upcoming videos wiring', () => {
    beforeEach(() => {
        jsdom.reconfigure({ url: 'https://www.youtube.com/' })
    })

    test('a storage change makes live videos get hidden on the next check', () => {
        document.body.innerHTML =
            '<ytd-browse page-subtype="home">' + videoElementLive1 + '</ytd-browse>'
        expect(document.querySelector(VIDEO_ELEMENT_SELECTOR).hasAttribute('hidden')).toBe(false)

        chrome._storage.hidingLiveVideosActive = true
        chrome._fireStorageChanged()

        expect(t.state().hidingVideoTypes).toEqual(['LIVE'])

        t.hideShortsDesktop(true)
        expect(document.querySelector(VIDEO_ELEMENT_SELECTOR).hasAttribute('hidden')).toBe(true)
    })

    test('a disabled live hiding does nothing', () => {
        document.body.innerHTML =
            '<ytd-browse page-subtype="home">' + videoElementLive1 + '</ytd-browse>'

        t.hideShortsDesktop(true)
        expect(document.querySelector(VIDEO_ELEMENT_SELECTOR).hasAttribute('hidden')).toBe(false)
    })
})

describe('storage change handling', () => {
    test('changed page settings apply without a reload', () => {
        chrome._storage.hideYTShortsHome = false
        chrome._fireStorageChanged()

        jsdom.reconfigure({ url: 'https://www.youtube.com/' })
        t.pathNamesReset()
        expect(t.isLocationPathNameToIgnore()).toBe(true)
        // homePage.active uses the storage value
        expect(t.pathNames.homePage.active).toBe(false)

        chrome._storage.hideYTShortsHome = true
        chrome._fireStorageChanged()
        expect(t.pathNames.homePage.active).toBe(true)
    })

    test('enabling the timeout wraps the hiding callback into the debouncer', () => {
        jest.useFakeTimers()
        try {
            chrome._storage.hidingShortsTimeoutActive = true
            chrome._storage.hidingShortsTimeoutTimeMs = 100
            chrome._fireStorageChanged()

            // the callback is now different from the direct executor
            expect(t.hideShortsCallbackInner()).not.toBe(t.executeMethods)
            expect(t.state().hidingShortsTimeoutActive).toBe(true)

            jsdom.reconfigure({ url: 'https://www.youtube.com/' })
            t.pathNamesReset()
            document.body.innerHTML =
                '<ytd-browse page-subtype="home"><ytd-rich-item-renderer id="shortsItem" items-per-row="3"><a href="/shorts/abcdefghijk"></a></ytd-rich-item-renderer></ytd-browse>'

            t.hideShortsCallback()
            expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(false)

            jest.advanceTimersByTime(99)
            expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(false)

            jest.advanceTimersByTime(1)
            expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(true)
        } finally {
            jest.useRealTimers()
        }
    })

    test('disabling the timeout switches back to the direct callback', () => {
        chrome._storage.hidingShortsTimeoutActive = false
        chrome._fireStorageChanged()

        expect(t.state().hidingShortsTimeoutActive).toBe(false)
        expect(t.hideShortsCallbackInner()).toBe(t.executeMethods)
    })
})
