GorillaPresenter.setTheme = function(themename){
   
    let themeData = GorillaPresenter.themes[themename];
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
    BrowserFileSystem.writeInternalTextFile("userdata/themename",themename);
}

GorillaPresenter.renderThemes = function(){
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
     // themeChoices += "<option value='" + themeName + "'>" + themeName + "</option>";
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
      let themeLines = GorillaPresenter.themes[themeName];
      themeChoices += "<option value='" + themeName + "'>" + themeName + "</option>";
    }


    themeSelector.innerHTML = themeChoices;
  }
  GorillaPresenter.themeSelected = function(theme){
    console.log("Theme Selector: " + theme);
    GorillaPresenter.setTheme(theme);
  }

