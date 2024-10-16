SlideHandler = {
  workspaceChooser: "slidehandler-workspace-chooser",
  slideSelector: "slidehandler-slide-selector",
  slidePosition: 0,
  speakerNotesWindow: null,
  sicTransit:null,
  inSlide:false,
  slides:{

  },
  

  selectSlide: function(index){
    SlideHandler.slidePosition = index;
    SlideHandler.displaySlide(index);
  },

  loadPresentation: function(){
    document.getElementById(SlideHandler.workspaceChooser).click();
  },
  workspaceChosen: function(){
    let uploader = document.getElementById(SlideHandler.workspaceChooser);
    let workspace = uploader.files[0];
    let reader = new FileReader();
    reader.onloadend = function(evt){
      let newfile = evt.target.result;
      parent.clearDocumentAndWrite(newfile);
    };
    reader.readAsText(workspace);
  },
  downloadPresentation: function(){
    SlideHandler.saveSlides();
    let iframe_template = BrowserFileSystem.readInternalTextFile("base/internal_frame_template.html");
    let version = BrowserFileSystem.readInternalTextFile("build/version").trim();
    let build = BrowserFileSystem.readInternalTextFile("build/build").trim();
    let date = BrowserFileSystem.readInternalTextFile("build/build_date").trim();
    iframe_template = iframe_template.replace(/___VERSION___/g, version);
    iframe_template = iframe_template.replace(/___BUILD___/g, build);
    iframe_template = iframe_template.replace(/___BUILD_DATE___/g, date);
    iframe_template = iframe_template.replace(/___FILESYSTEM___/g, "BrowserFileSystem.fs=" + JSON.stringify(BrowserFileSystem.fs));
    iframe_template = iframe_template.replace(/___DEBUGGING___/g,debugging);
    iframe_data =  "var iframeContent = \"" + BrowserFileSystem.bytesToBase64(iframe_template) + "\";\n";
    let index_template = BrowserFileSystem.readInternalTextFile("base/index_template.html");
    index_template = index_template.replace(/___IFRAMECONTENT___/,iframe_data);
    if(debugging){
      console.log("Downloading debuggable file");
      BrowserFileSystem.downloadFile("GorillaPresenter" + SlideHandler.downloadDate(),iframe_template,"text/html");
    }
    else{
      console.log("Downloading base file");
    BrowserFileSystem.downloadFile("GorillaPresenter" + SlideHandler.downloadDate(),index_template,"text/html");
    }
  },
  renderSlideSelector: function(){
    let slideSelector = document.getElementById(SlideHandler.slideSelector);
    slideSelector.innerHTML = "hooha";
  },
  
 
  displaySlide: function(index){
  let slideId = SlideHandler.slideIDs[index];
  if(slideId === undefined){
    UI.warn(Language.translate("No slide with this ID:",Language.currentLanguage) + slideId);
    return;
  }
  let slideData = SlideHandler.slides[slideId];
  alert(slideData)
},

showSpeakerNotes: function(){
  if(SlideHandler.speakerNotesWindow === null || SlideHandler.speakerNotesWindow.closed){
    SlideHandler.speakerNotesWindow = window.open("",Language.translate("Speaker Notes",Language.currentLanguage),"scrollbars=yes,resizable=yes,location=no,toolbar=no,menubar=no,width=800,height=600");
}
else{
   SlideHandler.speakerNotesWindow.focus();
}
let notes = SlideHandler.speakerNotes.replace(/\n/g,"<br/><br/>\n");
 SlideHandler.speakerNotesWindow.document.write("<html><head><title>" + Language.translate("Speaker Notes",Language.currentLanguage) + "</title></head><body>" + notes + "</body></html>");
},
}
