GorillaPresenter.fullScreen = false;


GorillaPresenter.showUIScreen = function(id){
    let screens = document.querySelectorAll(".gorilla-presenter-screen");
    for(let i=0;i<screens.length;i++){
      screens[i].style.display = "none";
    }
    let screen = document.getElementById(id);
    screen.style.display = "block";
    screen.focus();
}

GorillaPresenter.enterFullScreen = function(){
    let element = document.body;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitrequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
    GorillaPresenter.fullScreen = true;
  }

  GorillaPresenter.exitFullScreen = function(){
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    GorillaPresenter.fullScreen = false;
  }



  GorillaPresenter.warn = function(message,time=1000){
    let slideElement = document.getElementById(GorillaPresenter.slideRoot);
    const slideStyles = window.getComputedStyle(slideElement);
    let warningElement = document.getElementById("gorilla-presenter-warning-message");
    warningElement.innerHTML = message;
    warningElement.style.opacity = 0;
    warningElement.style.display = "block";
    let warningElementStyle = window.getComputedStyle(warningElement);
    let slideWidth = parseInt(slideStyles.width);
    let slideHeight = parseInt(slideStyles.height);
    let warningWidth = parseInt(warningElementStyle.width);
    let warningHeight = parseInt(warningElementStyle.height);
    let left = (slideWidth - warningWidth) / 2;
    let top = (slideHeight - warningHeight) / 2;
    warningElement.style.left = left + "px";
    warningElement.style.top = top + "px"; 
    
    fadeIn(warningElement);
    setTimeout(function(){
      fadeOut(warningElement);
    },time);
  }