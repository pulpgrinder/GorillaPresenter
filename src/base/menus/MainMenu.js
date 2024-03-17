GorillaPresenter.mainMenuVisible = false;
GorillaPresenter.onHomeScreen = false;

GorillaPresenter.renderMainMenu = function(){
    let mainMenu = document.getElementById("gorilla-presenter-main-menu");
    mainMenu.innerHTML = "";
    GorillaPresenter.renderThemes();
    let menuItems = ["Slide Show","Enter/Exit Full Screen","Slide Editor","Media Library","Save Presentation","Documentation","About"];
    for(let i = 0;i < menuItems.length; i++){
      let menuItem = document.createElement("div");
      menuItem.setAttribute("baselabel",menuItems[i]);
      menuItem.innerHTML = "<span class='translatable'>" + menuItems[i] + "</span>";
      menuItem.className = "gorilla-presenter-main-menu-item link";
      menuItem.onclick = GorillaPresenter.processMainMenuClick;
      mainMenu.appendChild(menuItem);
    }
    GorillaPresenter.renderLanguages();
    GorillaPresenter.renderFontStackSelectors();
    
  }


  GorillaPresenter.setMenuHandlers = function(element){
    element.addEventListener('keydown', function(event) {
      const isCmdOrCtrl = event.ctrlKey || event.metaKey;
      if (isCmdOrCtrl && event.key.toLowerCase() === 'e') {
        if(GorillaPresenter.mainMenuVisible === false){
            GorillaPresenter.showMainMenu(event);
        }
        else{
          GorillaPresenter.hideMainMenu(event);
        }
        return;
      }
      GorillaPresenter.hideMainMenu(event);
      if(GorillaPresenter.onHomeScreen === false){
        return;
      }
      // Try to handle any keys that someone might try to use to navigate the slides.
      if(event.key === "ArrowRight"){
          GorillaPresenter.slideForward();
          return;
      }
      if(event.key === "ArrowLeft"){
          GorillaPresenter.slideBack();
          return;
      }
      if(event.key === "ArrowDown"){
        GorillaPresenter.slideForward();
        return;
    }
    if(event.key === "ArrowUp"){
        GorillaPresenter.slideBack();
        return;
    }
      if(event.key === "PageDown"){
        GorillaPresenter.slideForward();
        return;
    }
    if(event.key === "PageUp"){
        GorillaPresenter.slideBack();
        return;
    }
    if(event.key === "Enter"){
      GorillaPresenter.slideForward();
      return;
    }
    if(event.key === "Backspace"){
      GorillaPresenter.slideBack();
      return;
    }
    if(event.code === "Space"){
      GorillaPresenter.slideForward();
      return;
    }
    // In case a desperate user tries to escape full screen mode. :-)
    if(event.code === "Escape"){
      if(GorillaPresenter.mainMenuVisible === true){
        GorillaPresenter.hideMainMenu(event);
        return;
      }
      if(GorillaPresenter.fullScreen === true){
        GorillaPresenter.exitFullScreen();
        return;
      }
    }
    return;
  });

  // Long press detection for touch devices
  element.addEventListener('touchstart', function(event) {
      GorillaPresenter.touchStartX = event.touches[0].clientX;
      GorillaPresenter.touchStartTimer = setTimeout(function() {
          if(GorillaPresenter.mainMenuVisible === false){
            GorillaPresenter.showMainMenu(event);
          }
          else{
            GorillaPresenter.hideMainMenu(event);
          }
      }, 500);
  });
    element.addEventListener('touchend', function(event) {
        clearTimeout(GorillaPresenter.touchStartTimer);
          GorillaPresenter.touchStartTimer = null;
          const touchEndX = event.changedTouches[0].clientX;
          const touchStartX = GorillaPresenter.touchStartX;
          const touchThreshold = 50;
          if (touchEndX - touchStartX > touchThreshold) {
          GorillaPresenter.slideBack();
          } else if (touchStartX - touchEndX > touchThreshold) {
          GorillaPresenter.slideForward();
          }
    });
    element.addEventListener('touchmove', function(event) {
        clearTimeout(GorillaPresenter.touchStartTimer);
        GorillaPresenter.touchStartTimer = null;
    });
    
    element.addEventListener('mousedown', function(event) {
      if (GorillaPresenter.mainMenuVisible === true && !event.target.closest("#gorilla-presenter-main-menu")) {
        GorillaPresenter.hideMainMenu(event);
        return;
      }
      GorillaPresenter.isLongClick = false;
      GorillaPresenter.clickTimer = setTimeout(function() {
          GorillaPresenter.isLongClick = true;
          if(GorillaPresenter.mainMenuVisible === false) {
              GorillaPresenter.showMainMenu(event);
          }
          else {
              GorillaPresenter.hideMainMenu(event);
          }
      }, 1000);
  });
  
  element.addEventListener('mouseup', function(event) {
      clearTimeout(GorillaPresenter.clickTimer);
      if (!GorillaPresenter.isLongClick) {
          // It was a short click, advance to the next slide
          if (event.target.id === "gorilla-presenter-slideroot" || event.target.closest("#gorilla-presenter-slideroot")) {
            GorillaPresenter.slideForward();
          }
      }
      GorillaPresenter.clickTimer = null;
  });
  
  element.addEventListener('mouseleave', function(event) {
      clearTimeout(GorillaPresenter.clickTimer);
      GorillaPresenter.clickTimer = null;
  });   

}

GorillaPresenter.processMainMenuClick = function(event){
  let target = event.target;
  let label = GorillaPresenter.findAttributeInAncestors(target,"baselabel");
  if(label === null){
    return;
  }
  switch(label){
    case "Slide Show":GorillaPresenter.showHomeScreen();break;
    case "Enter/Exit Full Screen":if(GorillaPresenter.fullScreen === true){
         GorillaPresenter.exitFullScreen()
        }
        else{
          GorillaPresenter.enterFullScreen();
        }break;
    case "Slide Editor":GorillaPresenter.showSlideEditor();break;
    case "Media Library":GorillaPresenter.showMediaLibrary();break;
    case "Save Presentation":GorillaPresenter.downloadSlides();break;
    case "Documentation":GorillaPresenter.showDocumentation();break;
    case "About":GorillaPresenter.showAbout();break;
  }
  GorillaPresenter.hideMainMenu();
},

GorillaPresenter.showSlideEditor = function(){
  GorillaPresenter.saveEditorCursors();
  GorillaPresenter.showUIScreen("gorilla-presenter-slide-editor-container");
  GorillaPresenter.onHomeScreen = false;
  let slideEditor = document.getElementById("gorilla-presenter-slide-text-editor");
  slideEditor.value = GorillaPresenter.slideData;
  slideEditor.focus();
  slideEditor.setSelectionRange(GorillaPresenter.slideEditorPosition, GorillaPresenter.slideEditorPosition);
}


GorillaPresenter.showMediaLibrary = function(){
  GorillaPresenter.showUIScreen("gorilla-presenter-media-library-container");
  let mediaLibrary = document.getElementById("gorilla-presenter-media-library");
  mediaLibrary.focus();
  GorillaPresenter.onHomeScreen = false;
}

GorillaPresenter.showHomeScreen = function(){
  GorillaPresenter.showUIScreen("gorilla-presenter-slideroot");
  GorillaPresenter.updateEditorData();
  GorillaPresenter.displaySlide("cutIn");
  GorillaPresenter.onHomeScreen = true;
}

GorillaPresenter.showAbout = function(){
  GorillaPresenter.showUIScreen("gorilla-presenter-about-container");
  GorillaPresenter.onHomeScreen = false;
}



GorillaPresenter.showMainMenu = function(event){
  GorillaPresenter.renderMainMenu();
  GorillaPresenter.mainMenuVisible = true;
  GorillaPresenter.saveEditorCursors();
  let slideElement = document.getElementById(GorillaPresenter.slideRoot);
  const slideStyles = window.getComputedStyle(slideElement);
  let mainMenu = document.getElementById("gorilla-presenter-main-menu");
  mainMenu.style.opacity = 1;
  mainMenu.style.display = "block";
  let mainMenuStyle = window.getComputedStyle(mainMenu);
  let slideWidth = parseInt(slideStyles.width);
  let slideHeight = parseInt(slideStyles.height);
  let menuWidth = parseInt(mainMenuStyle.width);
  let menuHeight = parseInt(mainMenuStyle.height);
  let left = (slideWidth - menuWidth) / 2;
  let top = (slideHeight - menuHeight) / 2;
  mainMenu.style.left = left + "px";
  mainMenu.style.top = top + "px";
}

GorillaPresenter.hideMainMenu = function(event){
  let mainMenu = document.getElementById("gorilla-presenter-main-menu");
  mainMenu.style.display = "none";
  GorillaPresenter.mainMenuVisible = false;
}
