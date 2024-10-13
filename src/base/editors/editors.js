GorillaPresenter.editor = {};

GorillaPresenter.editor.syncEditorTextAreas = function (event) {

  setTimeout(function() {
    
  const source = event.target;
  let mainEditor = document.getElementById("gorilla-presenter-slide-text-editor");
  let splitEditor = document.getElementById("gorilla-presenter-secondary-slide-text-editor");
  const target = source === mainEditor ? splitEditor : mainEditor;

  // Save scroll positions
  const sourceScroll = source.scrollTop;
  const sourceCaret = source.selectionStart;
  const targetScroll = target.scrollTop;

  // Synchronize text
  if (target.value !== source.value) {
    target.value = source.value;
  } 
  // Restore scroll positions
  source.scrollTop = sourceScroll;
  source.selectionStart = source.selectionEnd = sourceCaret;
  target.scrollTop = targetScroll;
  }, 0);
  GorillaPresenter.editor.saveEditorCursors();
  GorillaPresenter.editor.updateEditorData();
}

GorillaPresenter.editor.editorResized = function() {
  let height = GorillaPresenter.editor.slideEditor.offsetHeight;
  GorillaPresenter.slideEditorSize = height + "px";
  let containerHeight = GorillaPresenter.editor.slideEditor.parentElement.offsetHeight;
  GorillaPresenter.editor.splitEditorSize  = (containerHeight - height) + "px";
  GorillaPresenter.editor.splitEditor.style.height =  GorillaPresenter.editor.splitEditorSize;
 }

GorillaPresenter.initSlideEditor = function(){
    GorillaPresenter.editormode = null;
    const slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
    slideEditor.style.height = '94vh';
    GorillaPresenter.editor.slideEditor = slideEditor;
    GorillaPresenter.editor.slideEditorSize = "50vh";
    const splitEditor = document.getElementById("gorilla-presenter-secondary-slide-text-editor");
    splitEditor.style.height = '0%';
    GorillaPresenter.editor.splitEditor = splitEditor;
    GorillaPresenter.editor.splitEditorSize = "50vh";
    const showButton = document.getElementById('split-editor');
    const hideButton = document.getElementById('unsplit-editor');
    GorillaPresenter.editor.initEditorButtons();
    GorillaPresenter.editor.setButtonTranslations();
    slideEditor.value = GorillaPresenter.slideData;
    splitEditor.value = GorillaPresenter.slideData;
    slideEditor.addEventListener('input', GorillaPresenter.editor.saveEditorCursors);
    slideEditor.addEventListener('paste', GorillaPresenter.editor.handleEditorPaste);
    slideEditor.focus();
['input', 'cut', 'paste'].forEach(eventType => {
    slideEditor.addEventListener(eventType, GorillaPresenter.editor.syncEditorTextAreas);
    splitEditor.addEventListener(eventType, GorillaPresenter.editor.syncEditorTextAreas);
   
});
GorillaPresenter.editor.editorResizeObserver = new ResizeObserver(GorillaPresenter.editor.editorResized);
GorillaPresenter.editor.editorResizeObserver.unobserve(slideEditor);
showButton.addEventListener('click', () => {
    //GorillaPresenter.editorResizeObserver.unobserve(slideEditor);
    slideEditor.style.height = GorillaPresenter.editor.slideEditorSize;
    splitEditor.style.height = GorillaPresenter.editor.splitEditorSize;
    splitEditor.style.display = 'block';
    showButton.style.display = 'none';
    hideButton.style.display = 'inline';
    GorillaPresenter.editor.editorResizeObserver.observe(slideEditor);
    
});
hideButton.addEventListener('click', () => {
    GorillaPresenter.editor.editorResizeObserver.unobserve(slideEditor);
    splitEditor.style.display = 'none';
    showButton.style.display = 'inline';
    hideButton.style.display = 'none';
    GorillaPresenter.editor.slideEditor.style.height = '94vh';
});
  }

  GorillaPresenter.showSlideEditor = function(){
    GorillaPresenter.editormode = "slide";
    GorillaPresenter.showUIScreen("gorilla-presenter-slide-editor-container");
    GorillaPresenter.currentScreen = "Slide Editor";
    let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
   slideEditor.value = GorillaPresenter.slideData;
   if(GorillaPresenter.config.slidePosition < 0){
      GorillaPresenter.config.slideEditorPosition = 0;
    }
    else {
      GorillaPresenter.config.slideEditorPosition = GorillaPresenter.slideOffsets[GorillaPresenter.config.slidePosition];
    }
    
    setTimeout(function(){
      slideEditor.setSelectionRange(GorillaPresenter.config.slideEditorPosition, GorillaPresenter.config.slideEditorPosition);
      slideEditor.blur();
      slideEditor.focus();
      
  },100);
  }

  GorillaPresenter.showThemeEditor = function(){
    GorillaPresenter.editormode = "theme";
    GorillaPresenter.showUIScreen("gorilla-presenter-slide-editor-container");
    GorillaPresenter.currentScreen = "Theme Editor";
    let themeEditor = document.getElementById("gorilla-presenter-slide-text-editor");
   themeEditor.value = BrowserFileSystem.readInternalTextFile("userdata/themes.vss");
 
    setTimeout(function(){
      themeEditor.setSelectionRange(GorillaPresenter.config.themeEditorPosition, GorillaPresenter.config.themeEditorPosition);
      themeEditor.blur();
      themeEditor.focus();
      
  },100);
  }
GorillaPresenter.editor.saveEditorCursors = function(){
    if(GorillaPresenter.editormode === null){
      return;
    }
    let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
    if(GorillaPresenter.editormode === "slide"){
    GorillaPresenter.config.slideEditorPosition = slideEditor.selectionStart;
    }
    else if(GorillaPresenter.editormode === "theme"){
      GorillaPresenter.config.themeEditorPosition = slideEditor.selectionStart;
    }
  }

GorillaPresenter.editor.updateEditorData = function(){
  if(GorillaPresenter.editormode === null){
    return;
  }
  console.log("updating editor data");
    let editor = document.getElementById("gorilla-presenter-slide-text-editor");
    if(GorillaPresenter.editormode === "slide"){
      console.log("slide data is " + editor.value);
     GorillaPresenter.slideData = editor.value;
      GorillaPresenter.config.slideEditorPosition = editor.selectionStart;
     GorillaPresenter.renderPresentationData();
    }
    else if(GorillaPresenter.editormode === "theme"){ 
      console.log("saving themes")
      GorillaPresenter.themeData = editor.value;
      GorillaPresenter.config.themeEditorPosition = editor.selectionStart;
      BrowserFileSystem.writeInternalTextFile("userdata/themes.vss", GorillaPresenter.themeData);
      GorillaPresenter.setTheme();
     GorillaPresenter.saveConfig();
     GorillaPresenter.renderMainMenu();
    }
    else {
      console.error("Unknown editor mode: " + GorillaPresenter.config.editormode);
    }
}

  
GorillaPresenter.editor.insertTextAtCaret = function(text) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
  },
 

GorillaPresenter.editor.handleEditorPaste = function(event) {
    let element = event.target;
    if(element.classList.contains('gorilla-presenter-editor')){
      let text = event.clipboardData.getData('text/plain');
      GorillaPresenter.editor.insertTextAtCaret(text);
    }
}

GorillaPresenter.editor.performEditorFunction = function(event){
  console.log("performing editor function: " + event.target.title);
  switch(event.target.title){
    case "Done":
      GorillaPresenter.showSlideShowScreen(); 
      break;
    case "Bold":
      GorillaPresenter.editor.toggleBold();
      break;
    case "Italic":
      GorillaPresenter.editor.toggleItalic();
      break;
     case "Bulleted List":
      GorillaPresenter.editor.toggleBulletedList();
      break;
    case "Numbered List":
      GorillaPresenter.editor.toggleNumberedList();
      break;
    case "Block Quote":
      GorillaPresenter.editor.toggleBlockQuote();
      break;
    case "Cut":
      GorillaPresenter.editor.cut();
      break;
    case "Copy":
      GorillaPresenter.editor.copy();
      break;
    case "Paste":
      GorillaPresenter.editor.paste();
      break;
    case "Undo":
      GorillaPresenter.editor.undo();
      break;
    case "Redo":
      GorillaPresenter.editor.redo();
      break;

}
}
GorillaPresenter.editor.initEditorButtons = function(){
  let editorButtons = document.querySelectorAll('.gorilla-presenter-editor-button');
  editorButtons.forEach(function(button){
    button.addEventListener('click', GorillaPresenter.editor.performEditorFunction);
  });
  GorillaPresenter.editor.setButtonTranslations();
}

GorillaPresenter.editor.setButtonTranslations = function(){
  let currentLanguage = GorillaPresenter.config.currentLanguage;
  let buttons = document.querySelectorAll('.gorilla-presenter-editor-button');
  buttons.forEach(function(button){
    let englishtitle = button.getAttribute('englishtitle');
    button.title = GorillaPresenter.translate(englishtitle,currentLanguage);
  });
}
