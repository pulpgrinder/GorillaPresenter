
let GuerrillaPresenter = {
    slideRoot: "guerrilla-presenter-slideroot",
    slideClass: ".guerrilla-presenter-slide",
    slideIdFragment: "guerrilla-presenter-slide-",
    addSlide:function(templatename){
        let slideBase = document.getElementById(this.slideRoot);
        let id = GuerrillaPresenter.slideIdFragment + uuid();
        let newSlide = document.createElement("div");
        newSlide.setAttribute("class", this.slideClass);
        newSlide.setAttribute("id", id);
        newSlide.setAttribute("template", templatename);
        let html = this.processTemplates(templatename);
        newSlide.innerHTML = html;
        slideBase.appendChild(newSlide);
        this.renderElements();
        this.sicTransit.showPanel("#" + id);
    },
    startup:function(){
      GuerrillaPresenter.addSlide("basicslide");
      if(GuerrillaPresenter.fileExists("themename") == false){
            GuerrillaPresenter.writeInternalTextFile("themename","default");
      }
      let themename = GuerrillaPresenter.readInternalTextFile("themename");
      GuerrillaPresenter.setTheme(themename)
    },
    processTemplates: function(templatename){
      let result = "";
      let template = GuerrillaPresenterTemplates[templatename];
      console.log(templatename);
      if(template === undefined){
        this.warn("Template " + templatename + " not found. Using basicslide instead.");
        template = GuerrillaPresenterTemplates["basicslide"];
      }
      for(let i = 0; i < template.length; i++){
        let component = template[i];
        console.log("component: " + component);
        let componentFunction = GuerrillaPresenterComponents[component];
        result += componentFunction("",true);
      }
      return "<div class='guerrilla-presenter-" + templatename + "'>" + result + "</div>";
    },

    renderElements: function(){
      const editors = document.querySelectorAll('textarea.guerrilla-presenter-editor');
      for (let i = 0; i < editors.length; i++) {
          let element = editors[i];
          element.offsetHeight = element.parentElement.querySelector('.guerrilla-presenter-editable').offsetHeight;
          console.log("offsetHeight: " + element.offsetHeight);
          this.updateSlide(element);
      }
    },
    updateSlide:function(element){
      console.log("updating slide");
      let text = element.value;
      textlines = text.split("\n");
      let commentStrippedLines = [];
      for(let i = 0; i < textlines.length; i++){
        if(textlines[i][0] === ";"){
          // Need to put something in here to add to speaker notes.
          continue;
        }
        commentStrippedLines.push(textlines[i]);
      }
      text = commentStrippedLines.join("\n");
      let markdownText = GuerrillaPresenter.markdown.render(text);
      console.log("markdownText is: " + markdownText);
      let displayElement = element.parentElement.querySelector('.guerrilla-presenter-editable');
      displayElement.innerHTML = markdownText // GuerrillaPresenter.replaceParagraphsWithDivs(markdownText); // markdownText;
      
      //GuerrillaPresenter.replaceParagraphsWithBreaks(markdownText);
      renderMathInElement(displayElement);
      GuerrillaPresenter.patchEventListeners();
    },
    warn:function(message){
      alert("GuerrillaPresenter warning: " + message);
    },
    bytes_to_base_64:function(buffer){
      let arr = new Uint8Array(buffer)
      let raw = '';
      for (let i = 0, l = arr.length; i < l; i++) {
        raw += String.fromCharCode(arr[i]);
      }
      return window.btoa(raw);
    },
    patchEventListeners:function(){
      const editableElements = document.querySelectorAll('div.guerrilla-presenter-editable');
      console.log("there are " + editableElements.length + " editable elements");
      for (let i = 0; i < editableElements.length; i++) {
          let element = editableElements[i];
          if (!element.hasAttribute('click-added')) {
            editableElements[i].addEventListener('click',GuerrillaPresenter.handleSlideTextClick);
            element.setAttribute('click-added', 'true');
          }
      }
      const textEditors = document.querySelectorAll('textarea.guerrilla-presenter-editor');
      console.log("there are " + textEditors.length + " textEditors");
      for (let i = 0; i < textEditors.length; i++) {
          let textEditor = textEditors[i];
          if (!textEditor.hasAttribute('blur-added')) {
              textEditor.addEventListener('blur',GuerrillaPresenter.handleEditorBlur);
            textEditor.setAttribute('blur-added', 'true');
          }
          if (!textEditor.hasAttribute('paste-added')) {
            textEditor.addEventListener('onpaste',GuerrillaPresenter.handleEditorPaste);
            textEditor.setAttribute('paste-added', 'true');
          }
          if (!textEditor.hasAttribute('keydown-added')) {
            textEditor.addEventListener('keydown',GuerrillaPresenter.handleEditorKeydown);
            textEditor.setAttribute('keydown-added', 'true');
          }
      }
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
  hideEditor: function(textEditor) {
    const displayElement = textEditor.parentElement.querySelector('div.guerrilla-presenter-editable');
    if (displayElement !== null) {
      displayElement.style.display = 'block';
      textEditor.style.display = 'none';
      GuerrillaPresenter.updateSlide(textEditor);
    }
    else{
      console.error('No display element found for this editor.');
    }
  },

   handleEditorBlur: function(event) {
    console.log('blur event detected.')
    let textarea = event.target;
    if(textarea.classList.contains('guerrilla-presenter-editor')){
      GuerrillaPresenter.hideEditor(textarea);
      event.preventDefault();
    }
  },

  handleEditorKeydown:function(event) {
    if(event.key === "Escape" || event.key === "Esc") {
        console.log('Escape key was pressed.');
        let textarea = event.target;
        if(textarea.classList.contains('guerrilla-presenter-editor')){
          GuerrillaPresenter.hideEditor(textarea);
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

    handleSlideTextClick: function(event) {
      console.log('click event detected.');
      let element = event.target;
      const editableElement = element.closest('.guerrilla-presenter-editable');
    if (editableElement) {
        console.log('A parent with the class "guerrilla-presenter-editable" was found');
        console.log('clicked on an editable element');
        const style = window.getComputedStyle(editableElement);
        const height = editableElement.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
        editableElement.style.display = 'none';
        const texteditor = editableElement.parentElement.querySelector('textarea.guerrilla-presenter-editor');
          texteditor.style.height = `${height}px`;
          texteditor.style.display = 'block';
          texteditor.focus();
        }
        else {
          console.log('No parent with the class "guerrilla-presenter-editable"  was found.');
        }
    },
    
}

GuerrillaPresenter.sicTransit =  new SicTransit("#" + GuerrillaPresenter.slideRoot,GuerrillaPresenter.slideClass);



  