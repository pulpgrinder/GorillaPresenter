GuerrillaPresenter.setTheme = function(themename){
   
    let themeData = GuerrillaPresenter.themes[themename];
    console.log("themeData is: " + themeData);
    if(themeData === undefined){
        console.log("Theme not found., using Default");
        themeData = GuerrillaPresenter.themes["Default"];
    }
    if(document.getElementById("guerrilla-presenter-theme")){
        document.getElementById("guerrilla-presenter-theme").remove();
    }
    let styleElement = document.createElement('style');
    styleElement.innerHTML = themeData;
    styleElement.id = "guerrilla-presenter-theme";
    document.head.appendChild(styleElement);
    BrowserFileSystem.writeInternalTextFile("userdata/themename",themename);
}

GuerrillaPresenter.renderThemes = function(){
    let unnamedCounter = 1;
    let themeBlocks = GuerrillaPresenter.themeData.split(/^%%%/gm);
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
      GuerrillaPresenter.themes[themeName] = themeLines.join("\n");
    }
  }

