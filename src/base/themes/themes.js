GorillaPresenter.themes  = {};

GorillaPresenter.loadThemes = function(){
  if(BrowserFileSystem.fileExists("userdata/themes.vss") === false){
    GorillaPresenter.error("Themes are missing! Cannot proceed without a theme!");
    GorillaPresenter.themeData = "";
    return;
  }
  else {
    GorillaPresenter.themeData = BrowserFileSystem.readInternalTextFile("userdata/themes.vss");
  }
}

GorillaPresenter.setTheme = function(){
    let themeData = GorillaPresenter.themes[GorillaPresenter.config.themeName];
    if(themeData === undefined){
        console.error("Theme not found. Using Default");
        themeData = GorillaPresenter.themes["Default"];
        GorillaPresenter.config.themeName = "Default";
    }
    if(document.getElementById("gorilla-presenter-theme")){
        document.getElementById("gorilla-presenter-theme").remove();
    }
    let styleElement = document.createElement('style');
    styleElement.innerHTML = themeData;
    styleElement.id = "gorilla-presenter-theme";
    document.head.appendChild(styleElement);
    GorillaPresenter.setFontStacks();
}

GorillaPresenter.renderThemes = function(mainMenu){
  let themeContainer = document.createElement("div");
  themeContainer.innerHTML = "<span class='translatable'>Theme</span>: <select title='Theme Selector' id='gorilla-presenter-theme-selector' onchange='GorillaPresenter.themeSelected(this.value)'></select>";
  themeContainer.className = "gorilla-presenter-main-menu-item link";
  mainMenu.appendChild(themeContainer);
    let themeSelector = document.getElementById("gorilla-presenter-theme-selector");
    let themeChoices = ""
    let unnamedCounter = 1;
    let themeBlocks = GorillaPresenter.themeData.split(/^%%%/gm);
    themeBlocks.shift();
    for(let i=0;i< themeBlocks.length;i++){
      let themeBlock = themeBlocks[i];
      let themeLines = themeBlock.split("\n");
      let themeName = themeLines[0].replace(/^%%%/,"").trim();
      if(themeName === ""){
        themeName = "Unnamed Theme " + unnamedCounter;
        unnamedCounter++;
      }
      themeLines.shift();
      GorillaPresenter.themes[themeName] = themeLines.join("\n");
    }
    let themeNames = Object.keys(GorillaPresenter.themes);
    themeNames.sort();
    if(GorillaPresenter.themes["Default"] !== undefined){
        themeChoices += "<option value='" + "Default" + "'>" + "Default" + "</option>";
    }
    for(let i=0;i<themeNames.length;i++){
      let themeName = themeNames[i];
      if(themeName === "Default"){
        continue;
      }
      if(themeName === GorillaPresenter.config.themeName){
          themeChoices += "<option value='" + themeName + "' selected>" + themeName + "</option>";
      }
      else {
        themeChoices += "<option value='" + themeName + "'>" + themeName + "</option>";
      }
    }
    themeSelector.innerHTML = themeChoices;
  }


  GorillaPresenter.themeSelected = function(theme){
    GorillaPresenter.config.themeName = theme.replace("'","&#39;");
    GorillaPresenter.saveConfig();
    GorillaPresenter.setTheme(theme);
  }