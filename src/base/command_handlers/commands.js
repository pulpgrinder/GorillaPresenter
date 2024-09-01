GorillaPresenter.processCommands = function(text){
    text = text.replace(/{{{(.*?)}}}/gi,function(match){
      match = match.substring(3,match.length - 3);
      commandparts = match.split(" ");
      console.log("command parts are " + commandparts);
      if(commandparts.length === 0){
        return "Found {{{ }}} without a command";
      }
      let command = commandparts[0];
      commandparts.shift();
      console.log("Command: " + command);
      switch(command){
        case "image":
          return GorillaPresenter.processImage(commandparts);
        case "audio":
          return GorillaPresenter.processAudio(commandparts);
        case "video":
          return GorillaPresenter.processVideo(commandparts);
        case "youtube":
          return GorillaPresenter.processYouTube(commandparts);
        case "isbn":
          return GorillaPresenter.processISBN(commandparts);
        case "quiz":
            return GorillaPresenter.processQuiz(commandparts);
        case "mailto":
            return GorillaPresenter.processMailto(commandparts);
        case "branch":
            return GorillaPresenter.processBranch(commandparts);
        case "fontsize":
            return GorillaPresenter.processFontSize(commandparts);
        case "font":
            return GorillaPresenter.processFont(commandparts);    
        default: return ("unrecognized command: {{{" + command + "}}}");
      }
     
    })
    return text;
  }
