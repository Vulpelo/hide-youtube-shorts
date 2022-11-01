window.onload = function() {

    chrome.storage.local.get(null, function(value){
        document.getElementById("hideYTShortsVideosInput").checked = value.hideYTShortsVideos;
        document.getElementById("hideYTShortsTabInput").checked = value.hideYTShortsTab;
    });

    document.querySelectorAll(".setting>input").forEach(function(element){
        element.addEventListener("input", function(e){
            switch(e.target.id){
                case "hideYTShortsVideosInput":
                    chrome.storage.local.set({hideYTShortsVideos:e.target.checked});
                    break;

                case "hideYTShortsTabInput":
                    chrome.storage.local.set({hideYTShortsTab:e.target.checked});
                    break;
            }
        });
    });


    // Set language
    document.getElementById("hide_videos_text").innerHTML=chrome.i18n.getMessage("cfg_hide_videos");
    document.getElementById("hide_tab_text").innerHTML=chrome.i18n.getMessage("cfg_hide_tab");
    document.getElementById("settingsText").innerHTML=chrome.i18n.getMessage("setting_text");

    // version
    let manifestData = chrome.runtime.getManifest();
    document.getElementById("ext-version").innerHTML = "v" + manifestData.version;
};
