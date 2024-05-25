GorillaPresenter.uploadMediaFile = function(){
    BrowserFileSystem.uploadFile('.jpg,.gif,.png,.svg',false,'data',GorillaPresenter.mediaFileUploaded)
}

GorillaPresenter.mediaFileUploaded = function(filename,data){
    console.log("mediaFileUploaded: filename is " + filename);
    let basename = BrowserFileSystem.file_basename_no_extension(filename);
    let filepath = "userdata/media/" + filename;
    BrowserFileSystem.writeInternalFile(filepath,data);
    let infoname = "userdata/media/" + basename + ".info";
    BrowserFileSystem.writeInternalTextFile(infoname,filepath);
    setTimeout(function(){
        GorillaPresenter.showMediaLibrary();
      },50);

}


