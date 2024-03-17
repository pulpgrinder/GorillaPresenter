GorillaPresenter.loadPresentationData = function(){
    GorillaPresenter.loadThemes();
    GorillaPresenter.loadLanguage();
    GorillaPresenter.loadFontStacks();
    GorillaPresenter.loadSlides();

  }


  GorillaPresenter.savePresentationData = function(){
    GorillaPresenter.saveSlides();
    GorillaPresenter.saveThemes();
    GorillaPresenter.saveLanguage();
    GorillaPresenter.saveFontStacks();

  }

  GorillaPresenter.renderPresentationData = function(){
    GorillaPresenter.renderLanguages();
    GorillaPresenter.renderFontStackSelectors();
    GorillaPresenter.renderSlides();
    }
