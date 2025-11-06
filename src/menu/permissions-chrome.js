function shortsInOriginalVideoPlayerCheckboxPermission(e) {
    if (e.target.checked) {
        chrome.permissions.request(
            {permissions: ['tabs']},
            (granted) => {
                chrome.storage.local.set({ shortsInOriginalVideoPlayer: granted });
            });
    } 
    else {
        chrome.permissions.remove({permissions: ['tabs']});
        chrome.storage.local.set({ shortsInOriginalVideoPlayer: false });
    }
}
