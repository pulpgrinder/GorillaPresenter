GorillaPresenter.uploadMediaFile = function(){
    BrowserFileSystem.uploadFile('.jpg,.gif,.png,.svg',false,'data',GorillaPresenter.mediaFileUploaded)
}

GorillaPresenter.mediaFileUploaded = function(filename,data){
    let basename = BrowserFileSystem.file_basename_no_extension(filename);
    let filepath = "userdata/media/" + filename;
    if(BrowserFileSystem.fs[filepath] === undefined){
        BrowserFileSystem.fs[filepath] = {}
      }
    BrowserFileSystem.fs[filepath]["data"] = data;
    BrowserFileSystem.fs[filepath]["timestamp"] = Date.now();
    let infoname = "userdata/media/" + basename + ".info";
    BrowserFileSystem.writeInternalTextFile(infoname,filepath);
    setTimeout(function(){
        GorillaPresenter.showMediaLibrary();
      },50);

}


