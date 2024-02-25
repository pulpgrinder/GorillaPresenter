GuerrillaPresenter.setTheme = function(themename){
    let themePath = `999-base/themes/${themename}.csx`;
    if(GuerrillaPresenter.fileExists(themePath) == false){
        console.error("Theme " + themename + " not found. Using default instead.");
        themename = "default";
        themePath = `999-base/themes/default.csx`;
    }
    if(document.getElementById("guerrilla-presenter-theme")){
        document.getElementById("guerrilla-presenter-theme").remove();
    }
    let themeCSS = GuerrillaPresenter.readInternalTextFile(themePath);
    console.log("themeCSS is: " + themeCSS);
    let styleElement = document.createElement('style');
    styleElement.innerHTML = themeCSS;
    styleElement.id = "guerrilla-presenter-theme";
    document.head.appendChild(styleElement);
}

