const { loadBackgroundScript } = require('./helpers/content-script-env')

const SHORT_ID = 'abcdefghijk'

describe('background script', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    test('sets the default value to storage and registers no listener', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript()

        expect(chrome._storage.shortsInOriginalVideoPlayer).toBe(false)
        expect(chrome._tabsOnUpdated.hasListener(onTabUpdated)).toBe(false)
    })

    test('registers the tab update listener when the redirect is enabled', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage: { shortsInOriginalVideoPlayer: true } })

        expect(chrome._tabsOnUpdated.hasListener(onTabUpdated)).toBe(true)
    })

    test('redirects shorts urls to the watch url on the same subdomain (www)', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage: { shortsInOriginalVideoPlayer: true } })

        onTabUpdated(42, { url: `https://www.youtube.com/shorts/${SHORT_ID}` })

        expect(chrome.tabs.update).toHaveBeenCalledWith(42, {
            url: `https://www.youtube.com/watch?v=${SHORT_ID}`,
        })
    })

    test('redirects shorts urls on m.youtube.com too', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage: { shortsInOriginalVideoPlayer: true } })

        onTabUpdated(7, { url: `https://m.youtube.com/shorts/${SHORT_ID}` })

        expect(chrome.tabs.update).toHaveBeenCalledWith(7, {
            url: `https://m.youtube.com/watch?v=${SHORT_ID}`,
        })
    })

    test('does not redirect other urls', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage: { shortsInOriginalVideoPlayer: true } })

        onTabUpdated(1, { url: 'https://www.youtube.com/watch?v=abcdefghijk' })
        onTabUpdated(1, { url: `https://www.youtube.com/shorts/` })
        onTabUpdated(1, { url: `https://example.com/shorts/${SHORT_ID}` })

        expect(chrome.tabs.update).not.toHaveBeenCalled()
    })

    test('does nothing without a url in changeInfo', () => {
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage: { shortsInOriginalVideoPlayer: true } })

        onTabUpdated(1, {})

        expect(chrome.tabs.update).not.toHaveBeenCalled()
    })

    test('a storage change removes the listener when the redirect got disabled', () => {
        const storage = { shortsInOriginalVideoPlayer: true }
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage })
        expect(chrome._tabsOnUpdated.hasListener(onTabUpdated)).toBe(true)

        storage.shortsInOriginalVideoPlayer = false
        chrome._fireStorageChanged()

        expect(chrome._tabsOnUpdated.hasListener(onTabUpdated)).toBe(false)
    })

    test('a storage change re-registers the listener when the redirect got enabled', () => {
        const storage = { shortsInOriginalVideoPlayer: false }
        const { chrome, onTabUpdated } = loadBackgroundScript({ storage })

        storage.shortsInOriginalVideoPlayer = true
        chrome._fireStorageChanged()

        expect(chrome._tabsOnUpdated.hasListener(onTabUpdated)).toBe(true)
    })
})
