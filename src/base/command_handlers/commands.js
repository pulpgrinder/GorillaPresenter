GorillaPresenter.processCommands = function(text){
    text = text.replace(/{{{(.*?)}}}/gi,function(match){
      match = match.substring(3,match.length - 3);
      commandparts = match.split(" ");
      if(commandparts.length === 0){
        return "Found {{{ }}} without a command";
      }
      let command = commandparts[0].trim();
      commandparts.shift();
      console.log("Command: " + command);
      console.log("command parts are " + commandparts);
      switch(command){
        case "image": // done
          return GorillaPresenter.processImage(commandparts);
        case "audio": // done
          return GorillaPresenter.processAudio(commandparts);
        case "video": // done
          return GorillaPresenter.processVideo(commandparts);
        case "youtube":
          return GorillaPresenter.processYouTube(commandparts);
        case "isbn":
          return GorillaPresenter.processISBN(commandparts);
        case "quiz":
            return GorillaPresenter.processQuiz(commandparts);
        case "mailto": // done
            return GorillaPresenter.processMailto(commandparts);
        case "branch":
            return GorillaPresenter.processBranch(commandparts);
        case "fontsize": // done
            return GorillaPresenter.processFontSize(commandparts);
        case "font":
            return GorillaPresenter.processFont(commandparts);    
        default: return ("<span class='gorilla-presenter-error-message'>Unrecognized command: " + command + "</span>");
      }
     
    });
    return text;
  }

   
   
