window.onload = function() {

    chrome.storage.local.get(null, function(value)
    {
        let hideYTShortsInput = document.getElementById("hideYTShortsVideosInput");
        hideYTShortsInput.checked = value.hideYTShortsVideos;
        hideYTShortsInput.addEventListener("input", function(e) {
            chrome.storage.local.set({hideYTShortsVideos: e.target.checked});
        })

        let hideYTShortsTabInput = document.getElementById("hideYTShortsTabInput");
        hideYTShortsTabInput.checked = value.hideYTShortsTab;
        hideYTShortsTabInput.addEventListener("input", function(e) {
            chrome.storage.local.set({hideYTShortsTab: e.target.checked});
        })
    });

    // Set language
    document.getElementById("hide_videos_text").textContent=chrome.i18n.getMessage("cfg_hide_videos");
    document.getElementById("hide_tab_text").textContent=chrome.i18n.getMessage("cfg_hide_tab");
    document.getElementById("settingsText").textContent=chrome.i18n.getMessage("setting_text");

    // version
    let manifestData = chrome.runtime.getManifest();
    document.getElementById("ext-version").textContent = "v" + manifestData.version;
};
