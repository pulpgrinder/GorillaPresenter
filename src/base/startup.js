GorillaPresenter.startup = function() {
    GorillaPresenter.loadConfig();
    GorillaPresenter.loadThemes();
    GorillaPresenter.loadSlides();
    GorillaPresenter.initSlideEditor();
    GorillaPresenter.sicTransit =  new SicTransit("#" + GorillaPresenter.slideRoot,GorillaPresenter.slideSelector);
    GorillaPresenter.sicTransit.setParameter("callback",GorillaPresenter.transitionDone,"*");
    GorillaPresenter.markdown =  window.markdownit({html:true,xhtmlOut:true,typographer:true});
    let aboutElement = document.getElementById("gorilla-presenter-about");
    aboutElement.innerHTML = aboutElement.innerHTML + GorillaPresenter.markdown.render( BrowserFileSystem.collectLicenses());
    GorillaPresenter.renderPresentationData();
    GorillaPresenter.renderMainMenu();
    GorillaPresenter.renderPrinterDialog();
    GorillaPresenter.showHomeScreen();
    GorillaPresenter.setTheme();
    GorillaPresenter.touchStartTimer = GorillaPresenter.touchEndTimer =  GorillaPresenter.clickTimer = null;
      GorillaPresenter.setMenuHandlers(document.body);
}