GorillaPresenter.processAudio = function(arguments){
    // console.log("Processing image, arguments are " + arguments);
     arguments = arguments.join(" ");
     arguments = arguments.split("|");
     let audioname = arguments[0];
     let audiodescription;
     if(arguments.length > 1){
        audiodescription = arguments[1];
     }
     else {
       audiodescription =  audioname ;
     }
     audiodescription = audiodescription.trim();
     audiodescription = audiodescription.replace(/\"/g,"&quot;");
     let infofilename = GorillaPresenter.getMatchingInfoFileName(audioname);
     if(infofilename !== null){
       let filename = BrowserFileSystem.readInternalTextFile(infofilename);
       let dataURL = BrowserFileSystem.readInternalFileDataURL(filename);
       let alttag = audiodescription.replace(/\"/g,"&quot;");
         let audioString = '<div class="gorilla-presenter-audio-container"><audio controls title="' + alttag + '" aria-label="' + alttag + '" <source src="' + dataURL + '" type="audio/mpeg">Your browser does not support the audio element.</audio></div>';
       
       return audioString;
     }
     console.error("No matching info file for " + audioname);
     return "";
     }
 

