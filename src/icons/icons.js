GorillaPresenter.setupIcons = function(){
    GorillaPresenter.setHeadLink("icon",BrowserFileSystem.readInternalFileDataURL("icons/favicon.ico"),"image/x-icon");
      GorillaPresenter.setHeadLink("icon",BrowserFileSystem.readInternalFileDataURL("icons/favicon-192x192.png"),"image/png");
      GorillaPresenter.setHeadLink("apple-touch-icon",BrowserFileSystem.readInternalFileDataURL("icons/apple-touch-icon-180x180.png"),"image/png");
}

GorillaPresenter.setHeadLink =  function(tagValue, dataURI,dataMimeType) {
    if (typeof tagValue !== 'string'){
      throw new TypeError('tagvalue: string expected');
    }
    if (typeof dataURI !== 'string'){
      throw new TypeError('dataURI: string expected');
    }
    if (typeof dataMimeType !== 'string'){
      throw new TypeError('dataMimeType: string expected');
    }
    let head = document.getElementsByTagName('head')[0];
    let newElement = document.createElement('link');
    newElement.type = dataMimeType;
    newElement.rel = tagValue;
    newElement.href = dataURI;
    head.appendChild(newElement);
  }