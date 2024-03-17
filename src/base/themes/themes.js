GorillaPresenter.themes  = {};
GorillaPresenter.themeName = "Default";


GorillaPresenter.loadThemes = function(){
  if(BrowserFileSystem.fileExists("userdata/themes.csx") === false){
    alert("Themes are missing! Cannot proceed without a theme!");
    GorillaPresenter.themeData = "";
    return;
  }
  else {
    GorillaPresenter.themeData = BrowserFileSystem.readInternalTextFile("userdata/themes.csx");
  }
  if(BrowserFileSystem.fileExists("userdata/themename") === false){
    BrowserFileSystem.writeInternalTextFile("userdata/themename","Default");
  }
  let themename = BrowserFileSystem.readInternalTextFile("userdata/themename");
  GorillaPresenter.themeName = themename;
  GorillaPresenter.setTheme();
}

GorillaPresenter.saveThemes = function(){
  BrowserFileSystem.writeInternalTextFile("userdata/themes.csx",GorillaPresenter.themeData);
  BrowserFileSystem.writeInternalTextFile("userdata/themename",GorillaPresenter.themeName);
}

GorillaPresenter.setTheme = function(){
    let themeData = GorillaPresenter.themes[GorillaPresenter.themeName];
    console.log("themeData is: " + themeData);
    if(themeData === undefined){
        console.log("Theme not found., using Default");
        themeData = GorillaPresenter.themes["Default"];
    }
    if(document.getElementById("gorilla-presenter-theme")){
        document.getElementById("gorilla-presenter-theme").remove();
    }
    let styleElement = document.createElement('style');
    styleElement.innerHTML = themeData;
    styleElement.id = "gorilla-presenter-theme";
    document.head.appendChild(styleElement);
    BrowserFileSystem.writeInternalTextFile("userdata/themename",GorillaPresenter.themeName);
}

GorillaPresenter.renderThemes = function(){
  let mainMenu = document.getElementById("gorilla-presenter-main-menu");
  let themeItem = document.createElement("div");
  themeItem.innerHTML = "<span class='translatable'>Theme</span>: <select title='Theme Selector' id='gorilla-presenter-theme-selector' onchange='GorillaPresenter.themeSelected(this.value)'></select>";
  themeItem.className = "gorilla-presenter-main-menu-item link";
  mainMenu.appendChild(themeItem);
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
      if(themeName === GorillaPresenter.themeName){
          themeChoices += "<option value='" + themeName + "' selected>" + themeName + "</option>";
      }
      else {
        themeChoices += "<option value='" + themeName + "'>" + themeName + "</option>";
      }
    }
    themeSelector.innerHTML = themeChoices;
  }


  GorillaPresenter.themeSelected = function(theme){
    console.log("New Theme: " + theme);
    GorillaPresenter.themeName = theme;
    GorillaPresenter.setTheme(theme);
  }