GorillaPresenter.processImage = function(arguments){
    arguments = arguments.join(" ");
    arguments = arguments.split("|");
    let imagename = arguments[0];
    let imagedescription;
    if(arguments.length > 1){
      imagedescription = arguments[1];
    }
    else {
      imagedescription =  imagename ;
    }
    imagedescription = imagedescription.trim();

    imagedescription = imagedescription.replace(/\"/g,"&quot;");

    let infofilename = GorillaPresenter.getMatchingInfoFileName(imagename);
    if(infofilename !== null){
      let filename = BrowserFileSystem.readInternalTextFile(infofilename);
      let dataURL = BrowserFileSystem.readInternalFileDataURL(filename);
      let imgString = '<div class="gorilla-presenter-image-container"><img class="gorilla-presenter-img" src="' + dataURL + '" alt="' + imagedescription + '" title="' + imagedescription + '" aria-label="' + imagedescription + '"></div>';
      return imgString;
    }
    console.error("No matching info file for " + imagename);
    return "";
    }

  GorillaPresenter.adjustImageSizes = function(){
    let images = document.getElementsByClassName("gorilla-presenter-img");
    for(let i = 0; i < images.length; i++){
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let image = images[i];
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
  
      // Check if the image fits naturally on the screen
      if (naturalWidth <= screenWidth && naturalHeight <= screenHeight) {
        image.style.width = `${naturalWidth}px`;
        image.style.height = `${naturalHeight}px`;
      } else {
        // Scale the image to fit the screen while maintaining aspect ratio
         image.style.width = '';
        image.style.height = '';
        image.style.maxWidth = '100%';
        image.style.maxHeight = '100vh';
      }
    }
  }
  
  