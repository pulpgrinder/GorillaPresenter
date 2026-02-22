MainMenuDriver = {
    pressHandlers: [],
    init: async function () {
        MainMenuDriver.menubar = document.getElementById('main-menu-bar') || document.getElementById('gorilla-menu-bar');
        // remember original location so we can restore after using a dialog
        if (MainMenuDriver.menubar) {
            MainMenuDriver._originalParent = MainMenuDriver.menubar.parentNode;
            MainMenuDriver._originalNext = MainMenuDriver.menubar.nextSibling;
            MainMenuDriver.menubar.style.display = 'none';
        }

        // Mobile toggle button
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                MainMenuDriver.toggleMenu();
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
        // If the menu is shown in a dialog, close it (dialog 'close' will restore and cleanup)
        if (MainMenuDriver.menuDialog) {
            try { MainMenuDriver.menuDialog.close(); } catch (e) { /* ignore */ }
            return;
        }
        // Fallback: animate/hide inline menu element
        document.body.classList.remove('menu-visible');
        const menuEl = document.getElementById('main-menu-bar');
        if (menuEl) {
            menuEl.classList.remove('open');
            menuEl.classList.add('closing');
            const onAnimEnd = function () {
                menuEl.removeEventListener('animationend', onAnimEnd);
                menuEl.classList.remove('closing');
                menuEl.style.display = 'none';
            };
            menuEl.addEventListener('animationend', onAnimEnd);
        }
        MainMenuDriver.menuVisible = false;
        MainMenuDriver.showUserSelect(false);

    },
    showMenu: function () {
        console.log('MainMenuDriver.showMenu called');
        // Use a native <dialog> so behavior mirrors GorillaDialog/GorillaAlert
        if (MainMenuDriver.menuDialog) return;
        const menuEl = document.getElementById('main-menu-bar');
        if (!menuEl) return;
        // create dialog and transfer the menu element into it (preserves event handlers)
        const dialog = document.createElement('dialog');
        dialog.className = 'gorilla-menu-dialog';
        // ensure menu is visible inside dialog
        menuEl.style.display = 'grid';
        dialog.appendChild(menuEl);
        // wire close button inside moved menu
        const closeBtn = dialog.querySelector('#main-menu-close');
        if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); dialog.close(); });
        dialog.addEventListener('close', function () {
            // restore menu element to original parent
            try {
                if (MainMenuDriver._originalParent) {
                    if (MainMenuDriver._originalNext && MainMenuDriver._originalNext.parentNode === MainMenuDriver._originalParent) {
                        MainMenuDriver._originalParent.insertBefore(menuEl, MainMenuDriver._originalNext);
                    } else {
                        MainMenuDriver._originalParent.appendChild(menuEl);
                    }
                }
            } catch (e) { /* ignore */ }
            menuEl.style.display = 'none';
            dialog.remove();
            MainMenuDriver.menuDialog = null;
            MainMenuDriver.menuVisible = false;
            MainMenuDriver.showUserSelect(false);
        });
        document.body.appendChild(dialog);
        MainMenuDriver.menuDialog = dialog;
        dialog.showModal();
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