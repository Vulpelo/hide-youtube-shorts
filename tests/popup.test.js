const { loadPopupScript } = require('./helpers/content-script-env')

const CHECKBOX_IDS = [
    'hideYTShortsVideosInput',
    'hideYTShortsTabInput',
    'hideYTShortsNotificationsInput',
    'hideYTPlayablesInput',
    'hideYTShortsVideosOnHomePageInput',
    'hideYTShortsVideosOnSubscriptionPageInput',
    'hideYTShortsVideosOnSearchPageInput',
    'hideYTShortsVideosOnChannelPageInput',
    'subscriptionShelfCloseButtonInputCheckbox',
    'shortsInOriginalVideoPlayerInputCheckbox',
    'hidingShortsTimeoutTimeMsInputCheckbox',
    'hidingShortVideosTimeSecondsInputCheckbox',
    'hidingLiveVideosInputCheckbox',
    'hidingUpcomingVideosInputCheckbox',
    'hidingPostsCheckbox',
    'hidingCustomElementsCheckbox',
]

const TEXT_FIELD_IDS = [
    'active_text',
    'custom_elements_to_hide_text',
    'custom_elements_to_hide_tooltip_text',
    'hide_live_videos_text',
    'hide_notifications_text',
    'hide_playables_text',
    'hide_posts_text',
    'hide_shorts_timeout_text',
    'hide_shorts_timeout_tooltip_text',
    'hide_short_videos_text',
    'hide_short_videos_tooltip_text',
    'hide_tab_text',
    'hide_upcoming_videos_text',
    'hide_videos_channel_text',
    'hide_videos_home_text',
    'hide_videos_search_text',
    'hide_videos_subscription_text',
    'hide_videos_text',
    'more_dropdown_text',
    'query_selector_textbox_text',
    'settings_experimental_text',
    'settings_hiding_on_text',
    'settings_performance_text',
    'settings_text',
    'shorts_in_original_video_player_text',
    'subscription_shelf_close_button_text',
    'subscription_shelf_close_button_tooltip_text',
]

const setupPopupDom = () => {
    const checkboxes = CHECKBOX_IDS
        .map((id) => `<input type="checkbox" id="${id}">`)
        .join('\n')
    const textFields = TEXT_FIELD_IDS
        .map((id) => `<span id="${id}"></span>`)
        .join('\n')
    document.body.innerHTML = `
    <details id="detailsEl"></details>
    <span class="tooltip"><span class="tooltiptext" id="tooltipText"></span></span>
    ${checkboxes}
    ${textFields}
    <input type="number" id="hidingShortsTimeoutTimeMsInput" min="0" max="10000">
    <input type="number" id="hidingShortVideosTimeSecondsInput" min="0" max="1000">
    <textarea id="customElementsToHideInputText"></textarea>
    <button id="themeToggleBtn"></button>
    <span id="ext-version"></span>
  `
}

const inputEvent = (element) => element.dispatchEvent(new window.Event('input', { bubbles: true }))

/* popup.js runs setupTooltips at load and stores the real init in window.onload */
const bootPopup = (storage = {}) => {
    setupPopupDom()
    const { chrome } = loadPopupScript({ storage })
    window.onload()
    return { chrome }
}

beforeEach(() => {
    // jsdom's matchMedia is not implemented; stub it (light theme per default)
    window.matchMedia = jest.fn(() => ({ matches: false }))
})

describe('popup load', () => {
    test('fills the controls from storage', () => {
        bootPopup({
            hideYTShortsVideos: false,
            hideYTShortsTab: true,
            hidingShortsTimeoutTimeMs: 250,
            userDefinedElementsToHide: 'div.foo',
        })

        expect(document.getElementById('hideYTShortsVideosInput').checked).toBe(false)
        expect(document.getElementById('hideYTShortsTabInput').checked).toBe(true)
        // check boxes with no stored value keep their default
        expect(document.getElementById('hideYTPlayablesInput').checked).toBe(false)
        expect(document.getElementById('hidingShortsTimeoutTimeMsInput').value).toBe('250')
        expect(document.getElementById('customElementsToHideInputText').value).toBe('div.foo')
    })

    test('writes the toggle state to storage on input', () => {
        const { chrome } = bootPopup()
        const input = document.getElementById('hideYTShortsVideosInput')

        input.checked = true
        inputEvent(input)
        expect(chrome._storage.hideYTShortsVideos).toBe(true)

        input.checked = false
        inputEvent(input)
        expect(chrome._storage.hideYTShortsVideos).toBe(false)
    })

    test('writes the custom elements text to storage on input', () => {
        const { chrome } = bootPopup()
        const textarea = document.getElementById('customElementsToHideInputText')

        textarea.value = '.my-element\n// comment\na[href^="/shorts/"]'
        inputEvent(textarea)
        expect(chrome._storage.userDefinedElementsToHide)
            .toBe('.my-element\n// comment\na[href^="/shorts/"]')
    })

    test('clamps the timeout input to its bounds', () => {
        const { chrome } = bootPopup()
        const input = document.getElementById('hidingShortsTimeoutTimeMsInput')

        input.value = '20000'
        inputEvent(input)
        expect(input.value).toBe('10000')
        // the value lands in storage as a string
        expect(chrome._storage.hidingShortsTimeoutTimeMs).toBe('10000')

        input.value = '-5'
        inputEvent(input)
        expect(input.value).toBe('0')
        expect(chrome._storage.hidingShortsTimeoutTimeMs).toBe('0')

        input.value = '500'
        inputEvent(input)
        expect(input.value).toBe('500')
        expect(chrome._storage.hidingShortsTimeoutTimeMs).toBe('500')
    })

    test('clamps the short-video-length input to its bounds', () => {
        const { chrome } = bootPopup()
        const input = document.getElementById('hidingShortVideosTimeSecondsInput')

        input.value = '9999'
        inputEvent(input)
        expect(input.value).toBe('1000')
        expect(chrome._storage.hidingShortVideosTimeSeconds).toBe('1000')

        input.value = '-1'
        inputEvent(input)
        expect(input.value).toBe('0')
        expect(chrome._storage.hidingShortVideosTimeSeconds).toBe('0')
    })

    test('sets the texts from the locales', () => {
        bootPopup()

        expect(document.getElementById('hide_videos_text').textContent).toBe('Hide Shorts videos')
        expect(document.getElementById('custom_elements_to_hide_text').textContent).toBe('Custom elements to hide')
    })

    test('sets the extension version', () => {
        bootPopup()

        expect(document.getElementById('ext-version').textContent).toBe('v0.0.0-test')
    })
})

describe('popup theme', () => {
    test('system dark preference applies dark theme', () => {
        window.matchMedia = jest.fn(() => ({ matches: true }))
        bootPopup()

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    test('stored theme overrides the system preference', () => {
        window.matchMedia = jest.fn(() => ({ matches: true }))
        bootPopup({ theme: 'light' })

        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    test('toggle flips the theme and stores it', () => {
        const { chrome } = bootPopup({ theme: 'dark' })
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

        const button = document.getElementById('themeToggleBtn')
        button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))

        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(chrome._storage.theme).toBe('light')

        button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(chrome._storage.theme).toBe('dark')
    })
})
