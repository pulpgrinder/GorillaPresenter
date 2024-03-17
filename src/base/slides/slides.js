GorillaPresenter.slideRoot = "gorilla-presenter-slideroot";
GorillaPresenter.slideClass = "gorilla-presenter-slide";
GorillaPresenter.slideSelector = ".gorilla-presenter-slide";
GorillaPresenter.slideIdFragment =  "gorilla-presenter-slide-";
GorillaPresenter.slidePosition = -1;
GorillaPresenter.speakerNotes = "";
GorillaPresenter.slideIDs = [];
GorillaPresenter.slideTransitionsForward = [];
GorillaPresenter.slideTransitionsBack =  [];
GorillaPresenter.transitionBusy = false; // This is a flag to prevent multiple transitions from happening at once.
GorillaPresenter.loadSlides = function(){
    if(BrowserFileSystem.fileExists("userdata/slides.md")){
        GorillaPresenter.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
     }
     else{
        GorillaPresenter.slideData = "#No Slides\nYou need to add some slides\n";
     }
    if(BrowserFileSystem.fileExists("userdata/slideposition")){
        GorillaPresenter.slidePosition = parseInt(BrowserFileSystem.readInternalTextFile("userdata/slideposition"));
    }
    else{
      GorillaPresenter.slidePosition = -1;
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
    let text; 
    let slidelines = GorillaPresenter.slideData.split("\n");
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
      let newSlide = document.createElement("div");
      let id = GorillaPresenter.slideIdFragment + uuid();
      newSlide.setAttribute("class", GorillaPresenter.slideClass);
      newSlide.setAttribute("id", id);
      newSlide.innerHTML =  `<div class="gorilla-presenter-editable"><div class="gorilla-presenter-slide-container">` + GorillaPresenter.markdown.render(slidetext) + "</div></div>";
      document.getElementById(GorillaPresenter.slideRoot).appendChild(newSlide);
      GorillaPresenter.sicTransit.transferPanel(newSlide);
      renderMathInElement(newSlide);
      GorillaPresenter.slideIDs.push(id);
    }
  }

  GorillaPresenter.saveSlides = function(){
    BrowserFileSystem.writeInternalTextFile("userdata/slides.md",GorillaPresenter.slideData);
    BrowserFileSystem.writeInternalTextFile("userdata/slideposition",GorillaPresenter.slidePosition.toString());
  }


GorillaPresenter.slideForward = function(){
  if(GorillaPresenter.transitionBusy === true){
    console.log("slideForward: Transition handler is busy.");
    return;
  }
  let transition = GorillaPresenter.slideTransitionsForward[GorillaPresenter.slidePosition];
  console.log("slideForward: Transition is " + transition);
  if(transition === undefined){
    transition = "swipeInFromRight";
  }
  GorillaPresenter.slidePosition = GorillaPresenter.slidePosition + 1;
  GorillaPresenter.displaySlide(transition);
}

GorillaPresenter.slideBack = function(){
  if(GorillaPresenter.transitionBusy === true){
    console.log("slideBack: Transition handler is busy.");
    return;
  }
  let transition = GorillaPresenter.slideTransitionsBack[GorillaPresenter.slidePosition];
  if(transition === undefined){
    transition = "swipeInFromLeft"
  } 
  GorillaPresenter.slidePosition = GorillaPresenter.slidePosition - 1;
  GorillaPresenter.displaySlide(transition);
}
GorillaPresenter.transitionDone = function(){
  console.log("in transitionDone callback");
  GorillaPresenter.transitionBusy = false;
}
GorillaPresenter.displaySlide = function(transition){
  console.log("displaySlide: transition is "  + transition);
  if(GorillaPresenter.slideIDs.length === 0){
    GorillaPresenter.warn(GorillaPresenter.translate("No slides. You'll have to make some first.",GorillaPresenter.currentLanguage));
    return;
  }
  if(GorillaPresenter.slidePosition < 0){
    GorillaPresenter.slidePosition = 0;
    GorillaPresenter.warn(GorillaPresenter.translate("At first slide.",GorillaPresenter.currentLanguage));
    return;
  }
  if(GorillaPresenter.slidePosition >= GorillaPresenter.slideIDs.length){
    GorillaPresenter.slidePosition = GorillaPresenter.slideIDs.length -1 ;
    GorillaPresenter.warn(GorillaPresenter.translate("At last slide.",GorillaPresenter.currentLanguage));
    return;
  }
  if(GorillaPresenter.sicTransit.isValidTransition(transition) === false){
    warn(GorillaPresenter.translate("Unrecognized transition",GorillaPresenter.currentLanguage) + ": " + transition);
    return;
  }
  let slideId = GorillaPresenter.slideIDs[GorillaPresenter.slidePosition];
  if(slideId === undefined){
    GorillaPresenter. warn(GorillaPresenter.translate("No slide with this ID:",GorillaPresenter.currentLanguage) + slideId);
    return;
  }
/*    panelSelector: the selector for the panel to be transitioned. See selectPanel() for details.
  transitionName: the name of the transition to be performed. See getTransitionList() for a list of currently defined transitions.
  stackRotationNumber: the number of times to rotate the stack.  Only used by the rotateStack transition. Positive numbers move panels from the top of the stack to the bottom. Negative numbers move panels from the bottom of the stack to the top. Zero is a no-op. Default is 1. */
  GorillaPresenter.transitionBusy = true;
  setTimeout(function(){GorillaPresenter.transitionBusy = false;},4000); // Just in case something goes wrong, we don't want to be stuck in transitionBusy mode.
  GorillaPresenter.sicTransit.performTransition({"panelSelector":"#" + slideId, "transitionName":transition,"stackRotationNumber":0});
}


  