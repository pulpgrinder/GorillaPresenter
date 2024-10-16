 let SlideRenderer = {
    slideRoot: "slideroot",
    panelClass: "panel",
    slideClass: "slide",
    mlaLevelCounters: [0, 0, 0, 0, 0, 0, 0, 0],
    currentSlideOffset:0,
    slideOffsets: [],
    slideIDs: [],
    slideData: "",
    renderedSlideString: "",
    speakerNotes: "",
    inSlide: false,
    correctAnswerString: "That is correct!",
    incorrectAnswerString: "I'm sorry, that is incorrect.",
    markdown: window.markdownit({html:true,xhtmlOut:true,typographer:true}),
  init: function(){
    SlideRenderer.rootElement = document.getElementById(SlideRenderer.slideRoot);
    sicTransit = new SicTransit("#" + SlideRenderer.slideRoot, "." + SlideRenderer.panelClass);
  },
    resetSlides: function(){
        SlideRenderer.loadSlides();
        console.log("Resetting slides, slideData is " + SlideRenderer.slideData);   
        SlideRenderer.inSlide = false;
        SlideRenderer.renderedSlideString = "";
        SlideRenderer.speakerNotes = "";
        SlideRenderer.lineType =  "P"; // Just plain slide paragraph entry.
        SlideRenderer.currentSlideOffset = 0;
        SlideRenderer.slideOffsets = [];
        SlideRenderer.slideIDs = [];
        SlideRenderer.correctAnswerString =  "That is correct!"; // Correct answer string.
        SlideRenderer.incorrectAnswerString = "I'm sorry, that is incorrect."; // Incorrect answer string.
        SlideRenderer.alignment =  "left"; // Default alignment for slide components.
        SlideRenderer.useNumbering = true; // if false, no numbering/lettering is used in outline entries.
        SlideRenderer.mlaLevelCounters =  [0, 0, 0, 0, 0, 0, 0,0]; // Keeps track of the current heading counters for each level.
    },
    romanNumeralBands: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], // The bands of numbers that correspond to Roman numerals.
    romanNumeralStringsUpper: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"], // The Roman numeral strings for each band.
    romanNumeralStringsLower: ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"], // The Roman numeral strings for each band.

    resetMLALevelCounters: function(){
        SlideRenderer.mlaLevelCounters = [0, 0, 0, 0, 0, 0, 0, 0];
    },

    resetLowerLevels: function(current){
        if(current === SlideRenderer.mlaLevelCounters.length){
            return;
        }
       SlideRenderer.mlaLevelCounters[current] = 0;
       SlideRenderer.resetLowerLevels(current + 1);
    },

    mlaHeadingString: function(level){
        if(SlideRenderer.useNumbering === false){
            return "";
        }
        let maxLength = SlideRenderer.mlaLevelCounters.length;
        if(level >= maxLength){
            console.error("mlaHeadingString: maximum depth of " + maxLength + " exceeded.");
            return "-";
        }
        else{
            SlideRenderer.resetLowerLevels(level + 1);
            let headingCount = SlideRenderer.mlaLevelCounters[level] + 1;
            SlideRenderer.mlaLevelCounters[level] = headingCount;
              //  I. A. 1. a. i. (1) (a) (i)
            switch(level){
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
                    return "(" + SlideRenderer.convertRoman(headingCount,false) + ") ";
                default:
                    return "- ";
            }   
        }
    },
    convertRoman:function(number, upperCase){
        if(number > 3999){
            return "convertRoman: argument out of range -> " + number;
        }
        return SlideRenderer.convertRomanHelper(number, upperCase, 0);
    },

    convertRomanHelper: function(number, upperCase, band){
            if(number === 0){
                return "";
            }
        else{

            let bandString = upperCase ? SlideRenderer.romanNumeralStringsUpper[band] : SlideRenderer.romanNumeralStringsLower[band];
            let bandDivisor = SlideRenderer.romanNumeralBands[band];
            if(number >= bandDivisor){
                return bandString + SlideRenderer.convertRomanHelper(number - bandDivisor, upperCase, band);
            }
            else{
                return SlideRenderer.convertRomanHelper(number, upperCase, band + 1);
            }
        }
    },
    lowerCaseLetterEquivalent: function(number){
        if(number < 0){
            return "";
        }
        else if(number > 25){
            return lowerCaseLetterEquivalent(Math.floor(number / 26) - 1) + lowerCaseLetterEquivalent(number % 26);
        }
        else{
            return String.fromCharCode(number + 97);
        }
    },

    upperCaseLetterEquivalent: function(number){
        if(number < 0){
            return "";
        }
        else if(number > 25){
            return SlideRenderer.upperCaseLetterEquivalent(Math.floor(number / 26) - 1) + SlideRenderer.upperCaseLetterEquivalent(number % 26);
        }
        else{
            return String.fromCharCode(number + 65);
        }
    },
    textProcessor: function(text){
        if(text.indexOf("\n") !== -1){
            return SlideRenderer.markdown.render(text);
        }
        else {
            return SlideRenderer.markdown.renderInline(text);
        }
    },
    parseSlideComponents: function(line){
        console.log("Parsing slide components for line: " + line);
        let originalLine = line;
        if(line.trim() === ":"){
            SlideRenderer.resetMLALevelCounters(); // new outline, reset the counters.
            return null;
          }
          if(line.indexOf(":") === 0){
            let slideObject = {
                type: "P",
                numbering: true,
                level : 0,
                levelSet: false,
                correct: false,
                alignment: "left",
            }
            slideObject.level = SlideRenderer.countLeadingCharacters(line,":") - 1;
            console.log("Outline level: " + slideObject.level);
            line = line.replace(/^:+/,"");
            let parameterstring = line.split(" ")[0];
            line = line.replace(parameterstring,"").trim();
            console.log("After removing parameter string, line is: " + line);
            let parameters = parameterstring.split("");
            console.log("Parameters: " + parameters);
            for(let i = 0; i < parameters.length; i++){
                let parameter = parameters[i];
                if((parameter >= "0") && (parameter <= "9")){
                    if(slideObject.levelSet === true){
                        GorillaPresenter.error("Error: found outline level parameter after level was set in line: " + originalLine + ".");
                    }
                    slideObject.level = parseInt(parameter);
                    slideObject.levelSet = true;
                    continue;
                }
                switch(parameter){
                    case "A": slideObject.type = "A"; // Author
                                continue;
                    case "C": slideObject.type = "C"; // Chapter title
                                continue;
                    case "E": slideObject.type = "E"; // Email
                                continue;
                    case "H": slideObject.type = "H"; // Heading
                                continue;
                    case "I": slideObject.type = "I"; // ISBN
                                continue;
                    case "L": slideObject.type = "L"; // Link
                                continue;
                    case "M": slideObject.type = "M"; // Media
                                continue
                    case "N": slideObject.useNumbering = true;
                               continue;
                    case "O": SlideRenderer.newOutline();
                                continue;
                    case "P": slideObject.type = "P"; // Normal paragraph entry
                                continue;
                    case "Q": slideObject.type = "Q"; // (question text)
                                continue;
                    case "R": slideObject.type = "R"; // (right answer)
                                continue;
                    case "S": slideObject.type = "S"; // (new section/slide)
                                continue;
                    case "T": slideObject.type = "T"; // (title)
                                continue;
                    case "U": slideObject.useNumbering = false;
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
                                return null;
                    case "-": SlideRenderer.incorrectAnswerString = line;
                                return null;
                    default: GorillaPresenter.error("Error: found unknown outline parameter: " + parameter + " in line: " + originalLine   + ".");  
                    return null;
                }
            }
            SlideRenderer.renderResult(line, slideObject);
        }
        else{
            return line;
        }

            
    },

    renderResult: function(line, slideObject){
        let result = "";
        switch(slideObject.type){
            case "A": result =  SlideRenderer.authorString(line,slideObject.level);
                        break;
            case "C": result = SlideRenderer.chapterTitleString(line,slideObject.level);
                        break;
            case "E": result =  SlideRenderer.emailString(line,slideObject.level);
                        break;
            case "H": result =  SlideRenderer.headingString(line,slideObject.level);
                        break;
            case "I": result =  SlideRenderer.isbnString(line,slideObject.level);
                        break;
            case "L": result = SlideRenderer.linkString(line,slideObject.level);
                        break;  
            case "M": result =  SlideRenderer.mediaString(line,slideObject.level);
                        break;
            case "P":  result = SlideRenderer.normalString(line,slideObject.level);
                        break;
            case "Q": result = SlideRenderer.questionString(line,slideObject.level);
                        break;
            case "R": result =  SlideRenderer.correctAnswerString(line,slideObject.level);
                        break;
            case "S": result= SlideRenderer.generateNewSlide(line,slideObject.level);
                        break;
            case "T": result =  SlideRenderer.titleString(line,slideObject.level);
                        break;
            case "V": result =  SlideRenderer.versoString(line,slideObject.level);
                        break;
            case "W": result = SlideRenderer.incorrectAnswerString(line,slideObject.level);
                    break;
            default: result = "<span class='error-message'>Error: found unknown slide componenet type: " + slideObject.type + " in line: " + originalLine + ".</span>";
                console.error(result);
        }
        SlideRenderer.renderedSlideString += "\n" +  result;
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

  loadSlides: function(){
    if(BrowserFileSystem.fileExists("userdata/slides.md") === false){
      SlideRenderer.slideData = "";
    }
    else{
      SlideRenderer.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
    }
  },
  saveSlides: function(){
    BrowserFileSystem.writeInternalTextFile("userdata/slides.md",SlideRenderer.slideData);
  },
    renderSlides: function(){
        SlideRenderer.resetSlides();
        let text = SlideRenderer.slideData + "\n:S Gorilla Presenter\nMade with &hearts; by Tony Hursh. See \"About\" for full credits.\n" + "<a href='https://www.gorillapresenter.com/support'><img src=" + BrowserFileSystem.readInternalFileDataURL("icons/logo-small.png") + " width='25%' height='25%' style='display:block;margin-left:auto;margin-right:auto;'></a>\r\n";
        let rootElement = document.getElementById(SlideRenderer.slideRoot);
        let oldSlides = document.getElementsByClassName(SlideRenderer.slideClass);
        for(let i = 0; i < oldSlides.length; i++){
          oldSlides[i].remove();
        }
        let lines = text.split("\n");
        for(let i = 0; i < lines.length; i++){
            console.log("Processing line: " + lines[i]);
            let line = lines[i];
            if(line.indexOf(";") === 0){
              SlideRenderer.speakerNotes += line.substring(1) + "\n";
              continue;
            }
            if(line.indexOf("//") === 0){
              continue;
            }
          
            if(line.indexOf(":") === 0){
              let slideParseResult = SlideRenderer.parseSlideComponents(line);
               console.log("slideParseResult is " + slideParseResult);
               if(slideParseResult === null){
                    continue;
                }
               SlideRenderer.renderedSlideString += slideParseResult;
              
            }
            else {
                SlideRenderer.renderedSlideString += line;
              }
              continue;
          }
          if(SlideRenderer.inSlide === true){
            SlideRenderer.renderedSlideString += "</div>";
          }
          let processedSlides = SlideRenderer.markdown.render(SlideRenderer.renderedSlideString);
          SlideRenderer.rootElement.innerHTML =  SlideRenderer.rootElement.innerHTML + "\n" + processedSlides;
          renderMathInElement(SlideRenderer.rootElement);
    },
   

    generateNewSlide: function(line,level){
        if(SlideRenderer.inSlide === true){
            SlideRenderer.renderedSlideString += "</div>";
        }
        SlideRenderer.inSlide = true;
        let slideId = "slide" + uuid();
        SlideRenderer.slideIDs.push(slideId);
        let slideTitle = SlideRenderer.textProcessor(line.trim());
            return SlideRenderer.renderedSlideString += "<div class='" + SlideRenderer.slideClass + " " + SlideRenderer.panelClass +"' id='" + slideId + "'><div class='slide-title'>" + slideTitle + "</div>";
    },
    authorString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        SlideRenderer.renderedSlideString += "\n" + SEML.parseSEML("p",".navigable-list-item.author" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },
    chapterTitleString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        SlideRenderer.renderedSlideString += "\n" +  SEML.parseSEML("p",".navigable-list-item.chapter-title" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },
    sendMail: function(evt,mailtourl){
        setTimeout(function(){
            document.location = mailtourl;
        },100);
        return true;
    },
    emailString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        let emailParts = line.split("|");
        if(emailParts.length < 4){
            let errorMessage = "<span class='error-message'>Error: found email item without enough arguments in line: " + line + ". Need prompt|email address|subject|body</span>";
            console.error(errorMessage);
            SlideRenderer.renderedSlideString += "\n" +  errorMessage;
        }
        let emailPrompt = emailParts[0];
        let address = emailParts[1];
        let subject = emailParts[2];
        let body = emailParts[3];
        SlideRenderer.renderedSlideString += "\n" +  SEML.parseSEML("p",".navigable-list-item.email" + ".outline-level-" + level + "!onclick=\"function(){SlideRenderer.sendMail(\'" + address + "\',\'" + subject + "\',\'" + body + "\')\";",heading + " " + SlideRenderer.textProcessor(emailPrompt));
    },

    normalString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        console.log("Line is " + line);
        return SEML.parseSEML("p",".navigable-list-item.link" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },
    titleString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p",".navigable-list-item.navigable-list-title" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },

    questionString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p",".navigable-list-item.navigable-list-header.navigable-list-question" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },
    correctAnswerString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p",".navigable-list-item.navigable-list-correct-answer.outline-level-" + level + "!onclick=\"function(){displayAnswer(\"" + SlideRenderer.correctAnswer.trim() + "\")}\")", heading + SlideRenderer.textProcessor(line));
    },
    incorrectAnswerString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p",".navigable-list-item.navigable-list-incorrect-answer.outline-level-" + level + "!onclick=\"function(){'displayAnswer(\"" + SlideRenderer.incorrectAnswer.trim() + "\")}\")", heading + SlideRenderer.textProcessor(line));
    },
    linkString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        let linkParts = line.split("|");
        let linkText = linkParts[0];
        let linkURL = linkParts[1];
        if(linkParts.length < 2){
            let errorMessage = "<span class='error-message'>Error: found slide link  without enough arguments in line: " + line + ".</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let linktext = linkParts[0].trim();
        let linkDestination = linkParts[1].trim();
        if(linkDestination.indexOf("http") === 0){
            return SEML.parseSEML("p",".navigable-list-item.navigable-list-item.link.external-link.outline-level-" + level + "!param='" + linkParts[1] + "'", heading + SlideRenderer.textProcessor(linktext));
        }
        else{
            return SEML.parseSEML("p",".navigable-list-item.navigable-list-item.link.branch.outline-level-" + level + "!param='" + linkParts[1] + "'", heading + SlideRenderer.textProcessor(linktext));
        }
    },
    versoString: function(line,level){
        let heading = SlideRenderer.mlaHeadingString(level);
        return SEML.parseSEML("p",".navigable-list-item.verso" + ".outline-level-" + level,heading + " " + SlideRenderer.textProcessor(line));
    },

    mediaString:function (mediaSpec) {
        let mediaParts = mediaSpec.split("|");
        if(mediaParts.length < 2){
            let errorMessage = "<span class='error-message'>Found :M without enough arguments; need description|URL</span>";
            console.error(errorMessage);
            return errorMessage;
        }
        let description = GorillaPresenter.markdown(mediaParts[0]);
        let mediaURL = mediaParts[1];
        if(mediaURL.indexOf("http") !== 0){
            infofilename = SlideRenderer.getMatchingInfoFileName(audioname);
            if(infofilename !== null){
              let filename = BrowserFileSystem.readInternalTextFile(infofilename);
                mediaURL = BrowserFileSystem.readInternalFileDataURL(filename);
           }
        }
        let mediaExtension = BrowserFileSystem.file_extension(mediaURL).toLowerCase();
        switch(mediaExtension){
            case "mp3": return  '<div class="audio-container"><audio controls title="' + description +  '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="audio/mpeg">Your browser does not support the audio element.</audio></div>';
            case "mp4": return '<div class="video-container" <video controls> title="' + description +  '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="video/mp4">Your browser does not support the video tag.</video>';
            case "webm": return '<video controls> title="' + description +  '" aria-label="' + description + '>" <source src="' + mediaURL + '" type="video/webm">Your browser does not support the video tag.</video>';
            case "gif":
            case "png":
            case "svg":
            case "jpeg":
            case "jpg": return '<img src="' + mediaURL + '" alt="' + description + '" aria-label="' + description + '">';
    
            default: let errorMessage = "<span class='error-message'>Unsupported media type " + mediaExtension + "in line " + mediaSpec + "</span>";
                GorillaPresenter.error(errorMessage);
                console.error(errorMessage);
                return null;
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
    isbnString: function(line,level){
    isbnparts = line.split("|");
    if(isbnparts.length < 2){
        let errorMessage = "<span class='error-message'>Found ISBN without enough arguments; need ISBN and title</span>";
        console.error(errorMessage);
        return errorMessage;
    }
    let isbn = isbnparts[0];
    let title = isbnparts[1];
    let sources = Object.keys(SlideRenderer.bookSources);
    let sourceList = "";
    let bookLink;
    sources.forEach(function(source){
        bookLink = SlideRenderer.bookSources[source].replace("%%%%",isbn);
        sourceList += SlideRenderer.linkString(source,bookLink,level);
    })
        return SlideRenderer.titleString(title,level) + "\n" + sourceList;
    },

    getMatchingInfoFileName: function(nickname){
     nickname = nickname.trim().toLowerCase();
        let files = BrowserFileSystem.dir("userdata/media/*.info").sort();
        for(let i = 0; i < files.length; i++){
        let filelc = files[i].toLowerCase();
        if(filelc.indexOf(nickname) !== -1){
            return files[i];
        }
        }
        return null;
    },

    getMediaIcon: function(mediaType){
        switch(mediaType){
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
 }
