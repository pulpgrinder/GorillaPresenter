
let UIHandler = {
    fontStackOptions: {
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
    },
    headingFontStack: "--didone-font-stack",
    bodyFontStack: "--humanist-font-stack",
    codeFontStack: "--monospace-code-font-stack",
    headingFontStackSelected: function(fontStack){
        UIHandler.headingFontStack = UIHandler.fontStackOptions[fontStack];
        UIHandler.setFontStacks();
    },
    bodyFontStackSelected: function(fontStack){
        UIHandler.bodyFontStack = UIHandler.fontStackOptions[fontStack];
        UIHandler.setFontStacks();
    },
    codeFontStackSelected: function(fontStack){
        UIHandler.codeFontStack = UIHandler.fontStackOptions[fontStack];
        UIHandler.setFontStacks();
    },
    setFontStacks: function(){
        if(document.getElementById("ui-font-stack")){
            document.getElementById("ui-font-stack").remove();
          }
            let styleElement = document.createElement('style');
            styleElement.id = "ui-font-stack";
            styleElement.innerHTML = ":root {\n--slide-heading-font-stack: var(" + UIHandler.headingFontStack + ");\n--slide-body-font-stack: var(" + UIHandler.bodyFontStack + ");\n--slide-code-font-stack:var(" + UIHandler.codeFontStack + ");}\n";
            document.head.appendChild(styleElement);
            ConfigHandler.saveConfig();
    },
    loadFontStackSelectors: function(){
        let headingFontStackSelector = document.getElementById("heading-font-stack-selector");
        let bodyFontStackSelector = document.getElementById("body-font-stack-selector");
        let codeFontStackSelector = document.getElementById("code-font-stack-selector");
        let fontStacks = Object.keys(UIHandler.fontStackOptions);
        fontStacks.sort();
        for(let i = 0; i < fontStacks.length; i++){
            let fontStack = fontStacks[i];
            let option = document.createElement("option");
            option.value = UIHandler.fontStackOptions[fontStack];
            option.text = fontStack;
            if(option.value  === UIHandler.headingFontStack){
                option.selected = true;
              }
            headingFontStackSelector.add(option);
            option = document.createElement("option");
            option.value = UIHandler.fontStackOptions[fontStack];
            option.text = fontStack;
            if(option.value  === UIHandler.bodyFontStack){
                option.selected = true;
              }
            bodyFontStackSelector.add(option);
            option = document.createElement("option");
            option.value = UIHandler.fontStackOptions[fontStack];
            option.text = fontStack;
            if(option.value  === UIHandler.codeFontStack){
                option.selected = true;
              }
            codeFontStackSelector.add(option);
        }
    },

    warn: function(message){
        alert(message);
    },
    error: function(message){
        alert(message);
    },
    notify: function(message){
        alert(message);
    },
}