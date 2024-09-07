GorillaPresenter.slideRoot = "gorilla-presenter-slideroot";
GorillaPresenter.slideClass = "gorilla-presenter-slide";
GorillaPresenter.slideSelector = ".gorilla-presenter-slide";
GorillaPresenter.slideIdFragment =  "gorilla-presenter-slide-";
GorillaPresenter.config.slidePosition = -1;
GorillaPresenter.speakerNotes = "";
GorillaPresenter.slideIDs = [];
GorillaPresenter.slideTransitionsForward = [];
GorillaPresenter.slideTransitionsBack =  [];
GorillaPresenter.speakerNotesWindow = null;
GorillaPresenter.transitionBusy = false; // This is a flag to prevent multiple transitions from happening at once.


GorillaPresenter.loadSlides = function(){
  if(BrowserFileSystem.fileExists("userdata/slides.md") === false){
    GorillaPresenter.slideData = "";
  }
  else{
    GorillaPresenter.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
  }
  document.getElementById("gorilla-presenter-slide-text-editor").value = GorillaPresenter.slideData;
}

GorillaPresenter.saveSlides = function(){
  BrowserFileSystem.writeInternalTextFile("userdata/slides.md",GorillaPresenter.slideData);
}

GorillaPresenter.loadPresentation = function(){
    document.getElementById("gorilla-presenter-workspace-chooser").click();
}

GorillaPresenter.workspaceChosen = function(){
    let uploader = document.getElementById("gorilla-presenter-workspace-chooser");
    let workspace = uploader.files[0];
    let reader = new FileReader();
    reader.onloadend = function(evt){
      let newfile = evt.target.result;
      parent.clearDocumentAndWrite(newfile);
    };
    reader.readAsText(workspace);
  }

  GorillaPresenter.downloadSlides = function(){
    GorillaPresenter.saveSlides();
    let iframe_template = BrowserFileSystem.readInternalTextFile("base/internal_frame_template.html");
    let version = BrowserFileSystem.readInternalTextFile("build/version").trim();
    let build = BrowserFileSystem.readInternalTextFile("build/build").trim();
    let date = BrowserFileSystem.readInternalTextFile("build/build_date").trim();
    iframe_template = iframe_template.replace(/___VERSION___/g, version);
    iframe_template = iframe_template.replace(/___BUILD___/g, build);
    iframe_template = iframe_template.replace(/___BUILD_DATE___/g, date);
    iframe_template = iframe_template.replace(/___FILESYSTEM___/g, "BrowserFileSystem.fs=" + JSON.stringify(BrowserFileSystem.fs));
  
    iframe_template = iframe_template.replace(/___FILESYSTEM___/g, "BrowserFileSystem.fs=" + JSON.stringify(BrowserFileSystem.fs));
    iframe_template = iframe_template.replace(/___DEBUGGING___/g,debugging);
    iframe_data =  "var iframeContent = \"" + BrowserFileSystem.bytesToBase64(iframe_template) + "\";\n";
    let index_template = BrowserFileSystem.readInternalTextFile("base/index_template.html");
    index_template = index_template.replace(/___IFRAMECONTENT___/,iframe_data);
    if(debugging){
      console.log("Downloading debuggable file");
      BrowserFileSystem.downloadFile("GorillaPresenter" + GorillaPresenter.downloadDate(),iframe_template,"text/html");
    }
    else{
      console.log("Downloading base file");
    BrowserFileSystem.downloadFile("GorillaPresenter" + GorillaPresenter.downloadDate(),index_template,"text/html");
    }
  }
  
  

GorillaPresenter.renderSlideSelector = function(){
  let oldSelector = document.getElementById("gorilla-presenter-slide-selector");
  if(oldSelector){
    oldSelector.remove();
  }   
  let menuItem= document.createElement("div");
  menuItem.className = "gorilla-presenter-main-menu-item";
  let slideSelectorLabel = document.createElement("span");
  slideSelectorLabel.className = "translatable";
  slideSelectorLabel.innerHTML = GorillaPresenter.translate("Select Slide",GorillaPresenter.config.currentLanguage) + ": ";
  menuItem.appendChild(slideSelectorLabel);
  let slideSelector = document.createElement("select");
  slideSelector.setAttribute("title",GorillaPresenter.translate("Select slide",GorillaPresenter.config.currentLanguage));
  slideSelector.setAttribute("id","gorilla-presenter-slide-selector");
  menuItem.appendChild(slideSelector);
  for(let i = 0; i < GorillaPresenter.slideTitles.length; i++){
    let option = document.createElement("option");
    option.value = i;
    if(GorillaPresenter.config.slidePosition === i){
      option.selected = true;
    }
    option.text = GorillaPresenter.slideTitles[i];
    slideSelector.appendChild(option);
  }
  document.getElementById("gorilla-presenter-main-menu").appendChild(menuItem);
  slideSelector.onchange = function(event){
    setTimeout(function(){
        GorillaPresenter.config.slidePosition = parseInt(slideSelector.value);
        GorillaPresenter.displaySlide("swipeInFromRight");
        GorillaPresenter.hideMainMenu(event);
    },100);
  }
}


GorillaPresenter.renderSlides = function(element){
    GorillaPresenter.speakerNotes = "";
    for(let i = 0; i < GorillaPresenter.slideIDs.length; i++) {
      let slideId = GorillaPresenter.slideIDs[i];
      let slideElement = document.getElementById(slideId);
      if(slideElement){
        slideElement.remove();
      }
    }
    GorillaPresenter.slideIDs = [];
    GorillaPresenter.slideOffsets = [];
    GorillaPresenter.slideTitles = [];
    let decommentedlines = ""
    let text = GorillaPresenter.slideData;
    text = text + "\n# Gorilla Presenter\nMade with &hearts; by Tony Hursh. See \"About\" for full credits.\n" + "<a href='https://www.gorillapresenter.com/support'><img src=" + BrowserFileSystem.readInternalFileDataURL("icons/logo-small.png") + " width='25%' height='25%' style='display:block;margin-left:auto;margin-right:auto;'></a>\r\n";
    let lines = text.split("\n");
    let slideOffset = 0;
    for(let i = 0; i < lines.length; i++){
        let line = lines[i];
        slideOffset = slideOffset + line.length + 1;
        if(line.indexOf(";") === 0){
          GorillaPresenter.speakerNotes += line.substring(1) + "\n";
          continue;
        }
        else if(line.indexOf("//") === 0){
          continue;
        }
        else {
          decommentedlines = decommentedlines + line + "\n";
          if(line.indexOf("#") === 0){
          slideTitle = line.substring(2);
          GorillaPresenter.slideOffsets.push(slideOffset);
          GorillaPresenter.slideTitles.push(slideTitle);
          GorillaPresenter.speakerNotes += slideTitle + "\n";
          }
        }
      }

    let slidetexts = decommentedlines.split(/^# /gm);
    slidetexts.shift();
    for(let j=0; j < slidetexts.length;j++){
      let slidetext = "# " + slidetexts[j];
      let newSlide = document.createElement("div");
      let id = GorillaPresenter.slideIdFragment + uuid();
      newSlide.setAttribute("class", GorillaPresenter.slideClass);
      newSlide.setAttribute("id", id);
      slidetext = GorillaPresenter.processCommands(slidetext);
      newSlide.innerHTML =  `<div class="gorilla-presenter-editable"><div class="gorilla-presenter-slide-container">` + GorillaPresenter.markdown.render(slidetext) + "</div></div>";
      document.getElementById(GorillaPresenter.slideRoot).appendChild(newSlide);
      GorillaPresenter.sicTransit.transferPanel(newSlide);
    //  renderMathInElement(newSlide);
      GorillaPresenter.slideIDs.push(id);
    }
    renderMathInElement(document.body);
    GorillaPresenter.adjustImageSizes();
    GorillaPresenter.patchHyperlinks();
  }


  GorillaPresenter.patchHyperlinks = function(){
    // Prevent hyperlink events from performing slide navigation.
   const links = document.getElementsByTagName('a');
   for (let i = 0; i < links.length; i++) {
     links[i].addEventListener('click', function(event) {
     event.stopPropagation();
     });
     links[i].addEventListener('mouseup', function(event) {
       event.stopPropagation();
       });
     links[i].addEventListener('touchend', function(event) {
         event.stopPropagation();
         });
   }
 }
 
GorillaPresenter.slideForward = function(){
  if(GorillaPresenter.transitionBusy === true){
    return;
  }
  let transition = GorillaPresenter.slideTransitionsForward[GorillaPresenter.config.slidePosition];
  if(transition === undefined){
    transition = "swipeInFromRight";
  }
  GorillaPresenter.config.slidePosition = GorillaPresenter.config.slidePosition + 1;
  GorillaPresenter.displaySlide(transition);
}

GorillaPresenter.slideBack = function(){
  if(GorillaPresenter.transitionBusy === true){
    return;
  }
  let transition = GorillaPresenter.slideTransitionsBack[GorillaPresenter.config.slidePosition];
  if(transition === undefined){
    transition = "swipeInFromLeft"
  } 
  GorillaPresenter.config.slidePosition = GorillaPresenter.config.slidePosition - 1;
  GorillaPresenter.displaySlide(transition);
}
GorillaPresenter.transitionDone = function(){
  GorillaPresenter.transitionBusy = false;
  document.getElementById(GorillaPresenter.slideIDs[GorillaPresenter.config.slidePosition]).focus();
}
GorillaPresenter.displaySlide = function(transition){
  if(GorillaPresenter.slideIDs.length === 0){
    GorillaPresenter.warn(GorillaPresenter.translate("No slides. You'll have to make some first.",GorillaPresenter.config.currentLanguage));
    return;
  }
  if(GorillaPresenter.config.slidePosition < 0){
    GorillaPresenter.config.slidePosition = 0;
    GorillaPresenter.warn(GorillaPresenter.translate("At first slide.",GorillaPresenter.config.currentLanguage));
    return;
  }
  if(GorillaPresenter.config.slidePosition >= GorillaPresenter.slideIDs.length){
    GorillaPresenter.config.slidePosition = (GorillaPresenter.slideIDs).length -1 ;
    GorillaPresenter.warn(GorillaPresenter.translate("At last slide.",GorillaPresenter.config.currentLanguage));
    return;
  }
  if(GorillaPresenter.sicTransit.isValidTransition(transition) === false){
    warn(GorillaPresenter.translate("Unrecognized transition",GorillaPresenter.config.currentLanguage) + ": " + transition);
    return;
  }
  let slideId = GorillaPresenter.slideIDs[GorillaPresenter.config.slidePosition];
  if(slideId === undefined){
    GorillaPresenter. warn(GorillaPresenter.translate("No slide with this ID:",GorillaPresenter.config.currentLanguage) + slideId);
    return;
  }
/*    panelSelector: the selector for the panel to be transitioned. See selectPanel() for details.
  transitionName: the name of the transition to be performed. See getTransitionList() for a list of currently defined transitions.
  stackRotationNumber: the number of times to rotate the stack.  Only used by the rotateStack transition. Positive numbers move panels from the top of the stack to the bottom. Negative numbers move panels from the bottom of the stack to the top. Zero is a no-op. Default is 1. */
  GorillaPresenter.transitionBusy = true;
  setTimeout(function(){GorillaPresenter.transitionBusy = false;},4000); // Just in case something goes wrong, we don't want to be stuck in transitionBusy mode.
  GorillaPresenter.sicTransit.performTransition({"panelSelector":"#" + slideId, "transitionName":transition,"stackRotationNumber":0});
}


GorillaPresenter.showSpeakerNotes = function(){
  if(GorillaPresenter.speakerNotesWindow === null || GorillaPresenter.speakerNotesWindow.closed){
    GorillaPresenter.speakerNotesWindow = window.open("",GorillaPresenter.translate("Speaker Notes",GorillaPresenter.config.currentLanguage),"scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no,width=800,height=600");
}
else{
    GorillaPresenter.speakerNotesWindow.focus();
}
let notes = GorillaPresenter.speakerNotes.replace(/\n/g,"<br/><br/>\n");
  GorillaPresenter.speakerNotesWindow.document.write("<html><head><title>" + GorillaPresenter.translate("Speaker Notes",GorillaPresenter.config.currentLanguage) + "</title></head><body>" + notes + "</body></html>");
}

