ConfigHandler = {
  config: {
    currentLanguage:"en",
    theme:"Default",
    headingFontStack :"--didone-font-stack",
    bodyFontStack :"--humanist-font-stack",
    codeFontStack : "--monospace-code-font-stack",
    slidePosition:0,
    editorPosition: 0,
    slidesperpage: "6up",
    papersize: "letter",
    incorrectAnswer: "I'm sorry, that is incorrect.",
    correctAnswer: "Woohoo! That is correct!"
  },

  saveConfig: function(){
    ConfigHandler.config.currentLanguage = LanguageHandler.currentLanguage;
    ConfigHandler.config.theme = ThemeHandler.currentTheme;
    ConfigHandler.config.headingFontStack = ThemeHandler.headingFontStack;
    ConfigHandler.config.bodyFontStack = ThemeHandler.bodyFontStack;
    ConfigHandler.config.codeFontStack = ThemeHandler.codeFontStack;
    ConfigHandler.config.slidePosition = SlideHandler.slidePosition;
   // ConfigHandler.config.editorPosition = EditorHandler.editorPosition;
    ConfigHandler.config.slidesperpage = PrintHandler.slidesperpage;
    ConfigHandler.config.papersize = PrintHandler.papersize;
    ConfigHandler.config.incorrectAnswer = LogicHandler.incorrectAnswer;
    ConfigHandler.config.correctAnswer = LogicHandler.correctAnswer;
    BrowserFileSystem.writeInternalTextFile("userdata/config.json",JSON.stringify(ConfigHandler.config));
  },
  loadConfig:function(){
    if(BrowserFileSystem.fileExists("userdata/config.json") === false){
      console.log("No config file found. Using defaults.");
      ConfigHandler.saveConfig();
    }
    ConfigHandler.config = JSON.parse(BrowserFileSystem.readInternalTextFile("userdata/config.json"));
    LanguageHandler.currentLanguage = ConfigHandler.config.currentLanguage;
    ThemeHandler.currentTheme = ConfigHandler.config.theme;
    console.log("Setting theme to " + ThemeHandler.currentTheme);
    ThemeHandler.headingFontStack = ConfigHandler.config.headingFontStack;
    ThemeHandler.bodyFontStack = ConfigHandler.config.bodyFontStack;
    ThemeHandler.codeFontStack = ConfigHandler.config.codeFontStack;
    SlideHandler.slidePosition = ConfigHandler.config.slidePosition;
    //EditorHandler.editorPosition = ConfigHandler.config.editorPosition;
    PrintHandler.slidesperpage = ConfigHandler.config.slidesperpage;
    PrintHandler.papersize = ConfigHandler.config.papersize;
    LogicHandler.incorrectAnswer = ConfigHandler.config.incorrectAnswer;
    LogicHandler.correctAnswer = ConfigHandler.config.correctAnswer;
  }
}