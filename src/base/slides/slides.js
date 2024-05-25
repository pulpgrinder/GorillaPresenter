GorillaPresenter.slideRoot = "gorilla-presenter-slideroot";
GorillaPresenter.slideClass = "gorilla-presenter-slide";
GorillaPresenter.slideSelector = ".gorilla-presenter-slide";
GorillaPresenter.slideIdFragment =  "gorilla-presenter-slide-";
GorillaPresenter.config.slidePosition = -1;
GorillaPresenter.speakerNotes = "";
GorillaPresenter.slideIDs = [];
GorillaPresenter.slideTransitionsForward = [];
GorillaPresenter.slideTransitionsBack =  [];
GorillaPresenter.transitionBusy = false; // This is a flag to prevent multiple transitions from happening at once.

GorillaPresenter.loadSlides = function(){
  if(BrowserFileSystem.fileExists("userdata/slides.md") === false){
    GorillaPresenter.slideData = "";
  }
  else{
    GorillaPresenter.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
  }
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
      console.log("newfile is " + newfile);
      
      parent.clearDocumentAndWrite(newfile);
    };
    reader.readAsText(workspace);
  }


GorillaPresenter.downloadSlides = function(){
  GorillaPresenter.saveSlides();
  let iframe_template = BrowserFileSystem.readInternalTextFile("base/internal_frame_template.html");
  let version = BrowserFileSystem.readInternalTextFile("build/version").trim();
  let build = BrowserFileSystem.readInternalTextFile("build/build").trim();
  let date = new Date();
  iframe_template = iframe_template.replace(/___VERSION___/g, version);
  iframe_template = iframe_template.replace(/___BUILD___/g, build);
  iframe_template = iframe_template.replace(/___BUILD_DATE___/g, date);
  iframe_template = iframe_template.replace(/___FILESYSTEM___/g, "BrowserFileSystem.fs=" + JSON.stringify(BrowserFileSystem.fs));
  iframe_data =  "var iframeContent = '" + btoa(iframe_template) + "';\n";
  let index_template = BrowserFileSystem.readInternalTextFile("base/index_template.html");
  console.log("index_template is " + index_template);
  index_template = index_template.replace(/___IFRAMECONTENT___/,iframe_data);
  console.log("Writing html file...");
  BrowserFileSystem.downloadFile("GorillaPresenter" + GorillaPresenter.downloadDate(),index_template,"text/html");
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

    let text = GorillaPresenter.slideData;
    text = text + "\r\n# Gorilla Presenter\nMade with love by Tony Hursh. See \"About\" for full credits.\nGorilla Presenter needs your help.\r\n\r\n" + "<a href='https://www.gorillapresenter.com/support'><img src=" + BrowserFileSystem.readInternalFileDataURL("icons/logo-small.png") + " width='25%' height='25%' style='display:block;margin-left:auto;margin-right:auto;'></a>\r\n";
    let index = text.indexOf("#");
    while (index !== -1) {
        if (index === 0 || text[index - 1] === "\n") {
          GorillaPresenter.slideOffsets.push(index);
        }
        index = text.indexOf("#", index + 1);
    }
    let slidelines = text.split("\n");
    let decommentedlines = [];
    for(let i=0;i < slidelines.length;i++){
       text = slidelines[i];
      if(text.indexOf(";") === 0){
        GorillaPresenter.speakerNotes += text.substring(1) + "\n";
        continue;
      }
      decommentedlines.push(text);
    }
    text = decommentedlines.join("\n");
    let slidetexts = text.split(/^# /gm);
    slidetexts.shift();
    for(let j=0; j < slidetexts.length;j++){
      let slidetext = "# " + slidetexts[j];
      GorillaPresenter.slideTitles.push(slidetexts[j].split("\n")[0]);
      let newSlide = document.createElement("div");
      let id = GorillaPresenter.slideIdFragment + uuid();
      newSlide.setAttribute("class", GorillaPresenter.slideClass);
      newSlide.setAttribute("id", id);
      newSlide.innerHTML =  `<div class="gorilla-presenter-editable"><div class="gorilla-presenter-slide-container">` + GorillaPresenter.markdown.render(slidetext) + "</div></div>";
      document.getElementById(GorillaPresenter.slideRoot).appendChild(newSlide);
      GorillaPresenter.sicTransit.transferPanel(newSlide);
    //  renderMathInElement(newSlide);
      GorillaPresenter.slideIDs.push(id);
    }
    renderMathInElement(document.body);
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


  