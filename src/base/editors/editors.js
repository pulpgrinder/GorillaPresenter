GorillaPresenter.initSlideEditor = function(){
    let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
    slideEditor.value = GorillaPresenter.slideData;
    slideEditor.addEventListener('input', GorillaPresenter.saveEditorCursors);
    slideEditor.addEventListener('paste', GorillaPresenter.handleEditorPaste);
   /* slideEditor.addEventListener('keydown', GorillaPresenter.handleEditorKeydown);
    slideEditor.addEventListener('keyup', GorillaPresenter.handleEditorKeyup);*/
    slideEditor.focus();
  }

  GorillaPresenter.showSlideEditor = function(){
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
GorillaPresenter.saveEditorCursors = function(){
    let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
    GorillaPresenter.config.slideEditorPosition = slideEditor.selectionStart;
  }

GorillaPresenter.updateEditorData = function(){
    let editor = document.getElementById("gorilla-presenter-slide-text-editor");
    GorillaPresenter.slideData = editor.value;
    GorillaPresenter.config.slideEditorPosition = editor.selectionStart;
    GorillaPresenter.renderSlides(GorillaPresenter.slideRoot);
    GorillaPresenter.saveConfig();
}

  
GorillaPresenter.insertTextAtCaret = function(text) {
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
 

GorillaPresenter.handleEditorPaste = function(event) {
    let element = event.target;
    if(element.classList.contains('gorilla-presenter-editor')){
      let text = event.clipboardData.getData('text/plain');
      GorillaPresenter.insertTextAtCaret(text);
    }
}