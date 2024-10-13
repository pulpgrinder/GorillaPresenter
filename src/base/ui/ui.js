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
  GorillaPresenter.messageCanceled = false;
  
  GorillaPresenter.fadeOut = function(element) {
    let opacity = 1;
    function decrease() {
        opacity -= 0.02;
        if (opacity <= 0){
            // complete
            element.style.opacity = 0;
            element.style.display = "none";
            return true;
        }
        element.style.opacity = opacity;
        requestAnimationFrame(decrease);
    }
    decrease();
}
GorillaPresenter.fadeIn = function(element) {
    let opacity = 0;
    element.style.opacity =  0;
    element.style.display = "block";
    function increase() {
        opacity += 0.02;
        if (opacity >= 1){
            // complete
            element.style.opacity = 1;
            return true;
        }
        element.style.opacity = opacity;
        requestAnimationFrame(increase);
    }
    increase();
}


  GorillaPresenter.displayMessage= function(element,message,time=1500){
    element.innerHTML = message;
    element.style.opacity = 1;
    element.style.display = "block";
   GorillaPresenter.centerElement(element);
    GorillaPresenter.fadeIn(element);
    setTimeout(function(){
      GorillaPresenter.fadeOut(element);
    },time);
  }

  GorillaPresenter.warn = function(message,time=1500){
     let warningElement = document.getElementById("gorilla-presenter-warning-message");
     GorillaPresenter.displayMessage(warningElement,message);
  }

  GorillaPresenter.notify = function(message,time=1500){
    let notificationElement = document.getElementById("gorilla-presenter-notification-message");
    GorillaPresenter.displayMessage(notificationElement,message);
  }

  GorillaPresenter.error = function(message,time=1500){
    let errorElement = document.getElementById("gorilla-presenter-error-message");
    GorillaPresenter.displayMessage(errorElement,message);
  }

  GorillaPresenter.centerElement = function(element){
    let slideElement = document.getElementById(GorillaPresenter.slideRoot);
    const slideStyles = window.getComputedStyle(slideElement);
    let elementStyle = window.getComputedStyle(element);
    let slideWidth = parseInt(slideStyles.width);
    let slideHeight = parseInt(slideStyles.height);
    let elementWidth = parseInt(elementStyle.width);
    let maxElementWidth = parseInt(elementStyle.maxWidth);
    let actualElementWidth = (elementWidth > maxElementWidth) ? maxElementWidth : elementWidth;
    let elementHeight = parseInt(elementStyle.height);
    let left = (slideWidth - actualElementWidth) / 2;
    let top = (slideHeight - elementHeight) / 2;
    if(top < 0){
      top = 0;
    }
    element.style.left = left + "px";
    element.style.top = top + "px"; 
  }

  