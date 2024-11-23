let EditorHandler = {
    backingFiles:{},
    createEditors(){
        EditorHandler.createEditor("slide");
        EditorHandler.createEditor("theme");
    },
   
    createEditorContainer(prefix,backingFile){
        let editorid = prefix + "-editor-container";
        EditorHandler.backingFiles[prefix] = backingFile;
        console.log("Backing file: " + EditorHandler.backingFiles);

        let editor = SEML.parseSEML("div", "#" + editorid + ".editor-panel.panel.sic-transit-panel.accessory-screen!style='display:none'",
          EditorHandler.createEditor(prefix));
          document.body.insertAdjacentHTML("beforeend",editor);
    },
    createEditor: function(prefix,backingFile){
      return SEML.parseSEML("div", "#" + prefix + "-editor.editor",
        EditorHandler.createEditorButtonBar(prefix) + EditorHandler.createEditorTextArea(prefix));
      },

    createEditorButtonBar: function(prefix){
        return SEML.parseSEML("div", "#" + prefix + "-button-bar.editor-button-bar.editor-toolbar",
        EditorHandler.createEditorButtons(prefix));
    },
    createEditorTextArea: function(prefix){
        return SEML.parseSEML("textarea", "#" + prefix + "-editor-textarea.editor-textarea",BrowserFileSystem.readInternalTextFile(EditorHandler.backingFiles[prefix]));
    },

    createEditorButtons: function(prefix){
       let buttons = {
        "Done":"✓",
        "Bold":"𝐁", 
        "Italic":"𝐼",
        "Block Quote":'“',
        "Cut":"✂",
        "Copy":"⧉", 
        "Paste":"📋",
        "Undo":"↺",
        "Redo":"↻"
      };
      let buttonBar = "";
      let buttonValues = Object.keys(buttons);
      buttonValues.forEach(function(buttonValue){
        let englishtitle = buttonValue;
        let translatedTitle = LanguageHandler.translate(englishtitle,LanguageHandler.currentLanguage);
        buttonBar = buttonBar + SEML.parseSEML("button", "#" + prefix + "-" + buttonValue.toLowerCase().replace(" ","-") + ".editor-button." + prefix + "-editor-button!title='" + translatedTitle + "'!data-button-function='" + buttonValue + "'", buttons[buttonValue]);
      });
      return buttonBar;
    },      
    editorDone:function(editorid){
        let text = document.querySelector("#" + editorid + "-main-editor").value ;
        console.log("Saving text: " + text + " to " + EditorHandler.backingFiles[editorid]);
        BrowserFileSystem.writeInternalTextFile(EditorHandler.backingFiles[editorid], text);
        UIHandler.hideAccessoryScreen(editorid);
        if(EditorHandler.editorType === "slide"){
          SlideRenderer.renderSlides();
        }
        else if (EditorHandler.editorType === "theme"){
          ThemeHandler.loadThemes();
        }
    },
    insertTextAtCaret: function(text) {
      console.log("Inserting text at caret: " + text);
      const textarea = EditorHandler.activeEditor;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const currentValue = textarea.value;
      textarea.value = currentValue.substring(0, startPos) + text + currentValue.substring(endPos);
      textarea.selectionStart = textarea.selectionEnd = startPos + text.length;
      textarea.focus();
    },

      handleEditorPaste:function(event) {
        let text = event.clipboardData.getData('text/plain');
        event.stopPropagation();
        event.preventDefault();
        EditorHandler.insertTextAtCaret(text);
      },


  performEditorFunction:function(event){
    let button = event.currentTarget;
    let editorFunction = button.getAttribute("data-button-function");
    switch(editorFunction){
      case "Done":
        EditorHandler.editorDone(button.classList[1].split("-")[0]);
        break;
      case "Bold":
        EditorHandler.toggleBold(button);
        break;
      case "Italic":
        EditorHandler.toggleItalic(button);
        break;
      case "Block Quote":
        EditorHandler.toggleBlockQuote(button);
        break;
      case "Cut":
        EditorHandler.cut(button);
        break;
      case "Copy":
        EditorHandler.copy(button);
        break;
      case "Paste":
        EditorHandler.handleEditorPaste(button);
        break;
      case "Undo":
        EditorHandler.undo(button);
        break;
      case "Redo":
        EditorHandler.redo(button);
        break;
    }
    alert(button.getAttribute("title"));
  },

}
 /* 

   syncEditorTextAreas: function (event) {
        setTimeout(function() {
        const source = event.currentTarget;
        const mainEditor = (source === EditHandler.slideSplitEditor || source === EditHandler.themeSplitEditor ? EditHandler.slideMainEditor : EditHandler.themeMainEditor);
        const splitEditor = (source === EditHandler.slideSplitEditor || source === EditHandler.themeSplitEditor ? EditHandler.slideSplitEditor : EditHandler.themeSplitEditor);
        
        const target = (source === mainEditor ? splitEditor : mainEditor);
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
    EditHandler.saveEditorCursors();
    EditHandler.updateEditorData();
 }, */
