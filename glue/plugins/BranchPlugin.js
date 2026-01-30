BranchPlugin = {
    renderHTML: function (directive) {
        let parts = directive.split(/(?<!\\)\|/).map(part => part.trim());
        let pair;
        if (parts.length === 2) {
           pair = { text: parts[0], target: parts[1] }
        } else {
            pair = { text: parts[0], target: null }
        }
         if (pair.target === null) {
                if (pair.text.startsWith("*")) {
                    pair.text = pair.text.substring(1).trim();
                    // Correct answer
                    generatedHTML = `<span class="gorilla-branch gorilla-branch-multiple-choice" data-value="true">${pair.text}</span>`;
                    return generatedHTML;
                }
                else if (pair.text.startsWith("-")) {
                    // Incorrect answer
                   pair.text = pair.text.substring(1).trim();
                    // Correct answer
                    generatedHTML = `<span class="gorilla-branch gorilla-branch-multiple-choice" data-value="false">${pair.text}</span>`;
                    return generatedHTML;
                }
                else {
                    generatedHTML = `<span class="gorilla-branch">${pair.text}</span>`;
                    return generatedHTML;

                }
            }
            else // Has a target
                argtype = pair.target.substring(0, 1);
            switch (argtype.toLowerCase()) {
                case ">":
                    let destinationSlideNumber = GorillaSlideRenderer.findSlideNumber(pair.target.substring(1).trim());
                    generatedHTML = `<span class="gorilla-branch gorilla-branch-navigate" data-slide-number="${destinationSlideNumber}">${pair.text}</span>`;
                    break;
                case "~":
                    let url = encodeURIComponent(pair.target.substring(1).trim());
                    generatedHTML = `<span class="gorilla-branch gorilla-branch-external" data-url="${url}">${pair.text}</span>`;
                    break;
                default:
                    let message = encodeURIComponent(pair.target);
                    generatedHTML = `<span class="gorilla-branch gorilla-branch-notify" data-message="${message}">${pair.text}</span>`;
                    break;
            }
            return generatedHTML;
    },
    postprocess: function () {
        document.querySelectorAll('.gorilla-branch-multiple-choice:not(.gorilla-branch-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();
                const value = event.currentTarget.getAttribute('data-value');
                if (value === "true") {
                    GorillaAlert.show(GorillaSettings.settings.defaultCorrectResponse);
                }
                else {
                    GorillaAlert.show(GorillaSettings.settings.defaultIncorrectResponse);
                }
                return false;
             }, { capture: true });  // Add this option
        });
        document.querySelectorAll('.gorilla-branch-navigate:not(.gorilla-branch-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();
                const slideNumber = parseInt(event.currentTarget.getAttribute('data-slide-number'));
                GorillaPresenter.showSlide(slideNumber);
                return false;
             }, { capture: true });  // Add this option
        });

        document.querySelectorAll('.gorilla-branch-notify:not(.gorilla-branch-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();
                const message = decodeURIComponent(event.currentTarget.getAttribute('data-message'));
                GorillaPresenter.notify(message);
                return false;
             }, { capture: true });  // Add this option
        });
        document.querySelectorAll('.gorilla-branch-external:not(.gorilla-branch-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();
                const url = decodeURIComponent(event.currentTarget.getAttribute('data-url'));
                window.open(url, '_blank', 'noopener,noreferrer');
                return false;
          }, { capture: true });  // Add this option
    }
    );
    }
};
