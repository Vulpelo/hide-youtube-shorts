function shortsInOriginalVideoPlayerCheckboxPermission(e) {
    if (e.target.checked) {
        browser.permissions.request({permissions: ['tabs']})
            .then((granted) => {
                chrome.storage.local.set({ shortsInOriginalVideoPlayer: granted });
            });
    } 
    else {
        browser.permissions.remove({permissions: ['tabs']});
        chrome.storage.local.set({ shortsInOriginalVideoPlayer: false });
    }
}
