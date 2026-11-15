const { loadContentScripts } = require('./helpers/content-script-env')

const t = loadContentScripts()
const chrome = t.chromeGet()

jest.useFakeTimers()

beforeEach(() => {
    t.clearShortsTimeout()
    jest.clearAllTimers()
    for (const key of Object.keys(chrome._storage)) delete chrome._storage[key]
})

afterAll(() => {
    jest.useRealTimers()
})

describe('hidingShortsTimeout', () => {
    test('calls the callback only once, after the default timeout', () => {
        const callback = jest.fn()
        t.hidingShortsTimeout(callback)

        jest.advanceTimersByTime(499)
        expect(callback).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)

        // the timeout is no longer active - it would schedule a new one
        jest.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('ignores repeated calls while a timeout is pending', () => {
        const callback = jest.fn()
        t.hidingShortsTimeout(callback)
        t.hidingShortsTimeout(callback)
        t.hidingShortsTimeout(callback)

        jest.advanceTimersByTime(500)
        // one pending timeout instead of three
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('clearShortsTimeout cancels the pending callback', () => {
        const callback = jest.fn()
        t.hidingShortsTimeout(callback)

        t.clearShortsTimeout()
        jest.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()

        // after clearing, a new callback can be scheduled again
        t.hidingShortsTimeout(callback)
        jest.advanceTimersByTime(500)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('uses the timeout from storage when given', () => {
        chrome._storage.hidingShortsTimeoutTimeMs = 100
        // the value is loaded once via loadVariables, not per hidingShortsTimeout call
        t.loadVariables(chrome._storage)
        const callback = jest.fn()

        t.hidingShortsTimeout(callback)
        jest.advanceTimersByTime(100)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('keeps the storage timeout for subsequent calls', () => {
        const callback = jest.fn()

        t.loadVariables(chrome._storage)
        t.hidingShortsTimeout(callback)
        jest.advanceTimersByTime(500)
        expect(callback).toHaveBeenCalledTimes(1)

        chrome._storage.hidingShortsTimeoutTimeMs = 150
        t.loadVariables(chrome._storage)
        t.hidingShortsTimeout(callback)
        jest.advanceTimersByTime(149)
        expect(callback).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(2)

        t.hidingShortsTimeout(callback)
        jest.advanceTimersByTime(150)
        expect(callback).toHaveBeenCalledTimes(3)
    })

    test('does not read the storage on each call', () => {
        t.loadVariables(chrome._storage)
        const callback = jest.fn()

        const getSpy = jest.spyOn(chrome.storage.local, 'get')
        t.hidingShortsTimeout(callback)
        t.hidingShortsTimeout(callback)

        jest.advanceTimersByTime(500)
        expect(callback).toHaveBeenCalledTimes(1)
        expect(getSpy).not.toHaveBeenCalled()

        getSpy.mockRestore()
    })
})
