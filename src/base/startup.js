
function isInStandaloneMode() {
  return ('standalone' in window.navigator) && (window.navigator.standalone);
}



GorillaPresenter.checkMobileSafari = function() {
  GorillaPresenter.isMobileSafari =
    /iPhone|iPad|iPod/.test(navigator.userAgent) && 
    /Safari/.test(navigator.userAgent) && 
    !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent) &&
    'ontouchstart' in window 

}

GorillaPresenter.startup = function() {
    GorillaPresenter.checkMobileSafari();
    if(GorillaPresenter.isMobileSafari){
      alert("iOS");
    }
    GorillaPresenter.markdown =  window.markdownit({html:true,xhtmlOut:true,typographer:true});
    ConfigHandler.loadConfig();
    LanguageHandler.loadLanguageSelector();
    ThemeHandler.loadThemes();
    UIHandler.loadFontStackSelectors();
    SlideRenderer.init();
    SlideRenderer.renderSlides();
    UIHandler.wireUI(document.getElementById("slideroot"));
    UIHandler.wireAccessoryScreens();
    UIHandler.renderAbout();

  
}