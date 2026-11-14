const { loadContentScripts } = require('./helpers/content-script-env')

const t = loadContentScripts()

const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('hideElement', () => {
    test('hide adds "hidden" attribute and calls onHideCallback only once', () => {
        document.body.innerHTML = '<div id="e"></div>'
        const element = document.getElementById('e')
        const onHideCallback = jest.fn()

        t.hideElement(true, element, onHideCallback)
        expect(element.hasAttribute('hidden')).toBe(true)

        // already hidden - callback should not be called again
        t.hideElement(true, element, onHideCallback)
        expect(onHideCallback).toHaveBeenCalledTimes(1)
    })

    test('hide without callback works', () => {
        document.body.innerHTML = '<div id="e"></div>'
        const element = document.getElementById('e')

        t.hideElement(true, element)
        expect(element.hasAttribute('hidden')).toBe(true)
    })

    test('show removes "hidden" attribute', () => {
        document.body.innerHTML = '<div id="e" hidden></div>'
        const element = document.getElementById('e')

        t.hideElement(false, element)
        expect(element.hasAttribute('hidden')).toBe(false)
    })

    test('show on not hidden element is a no-op', () => {
        document.body.innerHTML = '<div id="e"></div>'
        const element = document.getElementById('e')

        t.hideElement(false, element)
        expect(element.hasAttribute('hidden')).toBe(false)
    })
})

describe('waitForElement', () => {
    test('returns element immediately if it is already in DOM', async () => {
        document.body.innerHTML = '<div><button id="target"></button></div>'

        const element = await t.waitForElement('#target', document.body)
        expect(element).toBe(document.getElementById('target'))
    })

    test('waits for a mutation adding the element', async () => {
        document.body.innerHTML = '<div id="container"></div>'

        const promise = t.waitForElement('#late', document.body)
        document.getElementById('container').innerHTML = '<a id="late"></a>'

        const element = await promise
        expect(element).toBe(document.getElementById('late'))
    })
})

describe('waitForElementTimeout', () => {
    test('returns element immediately if it is already in DOM', async () => {
        document.body.innerHTML = '<div id="fast"></div>'

        const element = await t.waitForElementTimeout('#fast', document.body, { timeout_ms: 100 })
        expect(element).toBe(document.getElementById('fast'))
    })

    test('returns element that is added before the timeout passes', async () => {
        document.body.innerHTML = '<div id="container"></div>'

        const promise = t.waitForElementTimeout('#arriving', document.body, { timeout_ms: 200 })
        document.getElementById('container').innerHTML = '<a id="arriving"></a>'

        const element = await promise
        expect(element).toBe(document.getElementById('arriving'))
    })

    test('resolves with null when the element does not appear in time', async () => {
        document.body.innerHTML = '<div id="container"></div>'

        const promise = t.waitForElementTimeout('#never-added', document.body, { timeout_ms: 10 })

        let resolvedValue = undefined
        let settled = false
        promise.then((value) => { resolvedValue = value; settled = true })

        await flushMutations()
        expect(settled).toBe(false)

        await new Promise((resolve) => setTimeout(resolve, 100))
        expect(settled).toBe(true)
        expect(resolvedValue).toBe(null)
    })
})

describe('manageObserver', () => {
    test('creates and reconnects an observer when active; callback fires on mutation', async () => {
        document.body.innerHTML = '<div id="observed"><ul></ul></div>'
        const observed = document.getElementById('observed')
        const callback = jest.fn()

        const returned = t.manageObserver('#observed', true, callback, null, { childList: true })
        // the observer is created asynchronously, so the initial call returns null
        expect(returned).toBe(null)
        await flushMutations()

        observed.appendChild(document.createElement('li'))
        await flushMutations()
        await flushMutations()
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('disconnects an existing observer when not active', async () => {
        document.body.innerHTML = '<div id="observed"></div>'
        const observed = document.getElementById('observed')
        const ownCallback = jest.fn()

        const observer = new MutationObserver(ownCallback)
        observer.observe(observed, { childList: true })

        const returned = t.manageObserver('#observed', false, () => {}, observer)
        expect(returned).toBe(null)

        observed.appendChild(document.createElement('span'))
        await flushMutations()
        expect(ownCallback).not.toHaveBeenCalled()
    })

    test('returns the same observer when one is already active', () => {
        const observer = new MutationObserver(() => {})
        const returned = t.manageObserver('#observed', true, () => {}, observer, { childList: true })
        expect(returned).toBe(observer)
        observer.disconnect()
    })

    test('creating observer for an element that appears later', async () => {
        document.body.innerHTML = '<div id="placeholder"></div>'
        const callback = jest.fn()

        t.manageObserver('#late-observed', true, callback, null, { childList: true })
        await flushMutations()

        const observed = document.createElement('div')
        observed.id = 'late-observed'
        document.querySelector('#placeholder').appendChild(observed)
        await flushMutations()

        observed.appendChild(document.createElement('b'))
        await flushMutations()
        // give the promise chain one more tick
        await flushMutations()

        expect(callback).toHaveBeenCalledTimes(1)
    })
})
