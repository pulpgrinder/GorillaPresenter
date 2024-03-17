GorillaPresenter.startup = function() {
    GorillaPresenter.sicTransit =  new SicTransit("#" + GorillaPresenter.slideRoot,GorillaPresenter.slideSelector);
    GorillaPresenter.sicTransit.setParameter("callback",GorillaPresenter.transitionDone,"*");
    GorillaPresenter.markdown =  window.markdownit({html:true,xhtmlOut:true,typographer:true});
    GorillaPresenter.loadPresentationData();
    let aboutElement = document.getElementById("gorilla-presenter-about");
    aboutElement.innerHTML = aboutElement.innerHTML + GorillaPresenter.markdown.render( BrowserFileSystem.collectLicenses());
    GorillaPresenter.renderPresentationData();
    GorillaPresenter.showHomeScreen();
    GorillaPresenter.touchStartTimer = GorillaPresenter.touchEndTimer =  GorillaPresenter.clickTimer = null;
      GorillaPresenter.setMenuHandlers(document.body);
}