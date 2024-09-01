GorillaPresenterFontStackOptions = {
    "Antique": "--antique-font-stack",
    "Didone": "--didone-font-stack",
    "Generic Cursive": "--cursive-font-stack",
    "Generic Serif": "--serif-font-stack",
    "Generic Sans Serif": "--sans-serif-font-stack",
    "Generic Monospace": "--monospace-font-stack",
    "Handwritten": "--handwritten-font-stack",
    "Humanist": "--humanist-font-stack",
    "Humanist (classical)": "--classical-humanist-font-stack",
    "Humanist (geometric)": "--geometric-humanist-font-stack",
    "Industrial": "--industrial-font-stack",
    "Monospace Code": "--monospace-code-font-stack",
    "Monospace Slab Serif": "--monospace-slab-serif-font-stack",
    "Neo-Grotesque": "--neo-grotesque-font-stack",
    "Old Style": "--old-style-font-stack",
    "Rounded Sans": "--rounded-sans-font-stack",
    "System UI": "--system-ui-font-stack",
    "Transitional": "--transitional-font-stack",
  }

  GorillaPresenter.setFontStacks = function(){
    if(document.getElementById("gorilla-presenter-font-stack")){
      document.getElementById("gorilla-presenter-font-stack").remove();
    }
      let styleElement = document.createElement('style');
      styleElement.id = "gorilla-presenter-font-stack";
      styleElement.innerHTML = ":root {\n--slide-heading-font-stack: var(" + GorillaPresenter.config.headingFontStack + ");\n--slide-body-font-stack: var(" + GorillaPresenter.config.bodyFontStack + ");\n--slide-code-font-stack:var(" + GorillaPresenter.config.codeFontStack + ");}\n";
      document.head.appendChild(styleElement);
      GorillaPresenter.saveConfig();
    }
  
GorillaPresenter.renderFontStackSelector = function(selectedFontStack){
  let selectorHTML = "";
  let fontStackOptions = Object.keys(GorillaPresenterFontStackOptions);
  for(let i = 0;i < fontStackOptions.length; i++){
    let fontStack = fontStackOptions[i];
    
    let value = GorillaPresenterFontStackOptions[fontStack];
    if(value === selectedFontStack){
      selectorHTML += "<option value='" + value + "' selected>" + fontStack + "</option>";
    } else {
      selectorHTML += "<option value='" + fontStack + "'>" + fontStack + "</option>";
    }
  }
  return selectorHTML;
}
GorillaPresenter.setHeadingFontStack = function(fontStack){
  GorillaPresenter.config.headingFontStack = fontStack;
  GorillaPresenter.setFontStacks();
}
GorillaPresenter.setBodyFontStack = function(fontStack){
  GorillaPresenter.config.bodyFontStack = fontStack;
  GorillaPresenter.setFontStacks();
}
GorillaPresenter.setCodeFontStack = function(fontStack){
  GorillaPresenter.config.codeFontStack = fontStack;
  GorillaPresenter.setFontStacks();
}

GorillaPresenter.headingFontStackSelected = function(value){
    GorillaPresenter.setHeadingFontStack(GorillaPresenterFontStackOptions[value]);
  }
  GorillaPresenter.bodyFontStackSelected = function(value){
    GorillaPresenter.setBodyFontStack(GorillaPresenterFontStackOptions[value]);
  }
  GorillaPresenter.codeFontStackSelected = function(value){
    GorillaPresenter.setCodeFontStack(GorillaPresenterFontStackOptions[value]);
  }

  GorillaPresenter.renderFontStackSelectors = function(mainMenu){
    headingFontItem = document.createElement("div");
    headingFontItem.className = "gorilla-presenter-main-menu-item link";
    headingFontItem.innerHTML = "<span class='translatable'>Heading</span>: <select title='Heading Font' id='gorilla-presenter-heading-font-stack-selector' onchange='GorillaPresenter.headingFontStackSelected(this.value)'></select></div>";
    mainMenu.appendChild(headingFontItem);
    let bodyFontItem = document.createElement("div");
    bodyFontItem.className = "gorilla-presenter-main-menu-item link";
    bodyFontItem.innerHTML = "<span class='translatable'>Body</span>: <select title='Body Font Stack' id='gorilla-presenter-body-font-stack-selector' onchange='GorillaPresenter.bodyFontStackSelected(this.value)'></select></div>";
    mainMenu.appendChild(bodyFontItem);
    let codeFontItem = document.createElement("div");
    codeFontItem.className = "gorilla-presenter-main-menu-item link";
    codeFontItem.innerHTML = "<span class='translatable'>Code</span>: <select title='Code Font Stack' id='gorilla-presenter-code-font-stack-selector' onchange='GorillaPresenter.codeFontStackSelected(this.value)'></select></div>";
    mainMenu.appendChild(codeFontItem);
    document.getElementById("gorilla-presenter-heading-font-stack-selector").innerHTML = GorillaPresenter.renderFontStackSelector(GorillaPresenter.config.headingFontStack);
    document.getElementById("gorilla-presenter-body-font-stack-selector").innerHTML = GorillaPresenter.renderFontStackSelector(GorillaPresenter.config.bodyFontStack);
    document.getElementById("gorilla-presenter-code-font-stack-selector").innerHTML = GorillaPresenter.renderFontStackSelector(GorillaPresenter.config.codeFontStack);
  }