window.onload = function () {

    chrome.storage.local.get(null, function (value) {
        // hide shorts
        const hideYTShortsInput = document.getElementById("hideYTShortsVideosInput");
        if (value.hideYTShortsVideos != undefined)
            hideYTShortsInput.checked = value.hideYTShortsVideos;
        hideYTShortsInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsVideos: e.target.checked });
        })

        // hide tab
        const hideYTShortsTabInput = document.getElementById("hideYTShortsTabInput");
        if (value.hideYTShortsTab != undefined)
            hideYTShortsTabInput.checked = value.hideYTShortsTab;
        hideYTShortsTabInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsTab: e.target.checked });
        })

        // hide notifications
        const hideYTShortsNotificationsInput = document.getElementById("hideYTShortsNotificationsInput");
        if (value.hideYTShortsNotifications != undefined)
            hideYTShortsNotificationsInput.checked = value.hideYTShortsNotifications;
        hideYTShortsNotificationsInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsNotifications: e.target.checked });
        })

        // hide shorts Home
        const hideYTShortsHomeInput = document.getElementById("hideYTShortsVideosOnHomePageInput");
        if (value.hideYTShortsHome != undefined)
            hideYTShortsHomeInput.checked = value.hideYTShortsHome;
        hideYTShortsHomeInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsHome: e.target.checked });
        })
        // hide shorts Subscription
        const hideYTShortsVideosOnSubscriptionPageInput = document.getElementById("hideYTShortsVideosOnSubscriptionPageInput");
        if (value.hideYTShortsVideosOnSubscriptionPage != undefined)
            hideYTShortsVideosOnSubscriptionPageInput.checked = value.hideYTShortsVideosOnSubscriptionPage;
        hideYTShortsVideosOnSubscriptionPageInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsVideosOnSubscriptionPage: e.target.checked });
        })
        // hide shorts Search
        const hideYTShortsVideosOnSearchPageInput = document.getElementById("hideYTShortsVideosOnSearchPageInput");
        if (value.hideYTShortsVideosOnSearchPage != undefined)
            hideYTShortsVideosOnSearchPageInput.checked = value.hideYTShortsVideosOnSearchPage;
        hideYTShortsVideosOnSearchPageInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsVideosOnSearchPage: e.target.checked });
        })
        // hide shorts Channel
        const hideYTShortsVideosOnChannelPageInput = document.getElementById("hideYTShortsVideosOnChannelPageInput");
        if (value.hideYTShortsVideosOnChannelPage != undefined)
            hideYTShortsVideosOnChannelPageInput.checked = value.hideYTShortsVideosOnChannelPage;
        hideYTShortsVideosOnChannelPageInput.addEventListener("input", function (e) {
            chrome.storage.local.set({ hideYTShortsVideosOnChannelPage: e.target.checked });
        })

        // close button for shelf on subscription page 
        const subscriptionShelfCloseButtonInputCheckbox = document.getElementById("subscriptionShelfCloseButtonInputCheckbox");
        if (value.subscriptionShelfCloseButton != undefined)
            subscriptionShelfCloseButtonInputCheckbox.checked = value.subscriptionShelfCloseButton;
        subscriptionShelfCloseButtonInputCheckbox.addEventListener("input", function (e) {
            chrome.storage.local.set({ subscriptionShelfCloseButton: e.target.checked });
        })

        // redirect Url
        const shortsInOriginalVideoPlayerInputCheckbox = document.getElementById("shortsInOriginalVideoPlayerInputCheckbox");
        if (value.shortsInOriginalVideoPlayer != undefined)
            shortsInOriginalVideoPlayerInputCheckbox.checked = value.shortsInOriginalVideoPlayer;
        shortsInOriginalVideoPlayerInputCheckbox.addEventListener("input", function (e) {
            shortsInOriginalVideoPlayerCheckboxPermission(e)
        })

        // timeout
        const hidingShortsTimeoutTimeMsInput = document.getElementById("hidingShortsTimeoutTimeMsInput");
        if (value.hidingShortsTimeoutTimeMs != undefined)
            hidingShortsTimeoutTimeMsInput.value = value.hidingShortsTimeoutTimeMs;
        hidingShortsTimeoutTimeMsInput.addEventListener("input", function (e) {
            const minAttr = parseInt(e.target.min);
            const maxAttr = parseInt(e.target.max);
            if (minAttr > e.target.value)
                e.target.value = minAttr;
            else if (maxAttr < e.target.value)
                e.target.value = maxAttr;
            chrome.storage.local.set({ hidingShortsTimeoutTimeMs: e.target.value });
        })
        const hidingShortsTimeoutTimeMsInputCheckbox = document.getElementById("hidingShortsTimeoutTimeMsInputCheckbox");
        if (value.hidingShortsTimeoutActive != undefined)
            hidingShortsTimeoutTimeMsInputCheckbox.checked = value.hidingShortsTimeoutActive;
        hidingShortsTimeoutTimeMsInputCheckbox.addEventListener("input", function (e) {
            chrome.storage.local.set({ hidingShortsTimeoutActive: e.target.checked });
        })

        // hiding videos shorter than specified time
        const hidingShortVideosTimeSecondsInput = document.getElementById("hidingShortVideosTimeSecondsInput");
        if (value.hidingShortVideosTimeSeconds != undefined)
            hidingShortVideosTimeSecondsInput.value = value.hidingShortVideosTimeSeconds;
        hidingShortVideosTimeSecondsInput.addEventListener("input", function (e) {
            const minAttr = parseInt(e.target.min);
            const maxAttr = parseInt(e.target.max);
            if (minAttr > e.target.value)
                e.target.value = minAttr;
            else if (maxAttr < e.target.value)
                e.target.value = maxAttr;
            chrome.storage.local.set({ hidingShortVideosTimeSeconds: e.target.value });
        })
        const hidingShortVideosTimeSecondsInputCheckbox = document.getElementById("hidingShortVideosTimeSecondsInputCheckbox");
        if (value.hidingShortVideosActive != undefined)
            hidingShortVideosTimeSecondsInputCheckbox.checked = value.hidingShortVideosActive;
        hidingShortVideosTimeSecondsInputCheckbox.addEventListener("input", function (e) {
            chrome.storage.local.set({ hidingShortVideosActive: e.target.checked });
        })


        // hiding live videos
        const hidingLiveVideosInputCheckbox = document.getElementById("hidingLiveVideosInputCheckbox");
        if (value.hidingLiveVideosActive != undefined)
            hidingLiveVideosInputCheckbox.checked = value.hidingLiveVideosActive;
        hidingLiveVideosInputCheckbox.addEventListener("input", function (e) {
            chrome.storage.local.set({ hidingLiveVideosActive: e.target.checked });
        })

        // hiding upcoming videos
        const hidingUpcomingVideosInputCheckbox = document.getElementById("hidingUpcomingVideosInputCheckbox");
        if (value.hidingUpcomingVideosActive != undefined)
            hidingUpcomingVideosInputCheckbox.checked = value.hidingUpcomingVideosActive;
        hidingUpcomingVideosInputCheckbox.addEventListener("input", function (e) {
            chrome.storage.local.set({ hidingUpcomingVideosActive: e.target.checked });
        })
    });

    // Set language
    document.getElementById("hide_videos_text").textContent = chrome.i18n.getMessage("cfg_hide_videos");
    document.getElementById("hide_tab_text").textContent = chrome.i18n.getMessage("cfg_hide_tab");
    document.getElementById("hide_notifications_text").textContent = chrome.i18n.getMessage("cfg_hide_notifications");
    document.getElementById("settings_text").textContent = chrome.i18n.getMessage("setting_text");
    document.getElementById("settings_experimental_text").textContent = chrome.i18n.getMessage("setting_experimental_text");
    document.getElementById("settings_performance_text").textContent = chrome.i18n.getMessage("settings_performance_text");
    document.getElementById("more_dropdown_text").textContent = chrome.i18n.getMessage("more_dropdown_text");
    document.getElementById("hide_shorts_timeout_tooltip_text").textContent = chrome.i18n.getMessage("cfg_hide_shorts_timeout_tooltip");
    document.getElementById("hide_shorts_timeout_text").textContent = chrome.i18n.getMessage("cfg_hide_shorts_timeout");
    document.getElementById("settings_hiding_on_text").textContent = chrome.i18n.getMessage("settings_hiding_on_text");
    document.getElementById("hide_videos_home_text").textContent = chrome.i18n.getMessage("cfg_hide_videos_home");
    document.getElementById("hide_videos_subscription_text").textContent = chrome.i18n.getMessage("cfg_hide_videos_subscription");
    document.getElementById("hide_videos_search_text").textContent = chrome.i18n.getMessage("cfg_hide_videos_search");
    document.getElementById("hide_videos_channel_text").textContent = chrome.i18n.getMessage("cfg_hide_videos_channel");

    document.getElementById("subscription_shelf_close_button_tooltip_text").textContent = chrome.i18n.getMessage("cfg_subscription_shelf_close_button_tooltip");
    document.getElementById("subscription_shelf_close_button_text").textContent = chrome.i18n.getMessage("cfg_subscription_shelf_close_button");

    document.getElementById("hide_short_videos_tooltip_text").textContent = chrome.i18n.getMessage("cfg_hide_short_videos_tooltip");
    document.getElementById("hide_short_videos_text").textContent = chrome.i18n.getMessage("cfg_hide_short_videos");

    document.getElementById("hide_live_videos_text").textContent = chrome.i18n.getMessage("cfg_hide_live_videos");
    document.getElementById("hide_upcoming_videos_text").textContent = chrome.i18n.getMessage("cfg_hide_upcoming_videos");
    document.getElementById("shorts_in_original_video_player_text").textContent = chrome.i18n.getMessage("cfg_shorts_in_original_video_player");

    // version
    let manifestData = chrome.runtime.getManifest();
    document.getElementById("ext-version").textContent = "v" + manifestData.version;
};

const tooltips = document.querySelectorAll(".tooltip");
const details = document.querySelector("details");

tooltips.forEach(tooltip => {
    tooltip.onmouseover = function (e) {
        const detailsY = details.getBoundingClientRect().bottom;
        const tooltipRect = tooltip.getBoundingClientRect()

        const tooltipText = tooltip.querySelector(".tooltiptext");
        tooltipText.style.bottom = (detailsY - tooltipRect.bottom + tooltipRect.height) + 'px';
    };
});
