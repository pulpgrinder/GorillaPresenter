let ThemeHandler = {
  themes: {},
  currentTheme: "Default",
  headingFontStack: "--didone-font-stack",
  bodyFontStack: "--humanist-font-stack",
  codeFontStack: "--monospace-code-font-stack",
  themeData: "",
  loadThemes: function () {
    if (BrowserFileSystem.fileExists("userdata/themevars.vss") === false) {
      UIHandler.error("Themes are missing! Cannot proceed without a theme!");
      ThemeHandler.themeData = "";
      return;
    }
    else {
      ThemeHandler.themeData = BrowserFileSystem.readInternalTextFile("userdata/themevars.vss");
    }
    ThemeHandler.renderThemes();
    ThemeHandler.setTheme();
  },

  setTheme: function () {
    let themeData = ThemeHandler.themes[ThemeHandler.currentTheme];
    if (themeData === undefined) {
      console.error("Theme not found. Using Default");
      themeData = ThemeHandler.themes["Default"];
      ConfigHandler.config.Theme = "Default";
    }
    let styleElement = document.getElementById("theme");
    if (styleElement !== null) {
      styleElement.remove();
    }
    styleElement = document.createElement('style');
    styleElement.innerHTML = themeData;
    styleElement.id = "theme";
    document.head.appendChild(styleElement);
  },

  renderThemes: function () {
    let themeSelector = document.getElementById("theme-selector");
    themeSelector.innerHTML = "";
    let themeChoices = ""
    let unnamedCounter = 1;
    let themeBlocks = ThemeHandler.themeData.split(/^%%%/gm);
    themeBlocks.shift();
    for (let i = 0; i < themeBlocks.length; i++) {
      let themeBlock = themeBlocks[i];
      let themeLines = themeBlock.split("\n");
      let themeName = themeLines[0].replace(/^%%%/, "").trim();
      if (themeName === "") {
        themeName = "Unnamed Theme " + unnamedCounter;
        unnamedCounter++;
      }
      themeLines.shift();
      ThemeHandler.themes[themeName] = themeLines.join("\n");
    }
    let themeNames = Object.keys(ThemeHandler.themes);
    themeNames.sort();
    for (let i = 0; i < themeNames.length; i++) {
      let themeName = themeNames[i];
      if (themeName === ThemeHandler.currentTheme) {
        themeChoices += "<option value='" + themeName + "' selected>" + themeName + "</option>";
      }
      else {
        themeChoices += "<option value='" + themeName + "'>" + themeName + "</option>";
      }
    }
    themeSelector.innerHTML = themeChoices;
  },
  themeSelected: function (themeName) {
    ThemeHandler.currentTheme = themeName;
    ConfigHandler.config.Theme = themeName;
    ThemeHandler.setTheme();
    ConfigHandler.saveConfig();
  },
}