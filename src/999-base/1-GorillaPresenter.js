// Copyright 2024 by Anthony W. Hursh. MIT License.

let GorillaPresenter = {
    slideRoot: "gorilla-presenter-slideroot",
    slideClass: ".gorilla-presenter-slide",
    slideIdFragment: "gorilla-presenter-slide-",
    slidePosition:-1,
    speakerNotes:"",
    slideIDs: [],
    themes : {},
    showUIScreen:function(id){
      let screens = document.querySelectorAll(".gorilla-presenter-screen");
      for(let i=0;i<screens.length;i++){
        screens[i].style.display = "none";
      }
      let screen = document.getElementById(id);
      screen.style.display = "block";
    },
    showEditor:function(){
      this.showUIScreen("gorilla-presenter-editor-container");
      let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
      slideEditor.value = GorillaPresenter.slideData;
      let themeEditor = document.getElementById("gorilla-presenter-theme-text-editor");
      themeEditor.value = GorillaPresenter.themeData;
      slideEditor.focus();
    },
    updateData:function(){
      console.log("updateData called"); 
      GorillaPresenter.slideData = document.getElementById("gorilla-presenter-slide-text-editor").value;
      GorillaPresenter.themeData = document.getElementById("gorilla-presenter-theme-text-editor").value;
      GorillaPresenter.renderSlides(GorillaPresenter.slideRoot);
      GorillaPresenter.renderThemes();
      GorillaPresenter.displaySlide();
      GorillaPresenter.saveSlides();
      GorillaPresenter.showSlideDisplay();
    },
    showSlideDisplay:function(){
      GorillaPresenter.showUIScreen("gorilla-presenter-slideroot");
    },
    saveSlides:function(){
      BrowserFileSystem.writeInternalTextFile("userdata/slides",GorillaPresenter.slideData);
      BrowserFileSystem.writeInternalTextFile("userdata/slideposition",GorillaPresenter.slidePosition.toString());
      BrowserFileSystem.writeInternalTextFile("userdata/themes",GorillaPresenter.themeData);
    },
    
    startup:function(){
     
      if(BrowserFileSystem.fileExists("userdata/slides.md") === false){
        console.log("No slides found.");
        GorillaPresenter.slideData ="";
      }
      else {
        GorillaPresenter.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
      }
      document.getElementById("gorilla-presenter-slide-text-editor").value = GorillaPresenter.slideData;
     if(BrowserFileSystem.fileExists("userdata/slideposition") === false){
        GorillaPresenter.slidePosition = -1;
      }
      else {
        GorillaPresenter.slidePosition = parseInt(BrowserFileSystem.readInternalTextFile("userdata/slideposition"));
      }
      if(BrowserFileSystem.fileExists("userdata/themes.csx") === false){
        GorillaPresenter.themeData = "";
      }
      else {
        GorillaPresenter.themeData = BrowserFileSystem.readInternalTextFile("userdata/themes.csx");
      }
      document.getElementById("gorilla-presenter-theme-text-editor").value = GorillaPresenter.themeData;
      GorillaPresenter.renderThemes();
      if(BrowserFileSystem.fileExists("userdata/themename") === false){
        BrowserFileSystem.writeInternalTextFile("userdata/themename","Default");
      }
      let themename = BrowserFileSystem.readInternalTextFile("userdata/themename");
      GorillaPresenter.setTheme(themename);
      GorillaPresenter.renderSlides(GorillaPresenter.slideRoot);
      GorillaPresenter.showSlideDisplay();
      GorillaPresenter.displaySlide();
    },
   

    renderSlides:function(element){
      GorillaPresenter.speakerNotes = "";
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
        newSlide.setAttribute("class", this.slideClass);
        newSlide.setAttribute("id", id);
        newSlide.innerHTML =  `<div class="gorilla-presenter-editable"><div class="gorilla-presenter-slide-container">` + GorillaPresenter.markdown.render(slidetext) + "</div></div>";
        document.getElementById(GorillaPresenter.slideRoot).appendChild(newSlide);
        renderMathInElement(newSlide);
        GorillaPresenter.slideIDs.push(id);
      }
    },
    slideForward:function(){
      GorillaPresenter.slidePosition++;
      GorillaPresenter.displaySlide();
    },

    slideBack:function(){
      GorillaPresenter.slidePosition--;
      GorillaPresenter.displaySlide();
    },


    displaySlide:function(){
      if(GorillaPresenter.slideIDs.length === 0){
        GorillaPresenter.warn("No slides. You'll have to make some first.");
        return;
      }
      if(GorillaPresenter.slidePosition < 0){
        GorillaPresenter.slidePosition = 0;
        GorillaPresenter.warn("At first slide.");
      }
      if(GorillaPresenter.slidePosition >= GorillaPresenter.slideIDs.length){
        GorillaPresenter.slidePosition = GorillaPresenter.slideIDs.length -1 ;
        GorillaPresenter.warn("At last slide.");
      }
      let slideId = GorillaPresenter.slideIDs[GorillaPresenter.slidePosition];
      if(slideId === undefined){
        GorillaPresenter. warn("Slide ID" + slideId + " is undefined. Position is " + slidePosition);
        return;
      }
      this.sicTransit.showPanel("#" + slideId);
    },
    warn:function(message){
      let slideElement = document.getElementById(GorillaPresenter.slideRoot);
      const slideStyles = window.getComputedStyle(slideElement);
      let warningElement = document.getElementById("gorilla-presenter-warning-message");
      warningElement.style.opacity = 0;
      warningElement.style.display = "block";
      let warningElementStyle = window.getComputedStyle(warningElement);
      let slideWidth = parseInt(slideStyles.width);
      let slideHeight = parseInt(slideStyles.height);
      let warningWidth = parseInt(warningElementStyle.width);
      let warningHeight = parseInt(warningElementStyle.height);
      let left = (slideWidth - warningWidth) / 2;
      let top = (slideHeight - warningHeight) / 2;
      warningElement.style.left = left + "px";
      warningElement.style.top = top + "px"; 
      warningElement.innerHTML = message;
      fadeIn(warningElement);
      setTimeout(function(){
        fadeOut(warningElement);
      },1000);
    },
    bytes_to_base_64:function(buffer){
      let arr = new Uint8Array(buffer)
      let raw = '';
      for (let i = 0, l = arr.length; i < l; i++) {
        raw += String.fromCharCode(arr[i]);
      }
      return window.btoa(raw);
    },
   
  insertTextAtCaret: function(text) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( document.createTextNode(text) );
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
  },
 
 /*  handleEditorKeydown:function(event) {
    if(event.key === "Escape" || event.key === "Esc") {
        let textarea = event.target;
        if(textarea.classList.contains('gorilla-presenter-editor')){
          GorillaPresenter.showSlideDisplay();
        event.preventDefault();
    }
  }
},
  */
/*   handleEditorPaste: function(event) {
    console.log('paste event detected.');
    let element = event.target;
    if(element.classList.contains('gorilla-presenter-editor')){
        console.log('Pasted in an editable element');
      let text = event.clipboardData.getData('text/plain');
      GorillaPresenter.insertTextAtCaret(text);
    }
  }, */
    
    enterFullScreen:function(){
      console.log("enterFullScreen called");
      let element = document.getElementById(GorillaPresenter.slideRoot);
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitrequestFullscreen) { /* Safari */
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { /* IE11 */
        element.msRequestFullscreen();
      }
      element.focus();
    },
    
}

GorillaPresenter.sicTransit =  new SicTransit("#" + GorillaPresenter.slideRoot,GorillaPresenter.slideClass);



  