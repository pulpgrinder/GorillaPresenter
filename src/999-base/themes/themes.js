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
  }

