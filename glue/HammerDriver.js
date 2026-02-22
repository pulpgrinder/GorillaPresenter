HammerDriver = {
    hammer: null,
    slideshow: null,
    menuhammers: [],
    checkTimerPause: function () {
        if (GorillaPresenter.paused === true) {
            GorillaPresenter.nextSlide();
            GorillaPresenter.timer = setInterval(() => {
                GorillaPresenter.nextSlide();
            }, GorillaPresenter.interval);
            GorillaPresenter.paused = false;

            return true;
        }
        if (GorillaPresenter.timer) {
            clearInterval(GorillaPresenter.timer);
            GorillaPresenter.timer = null;
            GorillaPresenter.paused = true;
            GorillaDialog.showToast('<div>Autoplay Paused</div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect x="176" y="96" width="16" height="320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><rect x="320" y="96" width="16" height="320" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>', 1500, 'info');
            return true;
        }
    },

    init: function () {

        this.slideshow = document.querySelector("#gorilla-slide-show");
        this.hammer = new Hammer(this.slideshow);
        this.hammer.on("touch", async function (ev) {
            if (HammerDriver.checkTimerPause()) {
                return;
            }
            await GorillaPresenter.nextSlide();
        });
        this.hammer.on("tap", async function (ev) {
            if (HammerDriver.checkTimerPause()) {
                return;
            }
            const target = ev.target;

            if (target.tagName === 'BUTTON' ||
                target.tagName === 'VIDEO' ||
                target.tagName === 'A' ||
                target.tagName === 'AUDIO' ||
                // target.tagName === 'CODE' ||
                target.closest('.gorilla-choice-item, .gorilla-choice-multiple-choice, .gorilla-choice-navigate, .gorilla-choice-external, .gorilla-choice-notify,.gorilla-branch-item, .gorilla-branch-multiple-choice, .gorilla-branch-navigate, .gorilla-branch-external, .gorilla-branch-notify, button, video, a, audio, input, select, textarea')) {
                // Tap was on an interactive element; ignore it.
                return;
            }


            const tapX = ev.center.x;
            const screenWidth = window.innerWidth;
            const midpoint = screenWidth / 2;

            if (tapX < midpoint) {
                await GorillaPresenter.previousSlide();
            } else {
                await GorillaPresenter.nextSlide();
            }
        });
        elements = document.querySelectorAll(".gorilla-presenter-screen");
        elements.forEach((element) => {
            const hammer = new Hammer(element);
            hammer.get('press').set({
                time: 500  // milliseconds
            });
            hammer.on("press", (ev) => {
                console.log('Hammer press:', ev && ev.type, 'target:', ev && ev.target && ev.target.tagName);
                MainMenuDriver.toggleMenu();
            });

            this.menuhammers.push(hammer);
        });
        this.slideshow.setAttribute("tabindex", "0"); // Makes it focusable
        this.slideshow.addEventListener("keydown", async function (evt) {
            switch (evt.key) {
                case "ArrowRight":
                case "PageDown":
                case "ArrowDown":
                case " ":
                    await GorillaPresenter.nextSlide();
                    evt.preventDefault();
                    break;
                case "ArrowLeft":
                case "PageUp":
                case "ArrowUp":
                case "Backspace":
                    await GorillaPresenter.previousSlide();
                    evt.preventDefault();
                    break;
                case "Home":
                    await GorillaPresenter.showSlide(0, "swipeInFromRight");
                    evt.preventDefault();
                    break;
                case "End":
                    await GorillaPresenter.showSlide(GorillaSlideRenderer.slides.length - 1, "swipeInFromLeft");
                    evt.preventDefault();
                    break;
            }
        });
        let editor = document.getElementById("gorilla-slide-editor");
        /*     editor.addEventListener("keydown", function (evt) {
                 console.log("Keydown event in editor, key:", evt.key);
                       if ((evt.ctrlKey || evt.metaKey) && evt.key === 's') {
         evt.preventDefault(); // Prevent browser's default "Save Page" dialog
                         GorillaPresenter.markDirty(true);
                         GorillaPresenter.showSlideShow();
         console.log('Save triggered!');
                 }
             }); */
    },
}