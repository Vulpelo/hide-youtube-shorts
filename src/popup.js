window.onload = function() {

    chrome.storage.local.get(null, function(value)
    {
        // hide shorts
        let hideYTShortsInput = document.getElementById("hideYTShortsVideosInput");
        hideYTShortsInput.checked = value.hideYTShortsVideos;
        hideYTShortsInput.addEventListener("input", function(e) {
            chrome.storage.local.set({hideYTShortsVideos: e.target.checked});
        })

        // hide tab
        let hideYTShortsTabInput = document.getElementById("hideYTShortsTabInput");
        hideYTShortsTabInput.checked = value.hideYTShortsTab;
        hideYTShortsTabInput.addEventListener("input", function(e) {
            chrome.storage.local.set({hideYTShortsTab: e.target.checked});
        })

        // rearrange
        let rearrangeVideosAfterHidingAShortInput = document.getElementById("rearrangeVideosAfterHidingAShortInput");
        rearrangeVideosAfterHidingAShortInput.checked = value.rearrangeVideosAfterHidingAShort;
        rearrangeVideosAfterHidingAShortInput.addEventListener("input", function(e) {
            chrome.storage.local.set({rearrangeVideosAfterHidingAShort: e.target.checked});
        })

        // timeout
        let hidingShortsTimeoutTimeMsInput = document.getElementById("hidingShortsTimeoutTimeMsInput");
        hidingShortsTimeoutTimeMsInput.value = value.hidingShortsTimeoutTimeMs;
        hidingShortsTimeoutTimeMsInput.addEventListener("input", function(e) {
            chrome.storage.local.set({hidingShortsTimeoutTimeMs: e.target.value});
        })
        let hidingShortsTimeoutTimeMsInputCheckbox = document.getElementById("hidingShortsTimeoutTimeMsInputCheckbox");
        hidingShortsTimeoutTimeMsInputCheckbox.checked = value.hidingShortsTimeoutActive;
        hidingShortsTimeoutTimeMsInputCheckbox.addEventListener("input", function(e) {
            chrome.storage.local.set({hidingShortsTimeoutActive: e.target.checked});
        })
        
    });

    // Set language
    document.getElementById("hide_videos_text").textContent=chrome.i18n.getMessage("cfg_hide_videos");
    document.getElementById("hide_tab_text").textContent=chrome.i18n.getMessage("cfg_hide_tab");
    document.getElementById("settings_text").textContent=chrome.i18n.getMessage("setting_text");
    document.getElementById("settings_experimental_text").textContent=chrome.i18n.getMessage("setting_experimental_text");
    document.getElementById("more_dropdown_text").textContent=chrome.i18n.getMessage("more_dropdown_text");
    document.getElementById("fill_gaps_text").textContent=chrome.i18n.getMessage("cfg_fill_gaps");
    document.getElementById("fill_gaps_tooltip_text").textContent=chrome.i18n.getMessage("cfg_fill_gaps_tooltip");
    document.getElementById("hide_shorts_timeout_tooltip_text").textContent=chrome.i18n.getMessage("cfg_hide_shorts_timeout_tooltip");
    document.getElementById("hide_shorts_timeout_text").textContent=chrome.i18n.getMessage("cfg_hide_shorts_timeout");
    
    // version
    let manifestData = chrome.runtime.getManifest();
    document.getElementById("ext-version").textContent = "v" + manifestData.version;
};
