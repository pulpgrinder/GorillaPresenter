MainMenuDriver = {
    pressHandlers: [],
    init: async function () {
        MainMenuDriver.menubar = document.getElementById('gorilla-menu-bar');
        // Ensure a dismiss overlay exists to allow tapping background to close the menu
        MainMenuDriver.menuOverlay = document.getElementById('main-menu-overlay');
        if (!MainMenuDriver.menuOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'main-menu-overlay';
            overlay.style.display = 'none';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', function (e) {
                // clicking the background should close the menu
                if (e.target === overlay) {
                    MainMenuDriver.hideMenu();
                }
            });
            MainMenuDriver.menuOverlay = overlay;
        }

        // Close button inside menu (for mobile)
        const closeBtn = document.getElementById('main-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                MainMenuDriver.hideMenu();
            });
        }

        // Mobile toggle button
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                MainMenuDriver.showMenu();
            });
        }
        window.addEventListener('hashchange', async function () {
            const hashNumber = parseInt(window.location.hash.substring(1));
            console.log("Hash changed to:", hashNumber);
            if (!isNaN(hashNumber) && hashNumber >= 1) {
                await GorillaPresenter.showSlide(hashNumber - 1); // Convert from 1-based hash to 0-based index
            }
        });

        document.querySelectorAll(".main-menu-item").forEach((el) => {
            el.addEventListener("click", async function (e) {
                e.stopPropagation();
                e.preventDefault();
                let commandContainer = e.target.closest(".main-menu-item");
                command = commandContainer.getAttribute("nav-value");
                // MainMenuDriver.hideMenu();
                switch (command) {
                    case 'slideshow':
                        GorillaPresenter.showSlideShow();
                        break;
                    case "save":
                        GorillaPresenter.showSlideShow()
                        await fs.savePresentation();
                        break;
                    case "open":
                        fs.openPresentation();
                        break;
                    case "edit":
                        GorillaPresenter.showScriptEditor();
                        break;
                    case "media":
                        GorillaPresenter.showMediaLibrary();
                        break;
                    case "settings":
                        GorillaPresenter.showSettings();
                        break;
                    case "about":
                        GorillaPresenter.showAboutScreen();
                        break;
                    case "forward":
                        await GorillaPresenter.nextSlide();
                        break;
                    case "recorder":
                        GorillaPresenter.showRecordScreen();
                        break;
                    case "fullscreen":
                        document.documentElement.requestFullscreen().catch((err) => {
                            console.warn("Failed to enter fullscreen mode:", err);
                        });
                        break;
                    case "record":
                        GorillaRecorder.recordingHandler();
                        break;
                    case "play":
                        GorillaRecorder.playHandler();
                        break;
                    case "clearselection":
                        GorillaRecorder.clearSelection();
                        break;
                    case "trim":
                        GorillaRecorder.trim();
                        break;
                    case "cut":
                        GorillaRecorder.cut();
                        break;
                    case "recorderundo":
                        GorillaRecorder.undo();
                        break;
                    case "saverecording":
                        GorillaRecorder.saveRecording();
                        break;
                    // Text editing commands
                    case "bold":
                        GorillaEditor.bold();
                        break;
                    case "italic":
                        GorillaEditor.italic();
                        break;
                    case "code":
                        GorillaEditor.code();
                        break;
                    case "blockquote":
                        GorillaEditor.blockQuote();
                        break;
                    case "superscript":
                        GorillaEditor.superscript();
                        break;
                    case "subscript":
                        GorillaEditor.subscript();
                        break;
                    case "strikethrough":
                        GorillaEditor.strikethrough();
                        break;
                    case "ul":
                        GorillaEditor.ul();
                        break;
                    case "ol":
                        GorillaEditor.ol();
                        break;
                    case "comment":
                        GorillaEditor.comment();
                        break;
                    case "insertmedia":
                        GorillaEditor.insertMedia();
                        break;
                    case "latex":
                        GorillaEditor.latex();
                        break;
                    case "footnote":
                        GorillaEditor.footnote();
                        break;
                    default:
                        console.warn("Unknown menu command:", command);
                        break;
                }
                // MainMenuDriver.hideMenu();
                return false;
            });
        });
    },
    toggleMenu: function () {
        console.log('MainMenuDriver.toggleMenu - menuVisible=', MainMenuDriver.menuVisible);
        if (MainMenuDriver.menuVisible === true) {
            MainMenuDriver.hideMenu();
        } else {
            MainMenuDriver.showMenu();
        }
    },
    normalClick: async function (evt) {
        slideshow = document.getElementById("gorilla-slide-show");

        if ((evt.target !== slideshow) &&
            (!slideshow.contains(evt.target))) {
            // Click was outside the slideshow area; ignore it.
            return;
        }
        console.log(evt.target.closest('.gorilla-choice-item'));
        if (evt.target.closest('.gorilla-choice-item')) {
            return;
        }
        const screenWidth = window.innerWidth;
        const clickX = evt.clientX;

        if (clickX < screenWidth / 2) {
            await GorillaPresenter.previousSlide();
        } else {
            await GorillaPresenter.nextSlide();
        }

    },
    hideMenu: function () {
        console.log('MainMenuDriver.hideMenu called');
        // Allow closing animation to run; don't hide immediately.
        // document.getElementById('gorilla-app-wrapper').classList.remove("menu-active");
        document.body.classList.remove('menu-visible');
        const menuEl = document.getElementById('main-menu-bar');
        if (menuEl) {
            // start closing animation
            menuEl.classList.remove('open');
            menuEl.classList.add('closing');
            const onAnimEnd = function () {
                console.log('MainMenuDriver.hideMenu - animation end');
                menuEl.removeEventListener('animationend', onAnimEnd);
                menuEl.classList.remove('closing');
                menuEl.style.display = 'none';
            };
            menuEl.addEventListener('animationend', onAnimEnd);
        }
        if (MainMenuDriver.menuOverlay) {
            // start overlay fade-out then remove from flow after transition ends
            MainMenuDriver.menuOverlay.classList.remove('visible');
            const overlay = MainMenuDriver.menuOverlay;
            const onEnd = function (ev) {
                if (ev.propertyName === 'opacity') {
                    overlay.removeEventListener('transitionend', onEnd);
                    overlay.style.display = 'none';
                }
            };
            overlay.addEventListener('transitionend', onEnd);
        }
        MainMenuDriver.menuVisible = false;
        MainMenuDriver.showUserSelect(false);

    },
    showMenu: function () {
        console.log('MainMenuDriver.showMenu called');
        const menuEl = document.getElementById('main-menu-bar');
        if (!menuEl) return;
        // If a previous closing animation was running, clear it so open can proceed.
        menuEl.classList.remove('closing');
        menuEl.style.display = 'grid';
        // ensure overlay exists and is visible
        if (MainMenuDriver.menuOverlay) {
            MainMenuDriver.menuOverlay.style.display = 'block';
            console.log('MainMenuDriver.showMenu - overlay set block');
            // use a small timeout to allow CSS transition
            requestAnimationFrame(() => MainMenuDriver.menuOverlay.classList.add('visible'));
        }
        // trigger open animation
        requestAnimationFrame(() => menuEl.classList.add('open'));
        document.body.classList.add('menu-visible');
        MainMenuDriver.menuVisible = true;
        MainMenuDriver.showUserSelect(true);
    },

    showUserSelect: function (enable) {
        element = document.getElementById('gorilla-slide-show');
        const value = enable ? 'text' : 'none';
        const priority = enable ? 'important' : '';
        element.style.setProperty('-webkit-user-select', value, priority);
        element.style.setProperty('-moz-user-select', value, priority);
        element.style.setProperty('-ms-user-select', value, priority);
        element.style.setProperty('user-select', value, priority);
    },
};