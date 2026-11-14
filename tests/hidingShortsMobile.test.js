const { loadContentScripts } = require('./helpers/content-script-env')

/* separate file, because it loads the content scripts with the mobile URL */
const t = loadContentScripts({ isMobile: true })

describe('loaded in mobile mode', () => {
    test('location hostname was m.youtube.com during load', () => {
        expect(t.isMobile()).toBe(true)
        expect(jsdom.window.location.hostname).toBe('m.youtube.com')
    })
})

describe('mobile mode combined selectors', () => {
    test('they are a snapshot for the mobile layout', () => {
        const { combinedSelectorsToQuery } = t.state()
        expect(combinedSelectorsToQuery).toContain('ytm-reel-shelf-renderer')
        expect(combinedSelectorsToQuery).toContain('ytm-rich-item-renderer')
        expect(combinedSelectorsToQuery).toContain('ytm-shorts-lockup-view-model')
    })
})

describe('hideShortsMobile on the home page', () => {
    const makeHome = (children) => {
        jsdom.reconfigure({ url: 'https://m.youtube.com/' })
        t.pathNamesReset() // discard cached page nodes of earlier tests
        document.body.innerHTML =
            '<ytd-browse id="home" page-subtype="home">' + children.join('\n') + '</ytd-browse>'
    }

    test('hides shorts lockup videos', () => {
        makeHome(['<ytm-shorts-lockup-view-model id="lockup1"><a href="/shorts/abcdefghijk"></a></ytm-shorts-lockup-view-model>'])

        t.hideShortsMobile(true)
        expect(document.getElementById('lockup1').hasAttribute('hidden')).toBe(true)
    })

    test('hides the whole section renderer when it only contains shorts lockups', () => {
        makeHome([
            '<ytm-rich-section-renderer id="section">',
            '<ytm-shorts-lockup-view-model id="lockup1"><a href="/shorts/aaaaaaaaaaa"></a></ytm-shorts-lockup-view-model>',
            '<ytm-shorts-lockup-view-model id="lockup2"><a href="/shorts/bbbbbbbbbbb"></a></ytm-shorts-lockup-view-model>',
            '</ytm-rich-section-renderer>',
        ])

        t.hideShortsMobile(true)
        expect(document.getElementById('lockup1').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('lockup2').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('section').hasAttribute('hidden')).toBe(true)
    })

    test('hides rich items with a shorts link and keeps normal ones', () => {
        makeHome([
            '<ytm-rich-item-renderer id="shortsItem"><div><a href="/shorts/abcdefghijk"></a></div></ytm-rich-item-renderer>',
            '<ytm-rich-item-renderer id="normalItem"><div><a href="/watch?v=abcdefghijk"></a></div></ytm-rich-item-renderer>',
        ])

        t.hideShortsMobile(true)
        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('normalItem').hasAttribute('hidden')).toBe(false)
    })

    test('show unhides shorts elements', () => {
        makeHome([
            '<ytm-shorts-lockup-view-model id="lockup1"><a href="/shorts/abcdefghijk"></a></ytm-shorts-lockup-view-model>',
            '<ytm-rich-item-renderer id="shortsItem"><div><a href="/shorts/abcdefghijk"></a></div></ytm-rich-item-renderer>',
        ])

        t.hideShortsMobile(true)
        expect(document.getElementById('lockup1').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(true)

        t.hideShortsMobile(false)
        expect(document.getElementById('lockup1').hasAttribute('hidden')).toBe(false)
        expect(document.getElementById('shortsItem').hasAttribute('hidden')).toBe(false)
    })
})

describe('mobile shorts tab', () => {
    const makeTab = () => {
        document.body.innerHTML = `
            <ytm-pivot-bar-renderer>
                <ytm-pivot-bar-item-renderer id="pivotTab">
                    <div class="pivot-bar-item-tab pivot-shorts"></div>
                </ytm-pivot-bar-item-renderer>
                <ytm-pivot-bar-item-renderer id="pivotHome">
                    <div class="pivot-bar-item-tab pivot-home"></div>
                </ytm-pivot-bar-item-renderer>
            </ytm-pivot-bar-renderer>`
    }

    test('hides the pivot bar item of the shorts tab', () => {
        makeTab()
        t.hideShortsTabMobile(true)
        expect(document.getElementById('pivotTab').hasAttribute('hidden')).toBe(true)
        expect(document.getElementById('pivotHome').hasAttribute('hidden')).toBe(false)
    })

    test('show unhides the tab', () => {
        makeTab()
        t.hideShortsTabMobile(true)
        t.hideShortsTabMobile(false)
        expect(document.getElementById('pivotTab').hasAttribute('hidden')).toBe(false)
    })
})

describe('hiding posts on mobile', () => {
    test('a storage change activates hiding posts on the next executeMethods', () => {
        jsdom.reconfigure({ url: 'https://m.youtube.com/' })
        t.pathNamesReset() // discard cached page nodes of earlier tests
        const chrome = t.chromeGet()
        document.body.innerHTML = `
            <ytm-rich-section-renderer id="postSection">
                <div><ytm-backstage-post-thread-renderer><a href="/post/abcdefg"></a></ytm-backstage-post-thread-renderer></div>
            </ytm-rich-section-renderer>`
        expect(document.getElementById('postSection').hasAttribute('hidden')).toBe(false)

        chrome._storage.hidingPostsActive = true
        chrome._fireStorageChanged()

        expect(t.state().hideCustomElements).toContain('ytm-backstage-post-thread-renderer')

        t.executeMethods()
        expect(document.getElementById('postSection').hasAttribute('hidden')).toBe(true)
    })
})
