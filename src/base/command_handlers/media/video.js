GorillaPresenter.processVideo = function(arguments){
     arguments = arguments.join(" ");
     arguments = arguments.split("|");
     let videoname = arguments[0];
     let videodescription;
     if(arguments.length > 1){
        videodescription = arguments[1];
     }
     else {
       videodescription =  videoname ;
     }
     videodescription = videodescription.trim();
     videodescription = videodescription.replace(/\"/g,"&quot;");
     let infofilename = GorillaPresenter.getMatchingInfoFileName(videoname);
     if(infofilename !== null){
       let filename = BrowserFileSystem.readInternalTextFile(infofilename);
       let dataURL = BrowserFileSystem.readInternalFileDataURL(filename);
       let alttag = videodescription.replace(/\"/g,"&quot;");
         let videoString = '<div class="gorilla-presenter-video-container"><video controls title="' + alttag + '" aria-label="' + alttag + '>" <source src="' + dataURL + '" type="video/mpeg">Your browser does not support the video element.</video></div>';
       
       return videoString;
     }
     console.error("No matching info file for " + videoname);
     return "";
     }
 

