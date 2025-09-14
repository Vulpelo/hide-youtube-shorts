const element = `
<ytd-item-section-renderer class="style-scope ytd-section-list-renderer" lockup-container-type="3" enable-anchored-panel="" page-subtype="subscriptions" header-style="">
  <!--css-build:shady--><!--css_build_scope:ytd-item-section-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
  <div id="header" class=" style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer"></div>
  <div id="spinner-container" class="style-scope ytd-item-section-renderer">
    <tp-yt-paper-spinner-lite class="style-scope ytd-item-section-renderer" aria-hidden="true" aria-label="loading">
      <!--css-build:shady--><!--css_build_scope:tp-yt-paper-spinner-lite--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_spinner_lite.tp.yt.paper.spinner.lite.css.js-->
      <div id="spinnerContainer" class="  style-scope tp-yt-paper-spinner-lite">
        <div class="spinner-layer style-scope tp-yt-paper-spinner-lite">
          <div class="circle-clipper left style-scope tp-yt-paper-spinner-lite">
            <div class="circle style-scope tp-yt-paper-spinner-lite"></div>
          </div>
          <div class="circle-clipper right style-scope tp-yt-paper-spinner-lite">
            <div class="circle style-scope tp-yt-paper-spinner-lite"></div>
          </div>
        </div>
      </div>
    </tp-yt-paper-spinner-lite>
  </div>
  <div id="contents" class=" style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer">
    <ytd-shelf-renderer class="style-scope ytd-item-section-renderer" thumbnail-style="">
      <!--css-build:shady--><!--css_build_scope:ytd-shelf-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
      <div id="dismissible" class="style-scope ytd-shelf-renderer">
        <div class="grid-subheader style-scope ytd-shelf-renderer">
          <div id="title-container" class="style-scope ytd-shelf-renderer">
            <h2 class="style-scope ytd-shelf-renderer">
              <ps-dom-if class="style-scope ytd-shelf-renderer">
                <template is="dom-if"></template>
              </ps-dom-if>

              <div id="image-container" class="style-scope ytd-shelf-renderer">
                <a class="yt-simple-endpoint style-scope ytd-shelf-renderer" aria-hidden="true" tabindex="-1" href="/@kremlinkashow" title="KREMLINKA SHOW">
                  <yt-img-shadow id="avatar" class="style-scope ytd-shelf-renderer no-transition"
                    style="background-color: transparent;"
                    loaded=""><!--css-build:shady--><!--css_build_scope:yt-img-shadow--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_img_shadow.yt.img.shadow.css.js--><img
                      id="img" draggable="false" class="style-scope yt-img-shadow" alt=""
                      src="//yt3.ggpht.com/Ce52mnvWTOr15TJf8VesI0wgyKJTyPSVztLrIyl2PuL70sT176-jYUj2oxpvYmrj5mpOlaAw2Q=s88-c-k-c0x00ffffff-no-rj"></yt-img-shadow>
                  <yt-icon id="icon" class="style-scope ytd-shelf-renderer" disable-upgrade="" hidden="">
                  </yt-icon>
                </a>
                <div id="title-text" class="style-scope ytd-shelf-renderer">
                  <a class="yt-simple-endpoint style-scope ytd-shelf-renderer" href="/@kremlinkashow">
                    <span id="title" class="style-scope ytd-shelf-renderer">KREMLINKA SHOW</span>
                  </a>
                  <ytd-badge-supported-renderer id="title-featured-badge" class="style-scope ytd-shelf-renderer"
                    system-icons=""
                    hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                      id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer">
                      <template is="dom-repeat"></template>
                    </dom-repeat>
                  </ytd-badge-supported-renderer>
                  <yt-formatted-string id="title-annotation" class="style-scope ytd-shelf-renderer" hidden=""
                    is-empty=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string
                      class="style-scope yt-formatted-string">
                    </yt-attributed-string>
                  </yt-formatted-string>
                </div>
              </div>
              <ps-dom-if class="style-scope ytd-shelf-renderer">
                <template is="dom-if"></template>
              </ps-dom-if>
              <ytd-badge-supported-renderer id="featured-badge" class="style-scope ytd-shelf-renderer" system-icons=""
                hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer">
                  <template is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
              <yt-formatted-string id="title-annotation" class="style-scope ytd-shelf-renderer" is-empty="">
                <!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js-->
                <yt-attributed-string
                  class="style-scope yt-formatted-string">
                </yt-attributed-string>
              </yt-formatted-string>
              <div id="play-button" class="style-scope ytd-shelf-renderer"></div>
              <div id="sort-filter" class="style-scope ytd-shelf-renderer"></div>
            </h2>
            <div id="spacer" class="style-scope ytd-shelf-renderer"></div>
            <div id="subscribe-button" class="style-scope ytd-shelf-renderer"></div>
            <div id="menu" class="style-scope ytd-shelf-renderer"></div>
          </div>
          <yt-formatted-string id="subtitle" class="can-be-empty style-scope ytd-shelf-renderer"
            is-empty=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js-->
            <yt-attributed-string class="style-scope yt-formatted-string">
            </yt-attributed-string>
          </yt-formatted-string>
        </div>
        <div id="contents" class="style-scope ytd-shelf-renderer"><ytd-expanded-shelf-contents-renderer
            class="style-scope ytd-shelf-renderer"><!--css-build:shady--><!--css_build_scope:ytd-expanded-shelf-contents-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
            <div id="grid-container" class="style-scope ytd-expanded-shelf-contents-renderer"><ytd-video-renderer
                class="style-scope ytd-expanded-shelf-contents-renderer" bigger-thumbs-style="BIG" lockup="true"
                inline-title-icon=""><!--css-build:shady--><!--css_build_scope:ytd-video-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                <div id="dismissible" class="style-scope ytd-video-renderer">
                  <ytd-thumbnail use-hovered-property="" class="style-scope ytd-video-renderer" size="medium"
                    loaded=""><!--css-build:shady--><!--css_build_scope:ytd-thumbnail--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><a
                      id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail"
                      aria-hidden="true" tabindex="-1" rel="null" href="/watch?v=DvfU4Y7C4Hc">
                      <yt-image alt="" ftl-eligible="" notify-on-loaded="" notify-on-unloaded=""
                        class="style-scope ytd-thumbnail"><img alt=""
                          class="ytCoreImageHost ytCoreImageFillParentHeight ytCoreImageFillParentWidth ytCoreImageContentModeScaleAspectFill ytCoreImageLoaded"
                          style="background-color: transparent;"
                          src="https://i.ytimg.com/vi/DvfU4Y7C4Hc/hq720.jpg?sqp=-oaymwEcCOgCEMoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLAHKyBe2QZ6gFB-U8QC7DaO07of_g">
                      </yt-image>

                      <div id="overlays" class="style-scope ytd-thumbnail"><ytd-thumbnail-overlay-time-status-renderer
                          class="style-scope ytd-thumbnail" hide-time-status=""
                          overlay-style="UPCOMING"><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-time-status-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><ytd-badge-supported-renderer
                            is-thumbnail-badge="" class="style-scope ytd-thumbnail-overlay-time-status-renderer"
                            system-icons=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                              id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                                is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                          <div
                            class="thumbnail-overlay-badge-shape style-scope ytd-thumbnail-overlay-time-status-renderer">
                            <badge-shape
                              class="yt-badge-shape yt-badge-shape--thumbnail-default yt-badge-shape--thumbnail-badge"
                              role="img" aria-label="Upcoming">
                              <div class="yt-badge-shape__text">UPCOMING</div>
                            </badge-shape></div>
                          <div id="time-status" class="style-scope ytd-thumbnail-overlay-time-status-renderer"
                            hidden=""><yt-icon size="16" class="style-scope ytd-thumbnail-overlay-time-status-renderer"
                              disable-upgrade="" hidden=""></yt-icon><span id="text"
                              class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="Upcoming">
                              UPCOMING
                            </span></div>
                        </ytd-thumbnail-overlay-time-status-renderer><ytd-thumbnail-overlay-now-playing-renderer
                          class="style-scope ytd-thumbnail"
                          now-playing-badge=""><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-now-playing-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><span
                            id="overlay-text" class="style-scope ytd-thumbnail-overlay-now-playing-renderer">Now
                            playing</span>
                          <ytd-thumbnail-overlay-equalizer
                            class="style-scope ytd-thumbnail-overlay-now-playing-renderer"><!--css-build:shady--><!--css_build_scope:ytd-thumbnail-overlay-equalizer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><svg
                              xmlns="http://www.w3.org/2000/svg" id="equalizer" viewBox="0 0 55 95"
                              class="style-scope ytd-thumbnail-overlay-equalizer">
                              <g class="style-scope ytd-thumbnail-overlay-equalizer">
                                <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="0"></rect>
                                <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="20"></rect>
                                <rect class="bar style-scope ytd-thumbnail-overlay-equalizer" x="40"></rect>
                              </g>
                            </svg>
                          </ytd-thumbnail-overlay-equalizer>
                        </ytd-thumbnail-overlay-now-playing-renderer></div>
                      <div id="mouseover-overlay" class="style-scope ytd-thumbnail"></div>
                      <div id="hover-overlays" class="style-scope ytd-thumbnail"></div>
                    </a>
                  </ytd-thumbnail>
                  <div class="text-wrapper style-scope ytd-video-renderer">
                    <div id="meta" class="style-scope ytd-video-renderer">
                      <div id="title-wrapper" class="style-scope ytd-video-renderer">
                        <h3 class="title-and-badge style-scope ytd-video-renderer">
                          <ytd-badge-supported-renderer collection-truncate="" class="style-scope ytd-video-renderer"
                            system-icons=""
                            hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                              id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                                is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                          <a id="video-title" class="yt-simple-endpoint style-scope ytd-video-renderer"
                            title="Meissner &amp; Kozubel - Czy Trump oszukuje Polskę?"
                            aria-label="Meissner &amp; Kozubel - Czy Trump oszukuje Polskę? 1 hour, 5 minutes"
                            href="/watch?v=DvfU4Y7C4Hc">
                            <yt-icon id="inline-title-icon" class="style-scope ytd-video-renderer"
                              hidden=""><!--css-build:shady--><!--css_build_scope:yt-icon--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.core.yt_icon.yt.icon.css.js--></yt-icon>
                            <yt-formatted-string class="style-scope ytd-video-renderer"
                              aria-label="Meissner &amp; Kozubel - Czy Trump oszukuje Polskę? 1 hour, 5 minutes">Meissner
                              &amp; Kozubel - Czy Trump oszukuje Polskę?</yt-formatted-string>
                          </a>
                        </h3>
                        <div id="menu" class="style-scope ytd-video-renderer"><ytd-menu-renderer
                            class="style-scope ytd-video-renderer" safe-area=""
                            menu-active=""><!--css-build:shady--><!--css_build_scope:ytd-menu-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                            <div id="top-level-buttons-computed"
                              class="top-level-buttons style-scope ytd-menu-renderer"></div>
                            <div id="flexible-item-buttons" class="style-scope ytd-menu-renderer"></div><yt-icon-button
                              id="button" class="dropdown-trigger style-scope ytd-menu-renderer"
                              style-target="button"><!--css-build:shady--><!--css_build_scope:yt-icon-button--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_icon_button.yt.icon.button.css.js--><button
                                id="button" class="style-scope yt-icon-button" aria-label="Action menu"><yt-icon
                                  class="style-scope ytd-menu-renderer"><!--css-build:shady--><!--css_build_scope:yt-icon--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.core.yt_icon.yt.icon.css.js--><span
                                    class="yt-icon-shape style-scope yt-icon ytSpecIconShapeHost">
                                    <div style="width: 100%; height: 100%; display: block; fill: currentcolor;"><svg
                                        xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24"
                                        viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true"
                                        style="pointer-events: none; display: inherit; width: 100%; height: 100%;">
                                        <path
                                          d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z">
                                        </path>
                                      </svg></div>
                                  </span></yt-icon></button><yt-interaction id="interaction"
                                class="circular style-scope yt-icon-button"><!--css-build:shady--><!--css_build_scope:yt-interaction--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_interaction.yt.interaction.css.js-->
                                <div class="stroke style-scope yt-interaction"></div>
                                <div class="fill style-scope yt-interaction"></div>
                              </yt-interaction></yt-icon-button><yt-button-shape id="button-shape"
                              class="style-scope ytd-menu-renderer" disable-upgrade="" hidden=""></yt-button-shape>
                          </ytd-menu-renderer></div>
                      </div>
                      <ytd-video-meta-block class="style-scope ytd-video-renderer byline-separated"
                        amsterdam-post-mvp=""><!--css-build:shady--><!--css_build_scope:ytd-video-meta-block--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                        <div id="metadata" class="style-scope ytd-video-meta-block">
                          <div id="byline-container" class="style-scope ytd-video-meta-block">
                            <ytd-channel-name id="channel-name"
                              class=" style-scope ytd-video-meta-block style-scope ytd-video-meta-block"><!--css-build:shady--><!--css_build_scope:ytd-channel-name--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                              <div id="container" class="style-scope ytd-channel-name">
                                <div id="text-container" class="style-scope ytd-channel-name">
                                  <yt-formatted-string id="text" link-inherit-color="" respect-lang-dir=""
                                    title="KREMLINKA SHOW" class="style-scope ytd-channel-name complex-string"
                                    ellipsis-truncate="" ellipsis-truncate-styling="" dir="auto"
                                    style="text-align: left;" has-link-only_=""><a
                                      class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"
                                      href="/@kremlinkashow">KREMLINKA SHOW</a></yt-formatted-string>
                                </div>
                                <tp-yt-paper-tooltip aria-hidden="true" fit-to-visible-bounds=""
                                  class="style-scope ytd-channel-name" role="tooltip" tabindex="-1"
                                  aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js-->
                                  <div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip"
                                    style-target="tooltip">

                                    KREMLINKA SHOW

                                  </div>
                                </tp-yt-paper-tooltip>
                              </div>
                              <ytd-badge-supported-renderer class="style-scope ytd-channel-name" system-icons=""
                                hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                                  id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                                    is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                            </ytd-channel-name>
                            <div id="separator" class="style-scope ytd-video-meta-block">•</div>
                            <yt-formatted-string id="video-info" class="style-scope ytd-video-meta-block" is-empty=""
                              hidden=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string
                                class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
                          </div>
                          <div id="metadata-line" class="style-scope ytd-video-meta-block">

                            <ytd-badge-supported-renderer class="inline-metadata-badge style-scope ytd-video-meta-block"
                              system-icons=""
                              hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                                id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                                  is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                            <div id="separator" class="style-scope ytd-video-meta-block" hidden="">•</div>

                            <span class="inline-metadata-item style-scope ytd-video-meta-block">Premieres 14/09/2025,
                              09:00</span>
                            <dom-repeat strip-whitespace="" class="style-scope ytd-video-meta-block"><template
                                is="dom-repeat"></template></dom-repeat>
                          </div>
                        </div>
                        <div id="additional-metadata-line" class="style-scope ytd-video-meta-block">
                          <dom-repeat class="style-scope ytd-video-meta-block"><template
                              is="dom-repeat"></template></dom-repeat>
                        </div>

                      </ytd-video-meta-block>
                    </div>
                    <div id="channel-info" class="style-scope ytd-video-renderer" hidden="">
                      <a id="channel-thumbnail" class="style-scope ytd-video-renderer" href="/@kremlinkashow"
                        aria-label="Go to channel">
                        <yt-img-shadow width="24" class="style-scope ytd-video-renderer no-transition empty"
                          style="background-color: transparent;"><!--css-build:shady--><!--css_build_scope:yt-img-shadow--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_img_shadow.yt.img.shadow.css.js--><img
                            id="img" draggable="false" class="style-scope yt-img-shadow" alt=""
                            width="24"></yt-img-shadow>
                      </a>
                      <div id="avatar" class="style-scope ytd-video-renderer" hidden=""></div>
                      <ytd-channel-name id="channel-name" class="long-byline style-scope ytd-video-renderer"
                        wrap-text="true"><!--css-build:shady--><!--css_build_scope:ytd-channel-name--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js-->
                        <div id="container" class="style-scope ytd-channel-name">
                          <div id="text-container" class="style-scope ytd-channel-name">
                            <yt-formatted-string id="text" link-inherit-color="" respect-lang-dir="" title=""
                              class="style-scope ytd-channel-name" dir="auto" style="text-align: left;"
                              has-link-only_=""><a class="yt-simple-endpoint style-scope yt-formatted-string"
                                spellcheck="false" href="/@kremlinkashow">KREMLINKA SHOW</a></yt-formatted-string>
                          </div>
                          <tp-yt-paper-tooltip aria-hidden="true" fit-to-visible-bounds=""
                            class="style-scope ytd-channel-name" role="tooltip" tabindex="-1"
                            aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js-->
                            <div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">

                              KREMLINKA SHOW

                            </div>
                          </tp-yt-paper-tooltip>
                        </div>
                        <ytd-badge-supported-renderer class="style-scope ytd-channel-name" system-icons=""
                          hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                            id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                              is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                      </ytd-channel-name>
                    </div>
                    <yt-formatted-string id="description-text" class="style-scope ytd-video-renderer">KREMLINKA SHOW to
                      kanał poświęcony tematyce ekonomiczno-gospodarczej z całego świata. Materiały powstają dzięki
                      wspaniałej społeczności wspierających i patronów.


                      Zapraszamy...</yt-formatted-string>
                    <dom-repeat class="style-scope ytd-video-renderer" hidden=""><template
                        is="dom-repeat"></template></dom-repeat>
                    <ytd-badge-supported-renderer id="badges" class="style-scope ytd-video-renderer" system-icons=""
                      hidden=""><!--css-build:shady--><!--css_build_scope:ytd-badge-supported-renderer--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js--><dom-repeat
                        id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer"><template
                          is="dom-repeat"></template></dom-repeat></ytd-badge-supported-renderer>
                    <div id="expandable-metadata" class="style-scope ytd-video-renderer"></div>
                    <div id="buttons" class="style-scope ytd-video-renderer"><ytd-toggle-button-renderer
                        class="style-scope ytd-video-renderer"
                        button-renderer="true"><!--css-build:shady--><yt-button-shape>
                          <button
                            class="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-s yt-spec-button-shape-next--enable-backdrop-filter-experiment"
                            title="" aria-pressed="false" aria-label="Notify me" aria-disabled="false">
                            <div class="yt-spec-button-shape-next__button-text-content"><span
                                class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap"
                                role="text">Notify me</span></div><yt-touch-feedback-shape aria-hidden="true"
                              class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response">
                              <div class="yt-spec-touch-feedback-shape__stroke"></div>
                              <div class="yt-spec-touch-feedback-shape__fill"></div>
                            </yt-touch-feedback-shape>
                          </button></yt-button-shape>
                        <tp-yt-paper-tooltip fit-to-visible-bounds="" offset="8" role="tooltip" tabindex="-1"
                          aria-label="tooltip"><!--css-build:shady--><!--css_build_scope:tp-yt-paper-tooltip--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,third_party.javascript.youtube_components.tp_yt_paper_tooltip.tp.yt.paper.tooltip.css.js-->
                          <div id="tooltip" class="hidden style-scope tp-yt-paper-tooltip" style-target="tooltip">
                            You'll be notified at the scheduled start time.
                          </div>
                        </tp-yt-paper-tooltip>
                      </ytd-toggle-button-renderer></div>
                  </div>
                </div>
                <div id="dismissed" class="style-scope ytd-video-renderer"></div>
                <yt-interaction id="interaction"
                  class="extended style-scope ytd-video-renderer"><!--css-build:shady--><!--css_build_scope:yt-interaction--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_interaction.yt.interaction.css.js-->
                  <div class="stroke style-scope yt-interaction"></div>
                  <div class="fill style-scope yt-interaction"></div>
                </yt-interaction>
              </ytd-video-renderer></div>
            <yt-formatted-string aria-role="button" class="style-scope ytd-expanded-shelf-contents-renderer" is-empty=""
              hidden=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string
                class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
            <a class="yt-simple-endpoint style-scope ytd-expanded-shelf-contents-renderer" hidden="">
              <yt-formatted-string class="style-scope ytd-expanded-shelf-contents-renderer"
                is-empty=""><!--css-build:shady--><!--css_build_scope:yt-formatted-string--><!--css_build_styles:video.youtube.src.web.polymer.shared.ui.styles.yt_base_styles.yt.base.styles.css.js,video.youtube.src.web.polymer.shared.ui.yt_formatted_string.yt.formatted.string.css.js--><yt-attributed-string
                  class="style-scope yt-formatted-string"></yt-attributed-string></yt-formatted-string>
            </a>
          </ytd-expanded-shelf-contents-renderer></div>
      </div>
      <div id="dismissed" class="style-scope ytd-shelf-renderer"></div>
    </ytd-shelf-renderer></div>
  <div id="continuations" class="style-scope ytd-item-section-renderer"></div>
</ytd-item-section-renderer>
`

module.exports = element
