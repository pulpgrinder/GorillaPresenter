// Copyright 2024 by Anthony W. Hursh. MIT License.

let GuerrillaPresenter = {
    slideRoot: "guerrilla-presenter-slideroot",
    slideClass: ".guerrilla-presenter-slide",
    slideIdFragment: "guerrilla-presenter-slide-",
    slidePosition:-1,
    speakerNotes:"",
    slideIDs: [],
    themes : {},
    showUIScreen:function(id){
      let screens = document.querySelectorAll(".guerrilla-presenter-screen");
      for(let i=0;i<screens.length;i++){
        screens[i].style.display = "none";
      }
      let screen = document.getElementById(id);
      screen.style.display = "block";
    },
    showSlideEditor:function(){
      this.showUIScreen("guerrilla-presenter-slide-editor-container");
      let editor = document.getElementById("guerrilla-presenter-slide-editor");
      editor.value = GuerrillaPresenter.slideData;
      editor.focus();
    },
    showThemeEditor:function(){
      GuerrillaPresenter.showUIScreen("guerrilla-presenter-theme-editor-container");
      let editor = document.getElementById("guerrilla-presenter-theme-editor");
      editor.value = GuerrillaPresenter.themeData;
      editor.focus();
    },
    showSlideDisplay:function(){
      GuerrillaPresenter.renderSlides(GuerrillaPresenter.slideRoot);
      GuerrillaPresenter.showUIScreen("guerrilla-presenter-slideroot");
    },
    saveSlides:function(){
      BrowserFileSystem.writeInternalTextFile("userdata/slides",GuerrillaPresenter.slideData);
      BrowserFileSystem.writeInternalTextFile("userdata/slideposition",GuerrillaPresenter.slidePosition.toString());
      BrowserFileSystem.writeInternalTextFile("userdata/themes",GuerrillaPresenter.themeData);
    },
    
    startup:function(){
     
      if(BrowserFileSystem.fileExists("userdata/slides.md") === false){
        console.log("No slides found.");
        GuerrillaPresenter.slideData ="";
      }
      else {
        GuerrillaPresenter.slideData = BrowserFileSystem.readInternalTextFile("userdata/slides.md");
      }
      document.getElementById("guerrilla-presenter-slide-editor").value = GuerrillaPresenter.slideData;
     if(BrowserFileSystem.fileExists("userdata/slideposition") === false){
        GuerrillaPresenter.slidePosition = -1;
      }
      else {
        GuerrillaPresenter.slidePosition = parseInt(BrowserFileSystem.readInternalTextFile("userdata/slideposition"));
      }
      if(BrowserFileSystem.fileExists("userdata/themes.csx") === false){
        GuerrillaPresenter.themeData = "";
      }
      else {
        GuerrillaPresenter.themeData = BrowserFileSystem.readInternalTextFile("userdata/themes.csx");
      }
      document.getElementById("guerrilla-presenter-theme-editor").value = GuerrillaPresenter.themeData;
      GuerrillaPresenter.renderThemes();
      if(BrowserFileSystem.fileExists("userdata/themename") === false){
        BrowserFileSystem.writeInternalTextFile("userdata/themename","Default");
      }
      let themename = BrowserFileSystem.readInternalTextFile("userdata/themename");
      GuerrillaPresenter.setTheme(themename);
      GuerrillaPresenter.renderSlides(GuerrillaPresenter.slideRoot);
      GuerrillaPresenter.showSlideDisplay();
      GuerrillaPresenter.displaySlide();
    },
   

    renderSlides:function(element){
      GuerrillaPresenter.speakerNotes = "";
      GuerrillaPresenter.slideIDs = [];
      let text; 
      let slidelines = GuerrillaPresenter.slideData.split("\n");
      let decommentedlines = [];
      for(let i=0;i < slidelines.length;i++){
         text = slidelines[i];
        if(text.indexOf(";") === 0){
          GuerrillaPresenter.speakerNotes += text.substring(1) + "\n";
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
        let id = GuerrillaPresenter.slideIdFragment + uuid();
        newSlide.setAttribute("class", this.slideClass);
        newSlide.setAttribute("id", id);
        newSlide.innerHTML =  `<div class="guerrilla-presenter-editable"><div class="guerrilla-presenter-slide-container">` + GuerrillaPresenter.markdown.render(slidetext) + "</div></div>";
        document.getElementById(GuerrillaPresenter.slideRoot).appendChild(newSlide);
        renderMathInElement(newSlide);
        GuerrillaPresenter.slideIDs.push(id);
      }
    },
    slideForward:function(){
      GuerrillaPresenter.slidePosition++;
      GuerrillaPresenter.displaySlide();
    },

    slideBack:function(){
      GuerrillaPresenter.slidePosition--;
      GuerrillaPresenter.displaySlide();
    },


    displaySlide:function(){
      if(GuerrillaPresenter.slideIDs.length === 0){
        GuerrillaPresenter.warn("No slides. You'll have to make some first.");
        return;
      }
      if(GuerrillaPresenter.slidePosition < 0){
        GuerrillaPresenter.slidePosition = 0;
        GuerrillaPresenter.warn("At first slide.");
      }
      if(GuerrillaPresenter.slidePosition >= GuerrillaPresenter.slideIDs.length){
        GuerrillaPresenter.slidePosition = GuerrillaPresenter.slideIDs.length -1 ;
        GuerrillaPresenter.warn("At last slide.");
      }
      let slideId = GuerrillaPresenter.slideIDs[GuerrillaPresenter.slidePosition];
      if(slideId === undefined){
        GuerrillaPresenter. warn("Slide ID" + slideId + " is undefined. Position is " + slidePosition);
        return;
      }
      this.sicTransit.showPanel("#" + slideId);
    },
    warn:function(message){
      alert("GuerrillaPresenter: " + message);
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
 
  handleEditorKeydown:function(event) {
    if(event.key === "Escape" || event.key === "Esc") {
        let textarea = event.target;
        if(textarea.classList.contains('guerrilla-presenter-editor')){
          GuerrillaPresenter.showSlideDisplay();
        event.preventDefault();
    }
  }
},
 
  handleEditorPaste: function(event) {
    console.log('paste event detected.');
    let element = event.target;
    if(element.classList.contains('guerrilla-presenter-editor')){
        console.log('Pasted in an editable element');
      let text = event.clipboardData.getData('text/plain');
      GuerrillaPresenter.insertTextAtCaret(text);
    }
  },

    handleSlideTextDblClick: function(event) {
        GuerrillaPresenter.showSlideEditor();
    
    },
    
    enterFullScreen:function(){
      console.log("enterFullScreen called");
      let element = document.getElementById(GuerrillaPresenter.slideRoot);
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

GuerrillaPresenter.sicTransit =  new SicTransit("#" + GuerrillaPresenter.slideRoot,GuerrillaPresenter.slideClass);



  