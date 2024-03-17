GorillaPresenter.slideEditorPosition = 0;
GorillaPresenter.editor_mode = "light";

GorillaPresenter.saveEditorCursors = function(){
    let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
    GorillaPresenter.slideEditorPosition = slideEditor.selectionStart;
  }

GorillaPresenter.updateEditorData = function(){
    GorillaPresenter.slideData = document.getElementById("gorilla-presenter-slide-text-editor").value;
      GorillaPresenter.renderSlides(GorillaPresenter.slideRoot);
      GorillaPresenter.savePresentationData();
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
    console.log('paste event detected.');
    let element = event.target;
    if(element.classList.contains('gorilla-presenter-editor')){
        console.log('Pasted in an editable element');
      let text = event.clipboardData.getData('text/plain');
      GorillaPresenter.insertTextAtCaret(text);
    }
}