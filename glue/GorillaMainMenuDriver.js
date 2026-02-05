MainMenuDriver = {
    pressHandlers: [],
    init: async function () {
        MainMenuDriver.menubar = document.getElementById('gorilla-menu-bar');
        window.addEventListener('hashchange', async function () {
            const slideNumber = parseInt(window.location.hash.substring(1));
            console.log("Hash changed to slide number:", slideNumber);
            if (!isNaN(slideNumber) && slideNumber >= 0) {
                await GorillaPresenter.showSlide(slideNumber);
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
                    case "forward":
                        await GorillaPresenter.previousSlide();
                        break;
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
      //  document.getElementById('gorilla-app-wrapper').classList.remove("menu-active");
      document.getElementById('main-menu-bar').style.display = "none";
        MainMenuDriver.menuVisible = false;
        MainMenuDriver.showUserSelect(false);

    },
    showMenu: function () {
        document.getElementById('main-menu-bar').style.display = "grid";
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