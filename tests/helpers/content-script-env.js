/**
 * Test environment for the content scripts.
 *
 * All content scripts of this extension run in a single shared global scope
 * (like a browser extension's isolated world): function/var declarations and
 * the top-level `const` bindings of one file are visible in the others, in
 * manifest order.  The loader below emulates that with a dedicated vm
 * context seeded with the jsdom `document`/`location` and a chrome stub.
 *
 * A handle with the shared state that tests need is returned from
 * `loadContentScripts()`; files without cross-file `const` sharing
 * (popup.js, background) are simply evaluated on the jsdom window.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC_DIR = path.resolve(__dirname, '..', '..', 'src');
const EN_MESSAGES = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', '..', '_locales', 'en', 'messages.json'), 'utf8')
);

/* Content scripts in the same order as in manifest-chrome.json */
const CONTENT_SCRIPTS = [
    'utils.js',
    'closeShelfButton.js',
    'hidingShortsTimeout.js',
    'hidingNonShorts.js',
    'hidingNotifications.js',
    'HidingShortsMore.js',
    'main.js',
];

/* Both hidingNonShorts.js and hidingNotifications.js declare the same
 * top-level `const isMobile`; in the shared global scope only the first
 * declaration is evaluated and later ones are replaced with a comment. */
const IS_MOBILE_DECL = 'const isMobile = location.hostname == "m.youtube.com";';

function createChromeStub(storage = {}) {
    const storageChangedListeners = [];
    const tabUpdateListenerApi = {
        _listeners: [],
        addListener(fn) { this._listeners.push(fn); },
        removeListener(fn) { this._listeners = this._listeners.filter((f) => f !== fn); },
        hasListener(fn) { return this._listeners.includes(fn); },
    };

    return {
        storage: {
            local: {
                get(query, callback) {
                    let result;
                    if (query === null || query === undefined) {
                        result = { ...storage };
                    } else if (Array.isArray(query)) {
                        result = {};
                        query.forEach((key) => { if (key in storage) result[key] = storage[key]; });
                    } else if (typeof query === 'object') {
                        result = {};
                        Object.entries(query).forEach(([key, fallback]) => {
                            result[key] = key in storage ? storage[key] : fallback;
                        });
                    } else {
                        result = {};
                        if (query in storage) result[query] = storage[query];
                    }
                    if (typeof callback === 'function') callback(result);
                },
                set(obj) {
                    Object.assign(storage, obj);
                },
            },
            onChanged: {
                addListener(fn) { storageChangedListeners.push(fn); },
            },
        },
        runtime: {
            getManifest: () => ({ version: '0.0.0-test' }),
            getURL: (p) => 'chrome-extension://test/' + p,
        },
        i18n: {
            getMessage: (key) => (EN_MESSAGES[key] && EN_MESSAGES[key].message) || '',
        },
        tabs: {
            update: jest.fn(),
            onUpdated: tabUpdateListenerApi,
        },
        permissions: {
            request: (opts, callback) => callback && callback(true),
            remove: () => {},
        },

        /* helpers for tests */
        _storage: storage,
        _storageChangedListeners: storageChangedListeners,
        _fireStorageChanged: (evt = {}) => storageChangedListeners.slice().forEach((fn) => fn(evt)),
        _tabsOnUpdated: tabUpdateListenerApi,
    };
}

/* jsdom window's Location object is recreated when the URL is reconfigured,
 * so expose the used properties through getters instead. */
function makeLocationProxy() {
    return {
        get href() { return window.location.href },
        get hostname() { return window.location.hostname },
        get pathname() { return window.location.pathname },
        get origin() { return window.location.origin },
    };
}

/* Timer indirection so jest's fake timers (which replace globalThis
 * timers) control the timers the content scripts use. */
function lazyTimer(name) {
    return function (...args) {
        return globalThis[name](...args);
    };
}

function createContentScriptContext(chrome) {
    const sandbox = {
        document,
        window,
        chrome,
        MutationObserver,
        console,
        setTimeout: lazyTimer('setTimeout'),
        clearTimeout: lazyTimer('clearTimeout'),
        setInterval: lazyTimer('setInterval'),
        clearInterval: lazyTimer('clearInterval'),
        location: makeLocationProxy(),
    };
    vm.createContext(sandbox);
    return sandbox;
}

function runIn(content, context, name) {
    vm.runInContext(content + '\n//# sourceURL=' + name, context);
    return context;
}

/**
 * Loads the content scripts (defaults to the full set, in manifest order)
 * into a fresh vm context that emulates the shared global scope and returns
 * a handle with test-relevant references.  Call at most once per test file.
 */
function loadContentScripts({ isMobile = false, storage = {}, files = CONTENT_SCRIPTS } = {}) {
    jsdom.reconfigure({
        url: isMobile ? 'https://m.youtube.com/' : 'https://www.youtube.com/',
    });

    const chrome = createChromeStub(storage);
    global.chrome = chrome;

    const context = createContentScriptContext(chrome);

    let mobileDeclStripped = false;
    for (const file of files) {
        let content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
        if (content.includes(IS_MOBILE_DECL)) {
            if (mobileDeclStripped) {
                content = content.replace(IS_MOBILE_DECL, '/* isMobile already declared in the shared global scope */\n');
            }
            mobileDeclStripped = true;
        }
        runIn(content, context, 'src/' + file);
    }

    runIn(`
        globalThis.__handle = {
            /* utils.js */
            waitForElement, waitForElementTimeout, hideElement, manageObserver,
            /* HidingShortsMore.js */
            HidingShortsWithContainer, RearrangeVideosInGrid,
            hideContainerOfElement, _allChildrenHidden, _findParentWithElementTag,
            /* hidingNonShorts.js */
            isMobile: () => isMobile,
            hideNonShorts, formatUserDefinedElements, _hideCustom,
            /* hidingShortsTimeout.js */
            hidingShortsTimeout, clearShortsTimeout,
            /* main.js */
            isLocationPathNameToIgnore, locationPathNameNodes, loadVariables,
            hideShortsDesktop, hideShortsMobile, hideShortsTabDesktop, hideShortsTabMobile,
            executeMethods, hideShortsCallback,
            hideShortsCallbackInner: () => hideShortsCallbackInner,
            pathNames: hidingShortsOnPathNames,
            pathNamesReset: () => Object.values(hidingShortsOnPathNames).forEach((entry) => { entry.node = null; }),
            pageManagerNode: () => pageManagerNode,
            chromeGet: () => chrome,
            state: () => ({
                hideYTShortsVideos, hideYTShortsTab, hideYTPlayables,
                hidingShortsTimeoutActive,
                hidingShortVideosActive, hidingShortVideosTimeSeconds,
                hideCustomElements, hidingVideoTypes: hidingVideoTypes.slice(),
                combinedSelectorsToQuery,
                hidingMethodsToExecute: hidingMethodsToExecute.slice(),
            }),
        };
    `, context, 'test-capture.js');

    const handle = context.__handle;
    delete context.__handle;
    return handle;
}

/**
 * Loads src/menu/popup.js.  Set the popup DOM up before calling; the script
 * runs top-level code (setupTooltips) immediately and registers window.onload.
 */
function loadPopupScript({ storage = {} } = {}) {
    const chrome = createChromeStub(storage);
    global.chrome = chrome;
    window.eval(fs.readFileSync(path.join(SRC_DIR, 'menu', 'popup.js'), 'utf8') + '\n//# sourceURL=popup.js');
    return { chrome };
}

/** Loads the (chrome flavour) background script and returns its internals. */
function loadBackgroundScript({ storage = {} } = {}) {
    const chrome = createChromeStub(storage);
    global.chrome = chrome;

    const content = fs.readFileSync(path.join(SRC_DIR, 'background', 'background-chrome.js'), 'utf8');
    // capture the file-local bindings in the same evaluation
    window.eval(content + `
        window.__background = { onTabUpdated, setupBackground, urlPattern };
    //# sourceURL=background-capture.js
    `);
    const handle = window.__background;
    delete window.__background;
    return { chrome, ...handle };
}

module.exports = {
    createChromeStub,
    loadContentScripts,
    loadPopupScript,
    loadBackgroundScript,
};
