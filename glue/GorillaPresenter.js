
GorillaPresenter = {
    currentSlideNumber: 0,
    slideData: '',
    currentText: '',
    currentScreen: null,
    timer: null,
    interval: 0,
    paused: false,
    dirty: false,
    lastCode: "",
    init: async function () {
        await GorillaPresenter.updateSlideData();
    },
    updateSlideData: async function () {
        GorillaPresenter.handleUpdatedEditor();
        let calculatedNumber = GorillaPresenter.calculateActiveSlideNumber();
        GorillaPresenter.currentSlideNumber = calculatedNumber >= 0 ? calculatedNumber : 0;

        GorillaPresenter.currentText = GorillaEditor.getCode();

        // Could optimize here, maybe only reprocess if text has changed or the media library has changed.
        let startTime = Date.now();
        console.log("beginning processText at" + startTime);
        GorillaPresenter.slideData = await GorillaSlideRenderer.processText(GorillaPresenter.currentText);
        let endTime = Date.now();
        console.log("finished processText at" + endTime + " duration:" + (endTime - startTime) + "ms"); 
        for (let plugin in GorillaSlideRenderer.plugins) {
            if (GorillaSlideRenderer.plugins[plugin].postprocess !== undefined) {
                await GorillaSlideRenderer.plugins[plugin].postprocess();
            }
        }
    },
    show_screen: async function (id) {
        const wrapper = document.getElementById('gorilla-app-wrapper');
        if (GorillaPresenter.currentScreen === "gorilla-settings-screen" && id !== "gorilla-settings-screen") {
            console.log("saving settings");
            await GorillaSettings.saveSettings();
            GorillaPresenter.markDirty(true);
        }
        const slideChooser = document.getElementById("slidechooser");
        if (id === "gorilla-slide-show") {
            if (GorillaPresenter.currentScreen === "gorilla-editor-screen") {
                await GorillaPresenter.updateSlideData();
            }
            slideChooser.style.display = "block";
            await GorillaPresenter.showSlide(GorillaPresenter.currentSlideNumber, "cutIn");


        }
        else {
            slideChooser.style.display = "none";
        }
        document.querySelectorAll(".gorilla-presenter-screen").forEach((el) => {
            el.style.display = "none";
        });

        document.getElementById(id).style.display = "grid";
        GorillaPresenter.currentScreen = id;

    },
    calculateActiveSlideNumber: function () {
        let activeSlideNumber = GorillaPresenter.currentSlideNumber;
        const editorPosition = GorillaEditor.getCursorPosition();
        if (editorPosition !== null) {
            let offset = editorPosition.start;
            for (let i = 0; i < GorillaSlideRenderer.slides.length; i++) {
                if (GorillaSlideRenderer.slides[i].offset > offset) {
                    activeSlideNumber = i - 1;
                    return activeSlideNumber;
                }
            }
            return GorillaSlideRenderer.slides.length - 1;

        }
        console.log("Editor position is null, defaulting to current slide number:", activeSlideNumber);
        return activeSlideNumber;

    },
    showSlide: async function (slideNumber, transitionName = "cutIn") {
        let startTime = Date.now();
        console.log("beginning showslide with slideNumber:" + slideNumber + "at" + startTime);
        let slidechooser = document.getElementById("slidechooser");
        if (slideNumber < 0) {
            let errormessage = "Already at first slide.";
            GorillaPresenter.notify(errormessage);
            return;
        }
        if (slideNumber >= GorillaSlideRenderer.slides.length) {
            if (GorillaPresenter.timer) {
                clearInterval(GorillaPresenter.timer);
                GorillaPresenter.timer = null;
                let thatsallfolks = "End of show.";
                GorillaPresenter.notify(thatsallfolks);
                return; // Just stop the timer on last slide
            }
            let errormessage = "Already at last slide.";
            GorillaPresenter.notify(errormessage);
            return;
        }
        const slidename = "#gorilla-slide-" + slideNumber;
        console.log("slide-name:", slidename);
        document.querySelectorAll('.gorilla-slide-class').forEach((el) => {
          /*  el.style.opacity = "0";
            el.style.visibility = "hidden";
            el.style.pointerEvents = "none"; */
            el.style.display = "none";
        });
        const activeSlide = document.querySelector(slidename);
     /*   activeSlide.style.opacity = "1";
        activeSlide.style.visibility = "visible";
        activeSlide.style.pointerEvents = "auto"; */
        activeSlide.style.display = "grid";
        GorillaPresenter.currentSlideNumber = slideNumber;
        slidechooser.value = slideNumber;
        // Update the URL hash with the current slide number
        if (window.location.hash !== `#${slideNumber}`)
            window.location.hash = slideNumber;
        let timerspan = document.querySelector(slidename).querySelector('.gorilla-timer');
        if (timerspan) {
            let hadTimer = false;
            if (GorillaPresenter.timer) { // Clear any existing timer
                hadTimer = true;
                console.log("Clearing existing timer before starting new one.");
                clearInterval(GorillaPresenter.timer);
                GorillaPresenter.timer = null;
                GorillaPresenter.interval = 0;
                GorillaPresenter.paused = false;
            }
            let duration = parseFloat(timerspan.getAttribute('data-duration'));
            let nextSlide = timerspan.getAttribute('data-next-slide');
            console.log("Found timer directive with duration (s):", duration, " next slide:", nextSlide);
            if (duration === 0.0) {
                if (hadTimer) {
                    GorillaDialog.showToast('<div>Autoplay turned off</div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M392,432H120a40,40,0,0,1-40-40V120a40,40,0,0,1,40-40H392a40,40,0,0,1,40,40V392A40,40,0,0,1,392,432Z"/></svg>', 1500, 'info');
                }
                return; // Don't start a new one.
            }
            let totalMilliseconds = duration * 1000 || null;
            console.log("Parsed timer duration (ms):", totalMilliseconds);
            if (totalMilliseconds === NaN || totalMilliseconds <= 0) {
                console.error("Invalid timer duration:", timerspan.getAttribute('data-duration'));
                return;
            }
            GorillaPresenter.interval = totalMilliseconds;
            if (nextSlide === null || nextSlide === '') {
                console.log("No nextSlide directive found");
                GorillaPresenter.timer = setInterval(() => {
                    GorillaPresenter.nextSlide();
                }, totalMilliseconds);
                return;

            }
            let destinationSlideNumber = GorillaSlideRenderer.findSlideNumber(nextSlide);
            if (destinationSlideNumber !== GorillaPresenter.currentSlideNumber) {
                // This should be a one-shot timer, not an interval
                GorillaPresenter.timer = setTimeout(() => {
                    GorillaPresenter.showSlide(destinationSlideNumber, "swipeInFromRight");
                    return;
                }, totalMilliseconds);
            } else {
                console.log("Next slide is the current slide, not advancing.");
            }
        }
    },
 
    nextSlide: async function () {
        console.log("Advancing to next slide, current slide number:" +  GorillaPresenter.currentSlideNumber  + "next slide number:" + (GorillaPresenter.currentSlideNumber + 1));    
        await GorillaPresenter.showSlide(GorillaPresenter.currentSlideNumber + 1, "swipeInFromRight");
    },
    previousSlide: async function () {
        await GorillaPresenter.showSlide(GorillaPresenter.currentSlideNumber - 1, "swipeInFromLeft");
    },
    handleUpdatedEditor: function () {

        let newText = GorillaEditor.getCode();
        if (newText === GorillaPresenter.lastCode) {
            return; // No changes
        }
        GorillaPresenter.lastCode = newText;
        GorillaPresenter.markDirty(true);
        fs.writeTextFile("presentation.md", newText);
        fs.zipModified = true;
    },
    markDirty: function (isDirty = true) {
        dirtyIndicator = document.getElementById("gorilla-dirty-indicator");
        if (isDirty) {
            dirtyIndicator.style.display = "block";
        } else {
            dirtyIndicator.style.display = "none";
        }
        GorillaPresenter.dirty = isDirty;
    },

    showScriptEditor: function () {
        GorillaPresenter.show_screen("gorilla-editor-screen");
        let slideOffset = GorillaSlideRenderer.slides[GorillaPresenter.currentSlideNumber]?.offset || 0;
        GorillaEditor.setCursorPosition(slideOffset);
    },
    showMediaLibrary: function () {
        GorillaMedia.showMediaScreen();
    },
    showSettings: function () {
        GorillaPresenter.show_screen("gorilla-settings-screen");
    },
    showRecordScreen: function () {
        GorillaPresenter.show_screen("gorilla-recorder-screen");
        GorillaRecorder.resizeCanvas();
    },
    showSlideShow: function () {
        GorillaPresenter.show_screen("gorilla-slide-show");
    },
    showAboutScreen: function () {
        GorillaPresenter.show_screen("gorilla-about-screen");
    },
    notify: async function (message) {
        await GorillaAlert.show(message);
    },
    confirm: async function (message) {
        return await GorillaConfirm.confirm(message);
    },
    prompt: async function (message, defaultValue = '') {
        return await GorillaPrompt.prompt(message, defaultValue);
    }
}
