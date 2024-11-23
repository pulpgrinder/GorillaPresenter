let SlideRenderer = {
    slideRoot: "slideroot",
    panelClass: "panel",
    slideClass: "slide",
    slideSelector: "slide-selector",
    useNumbering: true,
    mlaLevelCounters: [0, 0, 0, 0, 0, 0, 0, 0],
    currentSlideOffset: 0,
    slideOffsets: [],
    slideIDs: [],
    slideTitles: [],
    currentSlideID: null,
    defaultTransition: "right",
    transitions: {},
    untitledSlideCounter: 1,
    slideData: "",
    currentSourceOffset: 0,
    renderedSlideString: "",
    speakerNotes: "",
    inSlide: false,
    inOutline: false,
    domParser: new DOMParser(),
    correctAnswerString: "That is correct!",
    incorrectAnswerString: "Im sorry, that is incorrect.",
    markdown: window.markdownit({ html: true, xhtmlOut: true, typographer: true }),
    metadata: {
        author: "Edmund Wells",
        documentTitle: "The Manual of Everything",
        publisher: "Wells Publishing",
    },

    init: function () {
        SlideRenderer.rootElement = document.getElementById(SlideRenderer.slideRoot);
        sicTransit = new SicTransit("#" + SlideRenderer.slideRoot, "." + SlideRenderer.panelClass);
    },
    resetSlides: function () {
        SlideRenderer.loadSlides();
        SlideRenderer.inSlide = false;
        SlideRenderer.renderedSlideString = "";
        SlideRenderer.speakerNotes = "";
        SlideRenderer.currentSourceOffset = 0;
        SlideRenderer.lineType = "P"; // Just plain slide paragraph entry.
        SlideRenderer.currentSlideOffset = 0;
        SlideRenderer.slideOffsets = [];
        SlideRenderer.slideIDs = [];
        SlideRenderer.slideTitles = [];
        SlideRenderer.currentSlideID = null;
        SlideRenderer.defaultTransition = "right";
        SlideRenderer.transitions = {};
        SlideRenderer.untitledSlideCounter = 1;
        SlideRenderer.correctAnswerString = "That is correct!"; // Correct answer string.
        SlideRenderer.incorrectAnswerString = "Im sorry, that is incorrect."; // Incorrect answer string.
        SlideRenderer.alignment = "left"; // Default alignment for slide components.
        SlideRenderer.useNumbering = true; // if false, no numbering/lettering is used in outline entries.
        SlideRenderer.mlaLevelCounters = [0, 0, 0, 0, 0, 0, 0, 0]; // Keeps track of the current heading counters for each level.
        SlideRenderer.metadata.author = "Edmund Wells";
        SlideRenderer.metadata.documentTitle = "The Manual of Everything";
        SlideRenderer.metadata.publisher = "Wells Publishing";
    },
    romanNumeralBands: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], // The bands of numbers that correspond to Roman numerals.
    romanNumeralStringsUpper: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"], // The Roman numeral strings for each band.
    romanNumeralStringsLower: ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"], // The Roman numeral strings for each band.

    resetMLALevelCounters: function () {
        SlideRenderer.mlaLevelCounters = [0, 0, 0, 0, 0, 0, 0, 0];
    },

    resetLowerLevels: function (current) {
        if (current === SlideRenderer.mlaLevelCounters.length) {
            return;
        }
        SlideRenderer.mlaLevelCounters[current] = 0;
        SlideRenderer.resetLowerLevels(current + 1);
    },

    mlaHeadingString: function (level) {
        if (SlideRenderer.useNumbering === false) {
            return "";
        }
        let maxLength = SlideRenderer.mlaLevelCounters.length;
        if (level >= maxLength) {
            console.error("mlaHeadingString: maximum depth of " + maxLength + " exceeded.");
            return "-";
        }
        else {
            SlideRenderer.resetLowerLevels(level + 1);
            let headingCount = SlideRenderer.mlaLevelCounters[level] + 1;
            SlideRenderer.mlaLevelCounters[level] = headingCount;
            //  I. A. 1. a. i. (1) (a) (i)
            switch (level) {
                case 0:
                    return SlideRenderer.convertRoman(headingCount, true) + ". ";
                case 1:
                    return SlideRenderer.upperCaseLetterEquivalent(headingCount - 1) + ". ";
                case 2:
                    return headingCount + ". ";
                case 3:
                    return SlideRenderer.lowerCaseLetterEquivalent(headingCount - 1) + ".";
                case 4:
                    return SlideRenderer.convertRoman(headingCount, false) + ". ";
                case 5:
                    return "(" + headingCount + ")";
                case 6:
                    return "(" + SlideRenderer.lowerCaseLetterEquivalent(headingCount - 1) + ") ";
                case 7:
                    return "(" + SlideRenderer.convertRoman(headingCount, false) + ") ";
                default:
                    return "- ";
            }
        }
    },
    convertRoman: function (number, upperCase) {
        if (number > 3999) {
            return "convertRoman: argument out of range -> " + number;
        }
        return SlideRenderer.convertRomanHelper(number, upperCase, 0);
    },

    convertRomanHelper: function (number, upperCase, band) {
        if (number === 0) {
            return "";
        }
        else {

            let bandString = upperCase ? SlideRenderer.romanNumeralStringsUpper[band] : SlideRenderer.romanNumeralStringsLower[band];
            let bandDivisor = SlideRenderer.romanNumeralBands[band];
            if (number >= bandDivisor) {
                return bandString + SlideRenderer.convertRomanHelper(number - bandDivisor, upperCase, band);
            }
            else {
                return SlideRenderer.convertRomanHelper(number, upperCase, band + 1);
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
            return SlideRenderer.upperCaseLetterEquivalent(Math.floor(number / 26) - 1) + SlideRenderer.upperCaseLetterEquivalent(number % 26);
        }
        else {
            return String.fromCharCode(number + 65);
        }
    },
    textProcessor: function (text) {
        if (text.indexOf("\n") !== -1) {
            return SlideRenderer.markdown.render(text);
        }
        else {
            return SlideRenderer.markdown.renderInline(text);
        }
    },
    parseSlideComponents: function (line) {
        let originalLine = line;
        if (line.trim() === ":") {
            SlideRenderer.resetMLALevelCounters(); // new outline, reset the counters.
            return "";
        }
        if (line.indexOf(":") === 0) {
            let slideObject = {
                type: "~",
                numbering: true,
                level: 0,
                levelSet: false,
                correct: false,
                alignment: "left",
            }
            slideObject.level = SlideRenderer.countLeadingCharacters(line, ":") - 1;
            line = line.replace(/^:+/, "");
            let parameterstring = line.split(" ")[0];
            line = line.replace(parameterstring, "").trim();
            let parameters = parameterstring.split("");
            for (let i = 0; i < parameters.length; i++) {
                let parameter = parameters[i];
                if ((parameter >= "0") && (parameter <= "9")) {
                    if (slideObject.levelSet === true) {
                        GorillaPresenter.error("Error: found outline level parameter after level was set in line: " + originalLine + ".");
                    }
                    slideObject.level = parseInt(parameter) - 1;
                    slideObject.levelSet = true;
                    continue;
                }
                switch (parameter) {
                    case "A": slideObject.type = "A"; // Document Author
                        continue;
                    case "D": slideObject.type = "D"; // Document Title
                        continue;
                    case "E": slideObject.type = "E"; // Email
                        continue;
                    case "G": slideObject.type = "G"; // Media
                        continue;
                    case "H": slideObject.type = "H"; // Heading
                        continue;
                    case "I": slideObject.type = "I"; // ISBN
                        continue;
                    case "L": slideObject.type = "L"; // Link
                        continue;
                    case "M": slideObject.type = "M"; // Metadata
                        continue;
                    case "N": SlideRenderer.useNumbering = true;
                        continue;
                    case "O": slideObject.type = "O"; // Outline
                        continue;
                    case "P": slideObject.type = "P"; // Publisher
                        continue;
                    case "Q": slideObject.type = "Q"; // (question text)
                        continue;
                    case "R": slideObject.type = "R"; // (right answer)
                        continue;
                    case "S": slideObject.type = "S"; // (new section/slide)
                        SlideRenderer.slideOffsets.push(SlideRenderer.currentSourceOffset);
                        continue;
                    case "T": slideObject.type = "T"; // (title)
                        continue;
                    case "U": SlideRenderer.useNumbering = false;
                        continue;
                    case "V": slideObject.type = "V"; // (verso -- copyright, etc.)
                        continue;
                    case "W": slideObject.type = "W"; // (wrong answer)
                        continue;
                    case ">": SlideRenderer.alignment = "right";
                        continue;
                    case "<": SlideRenderer.alignment = "left";
                        continue;
                    case "|": SlideRenderer.alignment = "center";
                        continue;
                    case "^": SlideRenderer.alignment = "hanging";
                        continue;
                    case "_": SlideRenderer.alignment = "justify";
                        continue;
                    case "+": SlideRenderer.correctAnswerString = line;
                        return "";
                    case "-": SlideRenderer.incorrectAnswerString = line;
                        return "";
                    case '*': SlideRenderer.transitions[SlideRenderer.currentSlideID] = line;
                        return "";
                    default: let errorMessage = "<span class='error-message'>Error: found unknown outline parameter: " + parameter + " in line: " + originalLine + ".</span>";
                        console.error(errorMessage);
                        return errorMessage;
                }
            }
            if (slideObject.type === "M") {
                return SlideRenderer.renderMetadata(line, slideObject);
            }
            else return SlideRenderer.renderResult(line, slideObject);
        }
        else {
            return line + "\n";
        }


    },

    renderResult: function (line, slideObject) {
        let result = "";
        switch (slideObject.type) {
            case "~": result = SlideRenderer.plainString(line, slideObject.level);
                break;
            case "A": result = SlideRenderer.metadataAuthorString(line, slideObject.level);
                break;
            case "D": result = SlideRenderer.metaData.documentTitleString(line, slideObject.level);
                break;
            case "E": result = SlideRenderer.emailString(line, slideObject.level);
                break;
            case "G": result = SlideRenderer.mediaString(line, slideObject.level);
                break;
            case "H": result = SlideRenderer.headingString(line, slideObject.level);
                break;
            case "I": result = SlideRenderer.isbnString(line, slideObject.level);
                break;
            case "L": result = SlideRenderer.linkString(line, slideObject.level);
                break;
            case "N": result = SlideRenderer.metadataIDNumber(line, slideObject.level);
            case "O": result = SlideRenderer.generateNewOutline(line, slideObject.level);
                break;
            case "P": result = SlideRenderer.metadataPublisher(line, slideObject.level);
                break;
            case "Q": result = SlideRenderer.questionString(line, 2);
                break;
            case "R": result = SlideRenderer.markCorrectAnswer(line, 3);
                break;
            case "S": result = SlideRenderer.generateNewSlide(line, slideObject.level);
                break;
            case "T": result = SlideRenderer.titleString(line, slideObject.level);

                break;
            case "V": result = SlideRenderer.versoString(line, slideObject.level);
                break;
            case "W": result = SlideRenderer.markIncorrectAnswer(line, 3);
                break;
            default: result = "<span class='error-message'>Error: found unknown slide componenet type: " + slideObject.type + " in line: " + originalLine + ".</span>";
                console.error(result);
        }
        return "\n" + result + "\n";
    },


    countLeadingCharacters: function (line, char) {
        const regex = new RegExp(`^${char}+`);
        let count = 0;
        const match = line.match(regex);
        if (match) {
            return match[0].length;
            count += match[0].length; // Add the number of leading characters
        }
        return 0;
    },

    loadSlides: function () {
        if (BrowserFileSystem.fileExists("userdata/slides.md") === false) {
            SlideRenderer.slideData = "";
        }
        else {
            SlideRenderer.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
        }
    },
    saveSlides: function () {
        BrowserFileSystem.writeInternalTextFile("userdata/slides.md", SlideRenderer.slideData);
    },
    renderSlides: function () {
        SlideRenderer.resetSlides();
        let text = SlideRenderer.slideData + "\n:S Gorilla Presenter\nMade with &hearts; by Tony Hursh. See \"About\" for full credits.\n" + "<a href='https://www.gorillapresenter.com/support'><img src=" + BrowserFileSystem.readInternalFileDataURL("icons/logo-small.png") + " width='25%' height='25%' style='display:block;margin-left:auto;margin-right:auto;'></a>\r\n";
        let oldSlides = document.getElementsByClassName(SlideRenderer.slideClass);
        for (let i = 0; i < oldSlides.length; i++) {
            oldSlides[i].remove();
        }
        let lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.indexOf(";") === 0) {
                SlideRenderer.speakerNotes += SlideRenderer.textProcessor(line.substring(1).trim() + "\n");
            }
            else if (line.indexOf("//") === 0) { // Comment line
                continue;
            }
            else if (line.indexOf(":") === 0) {
                SlideRenderer.renderedSlideString += SlideRenderer.parseSlideComponents(line);
            }
            else {
                SlideRenderer.renderedSlideString += SlideRenderer.textProcessor(line + "\n");
            }
            SlideRenderer.currentSourceOffset += line.length + 1;
        }
        if (SlideRenderer.inOutline === true) {
            SlideRenderer.renderedSlideString += "</div>"; // Terminate any in-progress outline.
            SlideRenderer.inOutline = false;
        }
        if (SlideRenderer.inSlide === true) {
            SlideRenderer.renderedSlideString += "</div></div>"; // Terminate any in-progress slide.
        }
        SlideRenderer.speakerNotes += "</body></html>";
        let processedSlides = SlideRenderer.markdown.render(SlideRenderer.renderedSlideString);
        SlideRenderer.rootElement.innerHTML = SlideRenderer.rootElement.innerHTML + "\n" + processedSlides; // the root element has some non-slide panels in in it, so we append the rendered slides to it.
        renderMathInElement(SlideRenderer.rootElement);
        SlideRenderer.renderSlideSelector();
        SlideHandler.sicTransit.loadPanelStack();
        SlideHandler.directNavigate(SlideRenderer.slideIDs[0]);
        console.log("There are " + document.querySelectorAll(".outline-correct-answer").length + " correct answers.");
        console.log("There are " + document.querySelectorAll(".outline-incorrect-answer").length + " incorrect answers.");
        document.querySelectorAll(".outline-incorrect-answer").forEach(function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
                event.preventDefault();
                event.currentTarget.classList.add("isincorrect");
                UIHandler.notify("Incorrect answer: " + element.innerText);
            })
        });
        document.querySelectorAll(".outline-correct-answer").forEach(function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
                event.preventDefault();
                event.currentTarget.classList.add("iscorrect");
                UIHandler.notify("Correct answer: " + element.innerText);
            })
        });
        document.querySelectorAll(".external-link").forEach(function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
                event.preventDefault();
                let url = element.getAttribute("param");
                window.open(url, "_blank");
            })
        });
        document.querySelectorAll(".internal-link").forEach(function (element) {
            element.addEventListener("click", function (event) {
                event.stopPropagation();
                event.preventDefault();
                let slideName = element.getAttribute("param");
                for(index = 0; index < SlideRenderer.slideTitles.length; index++){
                    if(SlideRenderer.slideTitles[index].toLowerCase().match(slideName.toLowerCase()) !== null){
                            SlideHandler.directNavigateByIndex(index);
                            return;
                    }
                }
                        UIHandler.error("Slide not found: " + slideName);
                });
        });  
    },

    generateNewSlide: function (line, level) {
        let returnValue = "";
        if (SlideRenderer.inSlide === true) {
            returnValue = "</div></div>"; // Need to finish off the previous slide if there was one.
        }
        if (SlideRenderer.inOutline === true) {
            returnValue += "</div>"; // Need to finish off the previous outline if there was one.
            SlideRenderer.inOutline = false;
        }
        SlideRenderer.inSlide = true;
        let slideId = "slide" + uuid();
        SlideRenderer.currentSlideID = slideId;
        SlideRenderer.transitions[slideId] = SlideRenderer.defaultTransition;
        SlideRenderer.slideIDs.push(slideId);
        let slideTitle = SlideRenderer.textProcessor(line.trim());
        if (slideTitle === "") {
            slideTitle = "Slide " + SlideRenderer.untitledSlideCounter;
            SlideRenderer.untitledSlideCounter++;
        }
        SlideRenderer.speakerNotes += "<h1>" + SlideRenderer.textProcessor(slideTitle) + "</h1>";
        SlideRenderer.slideTitles.push(slideTitle);
        return returnValue + "<div class='" + SlideRenderer.slideClass + " " + SlideRenderer.panelClass + "' id='" + slideId + "'><div class='slide-title'>" + slideTitle + "</div><div class='slide-body'>";
    },
    generateNewOutline: function (line, level) {
        let returnValue = "";
        if (SlideRenderer.inOutline === true) {
            returnValue = "</div>"; // Need to finish off the previous outline if there was one.
        }
        if (line.trim() === "O") {
            SlideRenderer.inOutline = false;
            return returnValue;
        }
        SlideRenderer.inOutline = true;
        SlideRenderer.resetMLALevelCounters();
        return returnValue + "<div class='outline'>";
    },
    plainString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },
    metadataAuthorString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.author" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },
    metadataDocumentTitleString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.document-title" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },
    metadataPublisher: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.publisher" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },
    metadataIDNumber: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        let idParts = line.split("|");
        if (idParts.length < 2) {
            let errorMessage = "<span class='error-message'>Error: found metadata ID number (:N) without enough arguments in line: " + line + ". Need idnumber|idtype</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        return SEML.parseSEML("p", ".outline-item.id-number" + ".outline-level-" + level + "id-number='" + idParts[0] + "' id-type='" + idParts[1] + "'", heading + " " + SlideRenderer.textProcessor(line));
    },

    emailString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        let emailParts = line.split("|");
        if (emailParts.length < 4) {
            let errorMessage = "<span class='error-message'>Error: found email item without enough arguments in line: " + line + ". Need prompt|email address|subject|body</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let emailPrompt = emailParts[0];
        let address = emailParts[1];
        let subject = emailParts[2];
        let body = emailParts[3];
        return SEML.parseSEML("p", ".outline-item.email" + ".outline-level-" + level + "!onclick=\"function(){GorillaPresenter.sendMail(\'" + address + "\',\'" + subject + "\',\'" + body + "\')\";", heading + " " + SlideRenderer.textProcessor(emailPrompt));
    },

    normalString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.link" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },

    titleString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.outline-title" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },

    headingString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.outline-subtitle" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },
    questionString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.outline-subtitle.outline-question" + ".outline-level-0", heading + " " + SlideRenderer.textProcessor(line));
    },
    markCorrectAnswer: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.outline-correct-answer.outline-level-1", heading + " " + SlideRenderer.textProcessor(line));
    },


    markIncorrectAnswer: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.outline-incorrect-answer.outline-level-1", heading + " " + SlideRenderer.textProcessor(line));
    },
    linkString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        let linkParts = line.split("|");
        if (linkParts.length < 2) {
            let errorMessage = "<span class='error-message'>Error: found slide link  without enough arguments in line: " + line + ".</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let linkText = linkParts[0].trim();
        let linkDestination = linkParts[1].trim();
        if (linkDestination.indexOf("http") === 0) {
            return SEML.parseSEML("p", ".outline-item.link.external-link.outline-level-" + level + "!param='" + linkDestination + "'", heading + SlideRenderer.textProcessor(linkText));
        }
        else {
            return SEML.parseSEML("p", ".outline-item.outline-item.link.internal-link.outline-level-" + level + "!param='" + linkDestination + "'", heading + SlideRenderer.textProcessor(linkText));
        }
    },
    versoString: function (line, level) {
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p", ".outline-item.verso" + ".outline-level-" + level, heading + " " + SlideRenderer.textProcessor(line));
    },

    mediaString: function (mediaSpec) {
        let mediaParts = mediaSpec.split("|");
        if (mediaParts.length < 2) {
            let errorMessage = "<span class='error-message'>Found :M without enough arguments; need description|URL</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let description = GorillaPresenter.markdown(mediaParts[0]);
        let mediaURL = mediaParts[1];
        if (mediaURL.indexOf("http") !== 0) {
            infofilename = SlideRenderer.getMatchingInfoFileName(audioname);
            if (infofilename !== null) {
                let filename = BrowserFileSystem.readInternalTextFile(infofilename);
                mediaURL = BrowserFileSystem.readInternalFileDataURL(filename);
            }
        }
        let mediaExtension = BrowserFileSystem.file_extension(mediaURL).toLowerCase();
        switch (mediaExtension) {
            case "mp3": return '<div class="audio-container"><audio controls title="' + description + '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="audio/mpeg">Your browser does not support the audio element.</audio></div>';
            case "mp4": return '<div class="video-container" <video controls> title="' + description + '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="video/mp4">Your browser does not support the video tag.</video>';
            case "webm": return '<video controls> title="' + description + '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="video/webm">Your browser does not support the video tag.</video>';
            case "gif":
            case "png":
            case "svg":
            case "jpeg":
            case "jpg": return '<img src="' + mediaURL + '" alt="' + description + '" aria-label="' + description + '">';

            default: let errorMessage = "<span class='error-message'>Unsupported media type " + mediaExtension + "in line " + mediaSpec + "</span>";
                console.error(errorMessage);
                return errorMessage;
        }
    },
    bookSources: {
        "Worldcat": "https://www.worldcat.org/isbn/%%%%",
        "Amazon": "https://www.amazon.com/s?k=%%%%",
        "Google Books": "https://books.google.com/books?isbn=%%%%",
        "Open Library": "https://openlibrary.org/isbn/%%%%",
        "Barnes and Noble": "https://www.barnesandnoble.com/s/%%%%",
        "AbeBooks": "https://www.abebooks.com/servlet/SearchResults?isbn=%%%%",

    },
    isbnString: function (line, level) {
        isbnparts = line.split("|");
        if (isbnparts.length < 2) {
            let errorMessage = "<span class='error-message'>Found ISBN without enough arguments; need ISBN and title</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let isbn = isbnparts[0];
        let title = isbnparts[1];
        let sources = Object.keys(SlideRenderer.bookSources);
        let sourceList = "";
        let bookLink;
        sources.forEach(function (source) {
            bookLink = SlideRenderer.bookSources[source].replace("%%%%", isbn);
            sourceList += SlideRenderer.linkString(source, bookLink, level);
        })
        return SlideRenderer.titleString(title, level) + "\n" + sourceList;
    },

    getMatchingInfoFileName: function (nickname) {
        nickname = nickname.trim().toLowerCase();
        let files = BrowserFileSystem.dir("userdata/media/*.info").sort();
        for (let i = 0; i < files.length; i++) {
            let filelc = files[i].toLowerCase();
            if (filelc.indexOf(nickname) !== -1) {
                return files[i];
            }
        }
        return null;
    },

    getMediaIcon: function (mediaType) {
        switch (mediaType) {
            case "image":
                return "<span style='height:100px;font-size=100px;'>🖼️</span>";
            case "audio":
                return "<span style='height:100px;;font-size=100px;'>🔊<span style='height:100px;'>";
            case "video":
                return "<span style='height:100px;;font-size=100px;'>🎥</span>";
            default:
                return "";
        }
    },
    renderSlideSelector: function () {
        let slideSelector = document.getElementById(SlideRenderer.slideSelector);
        slideSelector.innerHTML = "";
        for (let i = 0; i < SlideRenderer.slideTitles.length; i++) {
            let rawTitle = SlideRenderer.slideTitles[i];
            let parsedDoc = SlideRenderer.domParser.parseFromString(rawTitle, 'text/html');
            const slideTitle = parsedDoc.body.textContent || "";
            let slideId = SlideRenderer.slideIDs[i];
            let option = document.createElement("option");
            option.value = slideId;
            option.text = slideTitle;
            slideSelector.add(option);
        }

    },

}
