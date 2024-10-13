GorillaPresenter.processDirectives = function(text,slideIndex){
   text = text.replace(/(?<!\\)\{\{\{(.*?)\}\}\}/gi,function(match){
      match = match.substring(3,match.length - 3);
      directiveparts = match.split(" ");
      if(directiveparts.length === 0){
        return "Found {{{ }}} without a directive";
      }
      let directive = directiveparts[0].trim();
      directiveparts.shift();
      switch(directive){
        case "image": // done
          return GorillaPresenter.processImage(directiveparts);
        case "audio": // done
          return GorillaPresenter.processAudio(directiveparts);
        case "video": // done
          return GorillaPresenter.processVideo(directiveparts);
        case "youtube":
          return GorillaPresenter.processYouTube(directiveparts);
        case "isbn":
          return GorillaPresenter.processISBN(directiveparts);
        case "mailto": // done
            return GorillaPresenter.processMailto(directiveparts);
        case "fontsize": // done
            return GorillaPresenter.processFontSize(directiveparts);
        case "fontfamily":
            return GorillaPresenter.processFontFamily(directiveparts); 
         case "transition":
            GorillaPresenter.setTransition(directiveparts,slideIndex);
            return "";
        case "quizconfig": return GorillaPresenter.setQuizConfig(directiveparts);
        case "branch": return  ""; // GorillaPresenter.processBranch(directiveparts);
        case "notitle":GorillaPresenter.notitle = true; return "";
        default: return ("<span class='gorilla-presenter-error-message'>Unrecognized directive: " + directive + "</span>");
      }
    });
    return text;
  }

 
  GorillaPresenter.processMultilineDirectives = function(text,slideIndex){
    text = text.replace(/(?<!\\)\{\{\{([\s\S]*?)\}\}\}/gi,function(match){
       match = match.substring(3,match.length - 3);
       directivelines = match.split("\n");
       directiveparts = directivelines[0].split(" ");
       directivelines.shift();
       if(directiveparts.length === 0){
         return "Found {{{ }}} without a directive";
       }
       let directive = directiveparts[0].trim();
       directiveparts.shift();
       switch(directive){
        case "quiz": return GorillaPresenter.processQuiz(directiveparts,directivelines);
        case "branches":
            return ""; // GorillaPresenter.processBranches(directiveparts,directivelines);
        case "externallinks": return "";//  GorillaPresenter.processExternalLinks(directiveparts,directivelines);
        default: return ("<span class='gorilla-presenter-error-message'>Unrecognized directive: " + directive + "</span>");
       }
      });
      text = text.replace(/\\{{{/gi,"{{{");
      return text;
    }
