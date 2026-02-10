MenuPlugin = {
    mlaLevelCounters: [0, 0, 0, 0, 0, 0, 0, 0],
    renderHTML: function (directive) {
        return MenuPlugin.renderDirective(directive, false);
    },
    renderDirective: function (directive, isOutline) {
        this.isOutline = isOutline;
        let argtype = "";
        let outlineClass = "gorilla-outline-level-none";
        let outlinePrefix = "";
        if (isOutline) {
            MenuPlugin.resetMLALevelCounters();
        }
        let generatedHTML = '<ul class="gorilla-choice-list">\n';
        let choiceLines = directive.split('\n');
        let choices = [];
        let choicePairs = [];
        for (let line of choiceLines) {
            //  line = line.trim();
            if (line.length === 0) continue; // Skip empty lines
            choices.push(line);
        }
        let lineLevel = null;
        for (let choice of choices) {
            if (isOutline) {
                lineLevel = MenuPlugin.parseLevel(choice);
            } else {
                lineLevel = { level: -1, text: choice };
                outlineClass = "";
            }
            if (lineLevel.text.length === 0) continue;
            let choiceText = lineLevel.text;
            let parts = choiceText.split(/(?<!\\)\|/).map(part => part.trim());
            if (parts.length === 2) {
                choiceStructure = { text: parts[0], target: parts[1], outlineLevel: lineLevel.level }
            } else {
                choiceStructure = { text: parts[0], target: null, outlineLevel: lineLevel.level }
            }
            choicePairs.push(choiceStructure);
        }
        while (choicePairs.length > 0) {
            let pair = choicePairs.shift();
            let displayString = pair.text.trim();
            if (isOutline) {
                outlineClass = "gorilla-outline-level-" + pair.outlineLevel;
                outlinePrefix = MenuPlugin.mlaHeadingString(pair.outlineLevel);
            }
            if (pair.target === null) {
                if (pair.text.startsWith("*")) {
                    displayString = outlinePrefix + displayString.substring(1).trim();
                    // Correct answer
                    generatedHTML += `<li class="gorilla-choice-item gorilla-choice-multiple-choice ${outlineClass}" data-value="true">${displayString}</li>\n`;
                    continue;
                }
                else if (pair.text.startsWith("-")) {
                    // Incorrect answer
                    displayString = outlinePrefix + displayString.substring(1).trim();
                    generatedHTML += `<li class="gorilla-choice-item gorilla-choice-multiple-choice ${outlineClass}" data-value="false">${displayString}</li>\n`;
                    continue;
                }
                else {
                    let displayClass = pair.outlineLevel === 0 ? "gorilla-choice-header" : "gorilla-choice-plain";
                    displayString = outlinePrefix + displayString.trim();
                    generatedHTML += `<li class="gorilla-choice-item ${displayClass} ${outlineClass}">${displayString}</li>\n`;
                    continue;

                }
            }
            else // Has a target
                displayString = outlinePrefix + " " + displayString;
                argtype = pair.target.substring(0, 1);
            switch (argtype.toLowerCase()) {
                case ">":
                    let destinationSlideNumber = GorillaSlideRenderer.findSlideNumber(pair.target.substring(1).trim());
                    generatedHTML += `<li class="gorilla-choice-item gorilla-choice-navigate ${outlineClass}" data-slide-number="${destinationSlideNumber}">${displayString}</li>\n`;
                    break;
                case "~":
                    let url = encodeURIComponent(pair.target.substring(1).trim());
                    generatedHTML += `<li class="gorilla-choice-item gorilla-choice-external ${outlineClass}" data-url="${url}">${displayString}</li>\n`;
                    break;
                default:
                    let message = encodeURIComponent(pair.target);
                    generatedHTML += `<li class="gorilla-choice-item gorilla-choice-notify ${outlineClass}" data-message="${message}">${displayString}</li>`;
                    break;
            }
        }
        generatedHTML += '</ul>\n';
        return generatedHTML;
    },
    parseLevel: function (line) {
        // Match leading equals characters
        const match = line.match(/^=*/);
        const equalsSigns = match ? match[0] : '';
        const level = equalsSigns.length;

        // Remove leading tabs to get the text
        const text = line.replace(/^=*/, '');

        return { level: level, text: text };
    },
    romanNumeralBands: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], // The bands of numbers that correspond to Roman numerals.
    romanNumeralStringsUpper: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"], // The Roman numeral strings for each band.
    romanNumeralStringsLower: ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"], // The Roman numeral strings for each band.

    resetMLALevelCounters: function () {
        MenuPlugin.mlaLevelCounters = [0, 0, 0, 0, 0, 0, 0, 0];
    },

    resetLowerLevels: function (current) {
        if (current === MenuPlugin.mlaLevelCounters.length) {
            return;
        }
        MenuPlugin.mlaLevelCounters[current] = 0;
        MenuPlugin.resetLowerLevels(current + 1);
    },
    mlaHeadingString: function (level) {
        if (level < 0) {
            return "";
        }
        let maxLength = MenuPlugin.mlaLevelCounters.length;
        if (level >= maxLength) {
            console.error("mlaHeadingString: maximum depth of " + maxLength + " exceeded.");
            return "-";
        }
        else {
            MenuPlugin.resetLowerLevels(level + 1);
            let headingCount = MenuPlugin.mlaLevelCounters[level] + 1;
            MenuPlugin.mlaLevelCounters[level] = headingCount;
            //  I. A. 1. a. i. (1) (a) (i)
            switch (level) {
                case 0:
                    return MenuPlugin.convertRoman(headingCount, true) + ". ";
                case 1:
                    return MenuPlugin.upperCaseLetterEquivalent(headingCount - 1) + ". ";
                case 2:
                    return headingCount + ". ";
                case 3:
                    return MenuPlugin.lowerCaseLetterEquivalent(headingCount - 1) + ".";
                case 4:
                    return MenuPlugin.convertRoman(headingCount, false) + ". ";
                case 5:
                    return "(" + headingCount + ")";
                case 6:
                    return "(" + MenuPlugin.lowerCaseLetterEquivalent(headingCount - 1) + ") ";
                case 7:
                    return "(" + MenuPlugin.convertRoman(headingCount, false) + ") ";
                default:
                    return "- ";
            }
        }
    },
    convertRoman: function (number, upperCase) {
        if (number > 3999) {
            return "convertRoman: argument out of range -> " + number;
        }
        return MenuPlugin.convertRomanHelper(number, upperCase, 0);
    },

    convertRomanHelper: function (number, upperCase, band) {
        if (number === 0) {
            return "";
        }
        else {

            let bandString = upperCase ? MenuPlugin.romanNumeralStringsUpper[band] : MenuPlugin.romanNumeralStringsLower[band];
            let bandDivisor = MenuPlugin.romanNumeralBands[band];
            if (number >= bandDivisor) {
                return bandString + MenuPlugin.convertRomanHelper(number - bandDivisor, upperCase, band);
            }
            else {
                return MenuPlugin.convertRomanHelper(number, upperCase, band + 1);
            }
        }
    },
    lowerCaseLetterEquivalent: function (number) {
        if (number < 0) {
            return "";
        }
        else if (number > 25) {
            return lowerCaseLetterEquivalent(Math.floor(number / 26) - 1) + lowerCaseLetterEquivalent(number % 26);
        }
        else {
            return String.fromCharCode(number + 97);
        }
    },

    upperCaseLetterEquivalent: function (number) {
        if (number < 0) {
            return "";
        }
        else if (number > 25) {
            return MenuPlugin.upperCaseLetterEquivalent(Math.floor(number / 26) - 1) + MenuPlugin.upperCaseLetterEquivalent(number % 26);
        }
        else {
            return String.fromCharCode(number + 65);
        }
    },

    postprocess: function () {
        document.querySelectorAll('.gorilla-choice-multiple-choice:not(.gorilla-choice-sample)').forEach(item => {
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
            });
        });
        document.querySelectorAll('.gorilla-choice-navigate:not(.gorilla-choice-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();

                const slideNumber = parseInt(event.currentTarget.getAttribute('data-slide-number'));
                GorillaPresenter.showSlide(slideNumber);
                return false;
            });
        });

        document.querySelectorAll('.gorilla-choice-notify:not(.gorilla-choice-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();

                const message = decodeURIComponent(event.currentTarget.getAttribute('data-message'));
                GorillaPresenter.notify(message);
                return false;
            });
        });
        document.querySelectorAll('.gorilla-choice-external:not(.gorilla-choice-sample)').forEach(item => {
            item.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();

                const url = decodeURIComponent(event.currentTarget.getAttribute('data-url'));
                window.open(url, '_blank', 'noopener,noreferrer');
                return false;
            });
        });
    }
};

