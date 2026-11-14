const { loadContentScripts } = require('./helpers/content-script-env')

const t = loadContentScripts()

describe('_allChildrenHidden', () => {
    test('true when every child has a hidden attribute', () => {
        document.body.innerHTML = `
            <div id="parent">
                <span id="a" hidden></span>
                <span id="b" hidden="true"></span>
            </div>`;

        const parent = document.getElementById('parent')
        expect(t._allChildrenHidden(parent)).toBe(true)
        expect(t._allChildrenHidden(document.getElementById('a'))).toBe(true) // no children
    })

    test('false when any child is visible', () => {
        document.body.innerHTML = `
            <div id="parent">
                <span id="a" hidden></span>
                <span id="b"></span>
            </div>`;

        expect(t._allChildrenHidden(document.getElementById('parent'))).toBe(false)
    })
})

describe('_findParentWithElementTag', () => {
    test('returns the closest ancestor with the given tag', () => {
        document.body.innerHTML = `
            <ytd-item-section-renderer>
                <ytd-shelf-renderer>
                    <ytd-video-renderer id="video"></ytd-video-renderer>
                </ytd-shelf-renderer>
            </ytd-item-section-renderer>`;

        const element = document.getElementById('video')
        expect(t._findParentWithElementTag(element, 'ytd-shelf-renderer'))
            .toBe(element.parentElement)
        expect(t._findParentWithElementTag(element, 'ytd-item-section-renderer'))
            .toBe(element.parentElement.parentElement)
    })

    test('checks the element itself first', () => {
        document.body.innerHTML = '<ytd-shelf-renderer id="shelf"></ytd-shelf-renderer>'
        expect(t._findParentWithElementTag(document.getElementById('shelf'), 'ytd-shelf-renderer'))
            .toBe(document.getElementById('shelf'))
    })

    test('returns null when no ancestor has the tag', () => {
        document.body.innerHTML = '<div><ytd-video-renderer id="video"></ytd-video-renderer></div>'
        expect(t._findParentWithElementTag(document.getElementById('video'), 'ytd-other-renderer')).toBe(null)
    })
})

describe('hideContainerOfElement', () => {
    test('hides the container when all its direct children are hidden', () => {
        document.body.innerHTML = `
            <ytd-item-section-renderer id="item-section">
                <div>
                    <ytd-video-renderer id="video"></ytd-video-renderer>
                </div>
            </ytd-item-section-renderer>`;

        const video = document.getElementById('video')
        video.setAttribute('hidden', true)

        t.hideContainerOfElement('ytd-item-section-renderer', video)
        // video's parent (div) has all children hidden -> walk up to item-section
        expect(document.getElementById('item-section').hasAttribute('hidden')).toBe(true)
    })

    test('keeps the container when a sibling of the element is still visible', () => {
        document.body.innerHTML = `
            <ytd-item-section-renderer id="item-section">
                <ytd-video-renderer id="video" hidden></ytd-video-renderer>
                <ytd-video-renderer id="other"></ytd-video-renderer>
            </ytd-item-section-renderer>`;

        t.hideContainerOfElement('ytd-item-section-renderer', document.getElementById('video'))
        expect(document.getElementById('item-section').hasAttribute('hidden')).toBe(false)
    })

    test('does nothing when there is no matching container ancestor', () => {
        document.body.innerHTML = `
            <ytd-item-section-renderer id="item-section">
                <ytd-video-renderer id="video" hidden></ytd-video-renderer>
            </ytd-item-section-renderer>`;

        t.hideContainerOfElement('ytd-other-renderer', document.getElementById('video'))
        expect(document.getElementById('item-section').hasAttribute('hidden')).toBe(false)
    })
})

describe('HidingShortsWithContainer (ytd-video-renderer in ytd-shelf-renderer)', () => {
    const makeShelf = () => {
        document.body.innerHTML = `
            <ytd-shelf-renderer id="shelf">
                <ytd-video-renderer id="shorts-video"><a href="/shorts/abcdefghijk"></a></ytd-video-renderer>
                <ytd-video-renderer id="normal-video"><a href="/watch?v=abcdefghijk"></a></ytd-video-renderer>
            </ytd-shelf-renderer>`;

        return new t.HidingShortsWithContainer('ytd-video-renderer', 'ytd-shelf-renderer')
    }

    test('hideShort hides the video renderer with a shorts link', () => {
        const hider = makeShelf()
        const shortsVideo = document.getElementById('shorts-video')

        expect(hider.hideShort(shortsVideo)).toBe(true)
        expect(shortsVideo.hasAttribute('hidden')).toBe(true)
        // sibling still visible, so the shelf stays visible
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(false)
    })

    test('hideShort returns false for a video renderer without a shorts link', () => {
        const hider = makeShelf()
        const normalVideo = document.getElementById('normal-video')

        expect(hider.hideShort(normalVideo)).toBe(false)
        expect(normalVideo.hasAttribute('hidden')).toBe(false)
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(false)
    })

    test('hides the shelf once it only contains hidden shorts videos', () => {
        document.body.innerHTML = `
            <ytd-shelf-renderer id="shelf">
                <ytd-video-renderer id="shorts-video-1"><a href="/shorts/aaaaaaaaaaa"></a></ytd-video-renderer>
                <ytd-video-renderer id="shorts-video-2"><a href="/shorts/bbbbbbbbbbb"></a></ytd-video-renderer>
            </ytd-shelf-renderer>`;

        const hider = new t.HidingShortsWithContainer('ytd-video-renderer', 'ytd-shelf-renderer')
        expect(hider.hideShort(document.getElementById('shorts-video-1'))).toBe(true)
        // sibling still visible, shelf stays visible
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(false)
        expect(hider.hideShort(document.getElementById('shorts-video-2'))).toBe(true)
        // all videos hidden -> also hide the shelf
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(true)
    })

    test('showShort unhides the video and the shelf', () => {
        document.body.innerHTML = `
            <ytd-shelf-renderer id="shelf">
                <ytd-video-renderer id="shorts-video-1"><a href="/shorts/aaaaaaaaaaa"></a></ytd-video-renderer>
                <ytd-video-renderer id="shorts-video-2"><a href="/shorts/bbbbbbbbbbb"></a></ytd-video-renderer>
            </ytd-shelf-renderer>`;

        const hider = new t.HidingShortsWithContainer('ytd-video-renderer', 'ytd-shelf-renderer')
        expect(hider.hideShort(document.getElementById('shorts-video-1'))).toBe(true)
        expect(hider.hideShort(document.getElementById('shorts-video-2'))).toBe(true)
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(true)

        hider.showShort(document.getElementById('shorts-video-1'))
        expect(document.getElementById('shorts-video-1').hasAttribute('hidden')).toBe(false)
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(false)
    })

    test('showShort ignores videos without a shorts link', () => {
        const hider = makeShelf()
        hider.hideShort(document.getElementById('shorts-video'))
        document.getElementById('shelf').setAttribute('hidden', true)

        hider.showShort(document.getElementById('normal-video'))
        expect(document.getElementById('normal-video').hasAttribute('hidden')).toBe(false)
        // untouched video keeps its state
        expect(document.getElementById('shelf').hasAttribute('hidden')).toBe(true)
    })

    test('works with other tag names (ytd-item-section-renderer container)', () => {
        document.body.innerHTML = `
            <div>
                <ytd-item-section-renderer id="item-section" hidden>
                    <ytd-video-renderer id="shorts-video" hidden><a href="/shorts/abcdefghijk"></a></ytd-video-renderer>
                </ytd-item-section-renderer>
            </div>`;

        const hider = new t.HidingShortsWithContainer('ytd-video-renderer', 'ytd-item-section-renderer')
        hider.showShort(document.getElementById('shorts-video'))
        expect(document.getElementById('shorts-video').hasAttribute('hidden')).toBe(false)
        expect(document.getElementById('item-section').hasAttribute('hidden')).toBe(false)
    })
})

describe('RearrangeVideosInGrid', () => {
    // Videos are appended to the row's div without whitespace in between,
    // because the rearranging moves childNodes[0] (a whitespace text node
    // would be moved instead of a video) - real YouTube DOM has no
    // whitespace inside these nodes either.
    const makeGrid = (itemsPerRowPerElement = true) => {
        const item = (id, perRow) => `<ytd-rich-item-renderer id="${id}" ${perRow ? 'items-per-row="3"' : ''}>X</ytd-rich-item-renderer>`
        document.body.innerHTML =
            `<ytd-rich-grid-renderer>`
            + `<ytd-rich-grid-row><div>`
            + item('a', itemsPerRowPerElement) + item('b') + item('c')
            + `</div></ytd-rich-grid-row>`
            + `<ytd-rich-grid-row><div>`
            + item('d') + item('e') + item('f')
            + `</div></ytd-rich-grid-row>`
            + `</ytd-rich-grid-renderer>`;
    }
    const childrenIds = (row) => [...row.querySelector('div').children].map((child) => child.id)
    const getRow = (index) => document.querySelectorAll('ytd-rich-grid-row')[index]

    test('pulls one video from the next row to fill the gap of a hidden element', () => {
        makeGrid()
        const elementA = document.getElementById('a')
        elementA.setAttribute('hidden', true) // element is hidden before rearranging

        new t.RearrangeVideosInGrid().execute(elementA)

        // element A is removed and video D is moved from row 2 to row 1
        expect(document.getElementById('a')).toBe(null)
        expect(childrenIds(getRow(0))).toEqual(['b', 'c', 'd'])
        expect(childrenIds(getRow(1))).toEqual(['e', 'f'])
    })

    test('does nothing without the items-per-row attribute', () => {
        makeGrid(false)
        const elementA = document.getElementById('a')
        elementA.setAttribute('hidden', true)

        new t.RearrangeVideosInGrid().execute(elementA)

        expect(document.getElementById('a')).not.toBe(null)
        expect(childrenIds(getRow(0))).toEqual(['a', 'b', 'c'])
        expect(childrenIds(getRow(1))).toEqual(['d', 'e', 'f'])
    })

    test('does nothing when the element is not inside a rich grid row', () => {
        document.body.innerHTML = `
            <ytd-rich-grid-renderer>
                <div>
                    <ytd-rich-item-renderer id="a" items-per-row="3">A</ytd-rich-item-renderer>
                </div>
            </ytd-rich-grid-renderer>`;

        const elementA = document.getElementById('a')
        new t.RearrangeVideosInGrid().execute(elementA)
        expect(document.getElementById('a')).not.toBe(null)
    })
})
