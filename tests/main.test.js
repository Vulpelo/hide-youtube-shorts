const videoElementUpcoming1 = require('./fixtures/video_element_UPCOMING-1.js')
const videoElementUpcoming2 = require('./fixtures/video_element_UPCOMING-2.js')
const videoElementUpcoming3 = require('./fixtures/video_element_UPCOMING-3.js')
const videoElementLive1 = require('./fixtures/video_element_LIVE-1.js')
const videoElementLive2 = require('./fixtures/video_element_LIVE-2.js')
const videoElementLive3 = require('./fixtures/video_element_LIVE-3.js')
const videoElementNormal1 = require('./fixtures/video_element_NORMAL-1.js')
const videoElementNormal2 = require('./fixtures/video_element_NORMAL-2.js')
const videoElementNormal3 = require('./fixtures/video_element_NORMAL-3.js')
const videoElementNormal3Hovered = require('./fixtures/video_element_NORMAL-3-hovered.js')
const playlistElement = require('./fixtures/playlist_element.js')
const videoElementListUpcoming1 = require('./fixtures/video_list_element_UPCOMING.js')

const {_shouldHideVideoOfType, _shouldHideVideoBelowLength} = require('../src/hidingNonShorts.js')

const VIDEO_ELEMENT_SELECTOR = "ytd-rich-item-renderer,ytd-video-renderer"

jsdom.reconfigure({
    url: 'https://www.youtube.com',
})


describe('Hiding UPCOMING type videos', () => {
    test('subscriptions in list mode - v1', () => {
        document.body.innerHTML = videoElementListUpcoming1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v1', () => {
        document.body.innerHTML = videoElementUpcoming1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v2', () => {
        document.body.innerHTML = videoElementUpcoming2
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });


    test('subscriptions in grid mode - v3', () => {
        document.body.innerHTML = videoElementUpcoming3
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });
})

describe('Hiding LIVE type videos', () => {
    test('subscriptions in grid mode - v1', () => {
        document.body.innerHTML = videoElementLive1
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v2', () => {
        document.body.innerHTML = videoElementLive2
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        
        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });

    test('subscriptions in grid mode - v3', () => {
        document.body.innerHTML = videoElementLive3
        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        
        let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["LIVE"], element)
        expect(x).toBe(true)

        x = _shouldHideVideoOfType(["UPCOMING"], element)
        expect(x).toBe(false)

        x = _shouldHideVideoOfType([], element)
        expect(x).toBe(false)
    });
});

test('Dont hide NORMAL video when hiding LIVE and UPCOMING type videos - v1', () => {
    document.body.innerHTML = videoElementNormal1

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType([], element)
    expect(x).toBe(false)
});

test('Dont hide NORMAL video when hiding LIVE and UPCOMING type videos - v2', () => {
    document.body.innerHTML = videoElementNormal2

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType([], element)
    expect(x).toBe(false)
});

test('Dont hide NORMAL video when hiding LIVE and UPCOMING type videos - v3', () => {
    document.body.innerHTML = videoElementNormal3

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = _shouldHideVideoOfType([], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)
});

test('Dont hide hovered NORMAL video when hiding LIVE and UPCOMING type videos - v3', () => {
    document.body.innerHTML = videoElementNormal3Hovered

    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
    let x = _shouldHideVideoOfType([], element)
    expect(x).toBe(false)
    
    x = _shouldHideVideoOfType(["LIVE"], element)
    expect(x).toBe(false)
    
    x = _shouldHideVideoOfType(["UPCOMING"], element)
    expect(x).toBe(false)
    
    
    x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)
});

test("Don't hide playlist element", () => {
    document.body.innerHTML = playlistElement
    let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)

    let x = _shouldHideVideoOfType(["LIVE", "UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["LIVE"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType(["UPCOMING"], element)
    expect(x).toBe(false)

    x = _shouldHideVideoOfType([], element)
    expect(x).toBe(false)

    x = _shouldHideVideoBelowLength(element, 60)
    expect(x).toBe(false)
})

describe('Hiding videos of length', () => {
    test('Hide NORMAL video when its length is shorter than specified time - v1', () => {
        document.body.innerHTML = videoElementNormal1

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = _shouldHideVideoBelowLength(element, 120)

        expect(x).toBe(true)
    });

    test('Dont hide NORMAL video when its length is longer than specified time - v1', () => {
        document.body.innerHTML = videoElementNormal1

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = _shouldHideVideoBelowLength(element, 60)

        expect(x).toBe(false)
    });

    test('Hide NORMAL video when its length is shorter than specified time - v2', () => {
        document.body.innerHTML = videoElementNormal2

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = _shouldHideVideoBelowLength(element, 120)

        expect(x).toBe(true)
    });

    test('Dont hide NORMAL video when its length is longer than specified time - v2', () => {
        document.body.innerHTML = videoElementNormal2

        let element = document.querySelector(VIDEO_ELEMENT_SELECTOR)
        let x = _shouldHideVideoBelowLength(element, 60)

        expect(x).toBe(false)
    });
});
