const { loadContentScripts } = require('./helpers/content-script-env')

const t = loadContentScripts()

describe('formatUserDefinedElements', () => {
    test('empty string', () => {
        expect(t.formatUserDefinedElements('')).toBe('')
    })

    test('single selector is passed through without a leading comma', () => {
        expect(t.formatUserDefinedElements('ytd-rich-item-renderer')).toBe('ytd-rich-item-renderer')
    })

    test('multiple selectors are joined with commas', () => {
        expect(t.formatUserDefinedElements('div.foo\nspan.bar')).toBe('div.foo,span.bar')
    })

    test('lines are trimmed', () => {
        expect(t.formatUserDefinedElements('  \t div.foo \n\tspan.bar  ')).toBe('div.foo,span.bar')
    })

    test('// comments and blank lines are skipped', () => {
        expect(t.formatUserDefinedElements('// comment\ndiv.foo\n\n  // another\nspan.bar'))
            .toBe('div.foo,span.bar')
    })

    test('only comments results in empty string', () => {
        expect(t.formatUserDefinedElements('// a\n// b\n\n   ')).toBe('')
    })

    test('windows line endings are handled', () => {
        expect(t.formatUserDefinedElements('div.foo\r\nspan.bar')).toBe('div.foo,span.bar')
    })
})
