/* Object to generate Modern Language Association (MLA) outline headings, handle internal links, etc. */


 let OutlineGenerator = {
    lineType: "P", // Just plain outline paragraph entry.
    correctAnswer: "That is correct!", // Correct answer string.
    incorrectAnswer: "I'm sorry, that is incorrect.", // Incorrect answer string.
    useNumbering:true, // if false, no numbering/lettering is used in outline entries.
    mlaLevelCounters: [0, 0, 0, 0, 0, 0, 0,0], // Keeps track of the current heading counters for each level.

    romanNumeralBands: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1], // The bands of numbers that correspond to Roman numerals.
    romanNumeralStringsUpper: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"], // The Roman numeral strings for each band.
    romanNumeralStringsLower: ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"], // The Roman numeral strings for each band.

    resetMLALevelCounters: function(){
        this.mlaLevelCounters = [0, 0, 0, 0, 0, 0, 0, 0];
        this.lineType = "P";
    },

    resetLowerLevels: function(current){
        if(current === this.mlaLevelCounters.length){
            return;
        }
       this.mlaLevelCounters[current] = 0;
       this.resetLowerLevels(current + 1);
    },
   
  
    mlaHeadingString: function(level){
        if(this.useNumbering === false){
            return "";
        }
        let maxLength = this.mlaLevelCounters.length;
        if(level >= maxLength){
            console.error("mlaHeadingString: maximum depth of " + maxLength + " exceeded.");
            return "-";
        }
        else{
            this.resetLowerLevels(level + 1);
            let headingCount = this.mlaLevelCounters[level] + 1;
            this.mlaLevelCounters[level] = headingCount;
              //  I. A. 1. a. i. (1) (a) (i)
            switch(level){
                case 0:
                    return this.convertRoman(headingCount, true) + ". ";
                case 1:
                    return this.upperCaseLetterEquivalent(headingCount - 1) + ". ";
                case 2:
                    return headingCount + ". ";
                case 3:
                    return this.lowerCaseLetterEquivalent(headingCount - 1) + ".";
                case 4:
                    return this.convertRoman(headingCount, false) + ". ";
                case 5:
                    return "(" + headingCount + ")";
                case 6:
                    return "(" + this.lowerCaseLetterEquivalent(headingCount - 1) + ") ";
                case 7:
                    return "(" + this.convertRoman(headingCount,false) + ") ";
                default:
                    return "- ";
            }   
        }
    },
    convertRoman:function(number, upperCase){
        if(number > 3999){
            return "convertRoman: argument out of range -> " + number;
        }
        return this.convertRomanHelper(number, upperCase, 0);
    },

    convertRomanHelper: function(number, upperCase, band){
            if(number === 0){
                return "";
            }
        else{

            let bandString = upperCase ? this.romanNumeralStringsUpper[band] : this.romanNumeralStringsLower[band];
            let bandDivisor = this.romanNumeralBands[band];
            if(number >= bandDivisor){
                return bandString + this.convertRomanHelper(number - bandDivisor, upperCase, band);
            }
            else{
                return this.convertRomanHelper(number, upperCase, band + 1);
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
            return this.upperCaseLetterEquivalent(Math.floor(number / 26) - 1) + this.upperCaseLetterEquivalent(number % 26);
        }
        else{
            return String.fromCharCode(number + 65);
        }
    },

    generateLineValue: function(line,type){


    },
    parseOutlineComponents: function(line){
        let originalLine = line;
        if(line.trim() === ":"){
            this.resetMLALevelCounters(); // new outline, reset the counters.
            return null;
          }
          if(line.indexOf(":") === 0){
            let outlineObject = {
                type: "P",
                numbering: true,
                level : 0,
                levelSet: false,
                correct: false,
            }
            outlineObject.level = GorillaPresenter.countLeadingCharacters(line,":") - 1;
            console.log("Outline level: " + outlineObject.level);
            line = line.replace(/^:+/,"");
            let parameterstring = line.split(" ")[0];
            line = line.replace(parameterstring,"").trim();
            let parameters = parameterstring.split("");
            console.log("Parameters: " + parameters);
            for(let i = 0; i < parameters.length; i++){
                let parameter = parameters[i];
                if((parameter >= "0") && (parameter <= "9")){
                    if(outlineObject.levelSet === true){
                        GorillaPresenter.error("Error: found outline level parameter after level was set in line: " + originalLine + ".");
                    }
                    outlineObject.level = parseInt(parameter);
                    outlineObject.levelSet = true;
                    continue;
                }
                switch(parameter){
                    case "P": outlineObject.type = "P"; // Normal paragraph entry
                              continue;
                    case "+": this.correctAnswer = line; // set correct answer string
                                return null;
                    case "-": this.incorrectAnswer = line; // set incorrect answer string
                                return null;
                    case "T": outlineObject.type = "T"; // Title
                              continue;
                    case "Q": outlineObject.type = "Q"; // Question
                                continue;
                    case "C": outlineObject.type = "C"; // Correct answer
                                continue;
                    case "I": outlineObject.type = "I"; // Incorrect answer
                                continue;
                    case "L": outlineObject.type = "L"; // Link
                                continue;
                    case "N": outlineObject.useNumbering = true;
                                continue;
                    case "U": outlineObject.useNumbering = false;
                                continue;
                    default: GorillaPresenter.error("Error: found unknown outline parameter: " + parameter + " in line: " + originalLine   + ".");  
                    return null;
                }
            }
            return this.outlineResult(line, outlineObject);
        }
        else{
            return line;
        }

            
    },

    outlineResult: function(line, outlineObject){
        switch(outlineObject.type){
            case "P": return this.normalOutlineString(line,outlineObject.level);
            case "T": return this.titleOutlineString(line,outlineObject.level);
            case "Q": return this.questionOutlineString(line,outlineObject.level);
            case "C": return this.correctAnswerOutlineString(line,outlineObject.level);
            case "I": return this.incorrectAnswerOutlineString(line,outlineObject.level);
            case "L": return this.linkOutlineString(line,outlineObject.level);
            default: GorillaPresenter.error("Error: found unknown outline type: " + outlineObject.type + " in line: " + originalLine + ".");
                     return null;
        }
    },

    normalOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        console.log("Line is " + line);
        return SEML.parseSEML("span",".navigable-list-item.link" + ".gorilla-presenter-outline-level-" + level,heading + " " + line);
    },
    titleOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        return SEML.parseSEML("span",".navigable-list-item.navigable-list-title" + ".gorilla-presenter-outline-level-" + level,heading + " " + line);
    },

    questionOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        return SEML.parseSEML("span",".navigable-list-item.navigable-list-header" + ".gorilla-presenter-outline-level-" + level,heading + " " + line);
    },
    correctAnswerOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        return SEML.parseSEML("span",".navigable-list-item.gorilla-presenter-outline-level-" + level + "!onclick=\"function(){displayAnswer(\"" + this.correctAnswer.trim() + "\")}\")", heading + line);
    },
    incorrectAnswerOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        return SEML.parseSEML("span",".navigable-list-item.gorilla-presenter-outline-level-" + level + "!onclick=\"function(){'displayAnswer(\"" + this.incorrectAnswer.trim() + "\")}\")", heading + line);
    },
    linkOutlineString: function(line,level){
        let heading = this.mlaHeadingString(level);
        let linkParts = line.split("|");
        let linkText = linkParts[0];
        let linkURL = linkParts[1];
        if(linkParts.length < 2){
            let errorMessage = "Error: found outline link  without enough arguments in line: " + line + ".";
            GorillaPresenter.error(errorMessage);
            console.error(errorMessage);
            return null;
        }
        let linktext = linkParts[0].trim();
        let linkDestination = linkParts[1].trim();
        if(linkDestination.indexOf("http") === 0){
            return SEML.parseSEML("span",".navigable-list-item.navigable-list-item.link.gorilla-presenter-external-link.gorilla-presenter-outline-level-" + level + "!param='" + linkParts[1] + "'", heading + linktext);
        }
        else{
            return SEML.parseSEML("span",".navigable-list-item.navigable-list-item.link.gorilla-presenter-branch.gorilla-presenter-outline-level-" + level + "!param='" + linkParts[1] + "'", heading + linktext);
        }
    }

}


