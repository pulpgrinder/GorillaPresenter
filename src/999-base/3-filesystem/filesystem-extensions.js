// filesystem-extensions.js
// Copyright 2019-2024 by Anthony W. Hursh
// MIT License.

let BrowserFileSystem = {
}

BrowserFileSystem.file_extension = function(filename){
  let end = filename.lastIndexOf('.');
  if(end < 0){
    return "";
  }
  return filename.substring  (end + 1);
}

BrowserFileSystem.file_basename = function(filename){
  return filename.substring(filename.lastIndexOf('/') + 1);
}

BrowserFileSystem.file_path = function(filename){
  let end = filename.lastIndexOf("/")
  return filename.substring(0,end);
}

BrowserFileSystem.file_basename_no_extension = function(filename){
  let start = filename.lastIndexOf('/');
  if(start < 0){
    start = 0;
  }
  else{
    start = start + 1;
  }
  let end = filename.lastIndexOf('.');
  if(end < 0){
    end = filename.length;
  }
  return filename.substring(start,end);
}


BrowserFileSystem.file_path_no_extension = function(filename){
  let end = filename.lastIndexOf('.');
  if(end < 0){
    end = filename.length;
  }
  return filename.substring(0,end);
}


BrowserFileSystem.collectLicenses = function(){
  let filenames = Object.keys(BrowserFileSystem_fs);
  let license_text = BrowserFileSystem.readInternalTextFile("1-root/LICENSE-GorillaPresenter.md") + "\n\n"
  for(var i = 0; i < filenames.length; i++){
    if((filenames[i].match(/LICENSE/) !== null) && (filenames[i] !== "1-root/LICENSE-GorillaPresenter.md")){
      let packagename = filenames[i].substring(0,filenames[i].indexOf["/"])
      license_text = license_text + "<h2>" + packagename + " </h2>\n\n" + BrowserFileSystem.readInternalTextFile(filenames[i]) + "\n\n"
    }
  }
  return license_text;

}

BrowserFileSystem.base_64_to_bytes = function(string_buffer){
  //let datastart = string_buffer.substring(string_buffer.indexOf(",") + 1);
  //let contentType = string_buffer.substring(11,string_buffer.indexOf(";"))
//  contentType = contentType || '';
  //var byteCharacters = atob(datastart);
  let byteCharacters = window.atob(string_buffer)
  let array = new Uint8Array(byteCharacters.length);
  for( var i = 0; i < byteCharacters.length; i++ ) { array[i] = byteCharacters.charCodeAt(i);
  }
  return array;
}

BrowserFileSystem.getInternalDir = function(basedir){
  let dirfiles = [];
  let filelist = Object.keys(BrowserFileSystem_fs).sort();
  for(var i = 0; i < filelist.length; i++){
    let key = filelist[i];
    if((basedir === "") || (key.match(RegExp("^" + GorillaPresenter.makeGlob(basedir))) !== null)){
        dirfiles.push(key);
    }
  }
  return dirfiles;
}

BrowserFileSystem.internalFileToBlob = function(filename) {
  let filetype = BrowserFileSystem.file_extension(filename);
  if(GorillaPresenter.mimeTypes[filetype] === undefined){
    filetype = "application/octet-stream";
  }
  if(BrowserFileSystem_fs[filename] !== undefined){
    let bytes = BrowserFileSystem.base_64_to_bytes(BrowserFileSystem_fs[filename]["data"]);
    var blob = new Blob([bytes], {type: mimetype});
  return blob;
  }
  console.error("BrowserFileSystem.internalFileToBlob: " + filename + " is not in internal filesystem");
  return false;
}

BrowserFileSystem.readInternalFileDataURL = function(filename){
  let filetype = BrowserFileSystem.file_extension(filename);
  if(GorillaPresenter.mimeTypes[filetype] === undefined){
    filetype = "application/octet-stream";
  }
  if(BrowserFileSystem_fs[filename] !== undefined){
    return 'data:' + mimetype + ';base64,' + BrowserFileSystem_fs[filename]["data"];
  }
  console.error("BrowserFileSystem.readInternalFileDataURL: " + filename + " is not in internal filesystem");
  return null;
}

BrowserFileSystem.getFileSystemJSON = function(){
  return JSON.stringify(BrowserFileSystem_fs);
}
BrowserFileSystem.getPackageJSON = function(package_prefix){
  let keys = Object.keys(BrowserFileSystem_fs);
  let package = {}
  for(var i = 0; i < keys.length; i++){
    if(keys[i].indexOf(package_prefix) === 0){
      package[keys[i]] = BrowserFileSystem_fs[keys[i]]
    }
  }
  package["version"] = GorillaPresenter.packageVersion;
  return JSON.stringify(package) + "\n";
}

BrowserFileSystem.deleteInternalFile = function(filename){
  if(BrowserFileSystem_fs[filename] !== undefined){
      delete BrowserFileSystem_fs[filename];
      return true;
  }
  else {
    console.error("BrowserFileSystem.deleteInternalFile: " + filename + " is not in internal filesystem");
    return false;
  }
}

BrowserFileSystem.dir = function(dirspec){
  let direntries = [];
  dirspec = dirspec.replace(/\./g,"\\.")
  dirspec = dirspec.replace(/\*/g,".*")
  let re = new RegExp(dirspec);
  let keys = Object.keys(BrowserFileSystem_fs);
  for(var i = 0; i < keys.length; i++){
    let key = keys[i];
    if(key.match(re) !== null){
      direntries.push(key)
    }
  }
  return direntries.sort();
}

BrowserFileSystem.collectTrash = function(){
    let trashed_files = [];
    let keys = Object.keys(BrowserFileSystem_fs);
    for(var i = 0; i < keys.length; i++){
      if(keys[i].indexOf("trash/") === 0){
        trashed_files.push(keys[i].replace(/^trash\//,""))
      }
    }
    return trashed_files;
}
BrowserFileSystem.emptyTrash = function(){
  let trashed_files = BrowserFileSystem.collectTrash();
  for(var i = 0; i < trashed_files.length; i++){
    BrowserFileSystem.deleteInternalFile("trash/" + trashed_files[i])
  }
}
BrowserFileSystem.trashInternalFile = function(filename){
  if(BrowserFileSystem_fs[filename] !== undefined){
      BrowserFileSystem_fs["trash/" + filename] = BrowserFileSystem_fs[filename]
      delete BrowserFileSystem_fs[filename];
      return true;
  }
  else {
    console.error("BrowserFileSystem.trashInternalFile: " + filename + " is not in internal filesystem");
    return false;
  }
}

BrowserFileSystem.unTrashInternalFile = function(filename){
  let trashname = "trash/" + filename;
  if(BrowserFileSystem_fs[trashname] !== undefined){
      BrowserFileSystem_fs[filename] = BrowserFileSystem_fs[trashname]
      delete BrowserFileSystem_fs[trashname];
      return true;
  }
  else {
    console.error("BrowserFileSystem.unTrashInternalFile: " + filename + " is not in the trash");
    return false;
  }
}
BrowserFileSystem.readInternalFile = function(filename){
  if(BrowserFileSystem_fs[filename] !== undefined){
      return BrowserFileSystem.base_64_to_bytes(BrowserFileSystem_fs[filename]["data"]);
  }
  console.error("BrowserFileSystem.readInternalFile: " + filename + " is not in internal filesystem");
  return null;
}

BrowserFileSystem.dataToDataURL = function(data,mimetype){
  let base64data = GorillaPresenter.bytes_to_base_64(new TextEncoder("utf-8").encode(data))
  return 'data:' + mimetype + ';base64,' + base64data;
}

BrowserFileSystem.dataURLToData = function(dataURI){
  let base64Index = dataURI.indexOf(';base64,') + 8;
  let base64 = dataURI.substring(base64Index);
  let raw = window.atob(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));
  let i;
  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
BrowserFileSystem.writeDataURLToInternalFile = function(filename,data){
  let base64offset = data.indexOf("base64,");
  data = data.substring(base64offset + 7);
  BrowserFileSystem_fs[filename] = {}
  BrowserFileSystem_fs[filename]["data"] = data;
  BrowserFileSystem_fs[filename]["timestamp"] = Date.now();
  return true;
}
BrowserFileSystem.getFileTimeStamp = function(filename){
  if(BrowserFileSystem_fs[filename] === undefined){
    return false;
  }
  return parseInt(BrowserFileSystem_fs[filename]["timestamp"])
}
BrowserFileSystem.writeInternalFile = function(filename,data){
  BrowserFileSystem.writeRawInternalFile(filename,  GorillaPresenter.bytes_to_base_64(data));
}
BrowserFileSystem.writeRawInternalFile = function(filename,data){
  let filetype = BrowserFileSystem.file_extension(filename);
  if(BrowserFileSystem_fs[filename] === undefined){
    BrowserFileSystem_fs[filename] = {}
  }
  BrowserFileSystem_fs[filename]["data"] = data;
  BrowserFileSystem_fs[filename]["timestamp"] = Date.now();
  return true;
}

BrowserFileSystem.readInternalTextFile = function(filename){
    return new TextDecoder("utf-8").decode(BrowserFileSystem.readInternalFile(filename));
}
BrowserFileSystem.writeInternalTextFile = function(filename,data){
    let bindata = new TextEncoder("utf-8").encode(data)
    BrowserFileSystem.writeInternalFile(filename,bindata);
    return true;
}

BrowserFileSystem.getSortedFileNames = function(){
  return BrowserFileSystem.getUnsortedFileNames.sort();
}

BrowserFileSystem.getUnsortedFileNames = function(){
  let filetree = [];
  let filenames = Object.keys(BrowserFileSystem_fs);
  for(var i = 0; i < filenames.length; i++){
      let key = filenames[i];
      if(key.match(/.*\$\$.+\$\$$/) === null){
        filetree.push(key);
      }
    }
    return filetree;
}

BrowserFileSystem.fileExists = function(filename){
  if(BrowserFileSystem_fs[filename] !== undefined){
    return true;
  }
  return false;
}

BrowserFileSystem.file_rename = function (oldname,newname){
  if(BrowserFileSystem_fs[newname] !== undefined){
    console.error("Can't rename " + oldname + " to " + newname +  ". " + newname + " exists.")
    return false;
  }
  if(BrowserFileSystem_fs[oldname] === undefined){
    console.error("Can't rename " + oldname + " to " + newname + ". " + oldname + " does not exist.")
    return false;
  }
  BrowserFileSystem_fs[newname] = BrowserFileSystem_fs[oldname];
  delete BrowserFileSystem_fs[oldname];
  return true;
}

BrowserFileSystem.folder_rename = function (oldfolder,newfolder){
  let filenames = Object.keys(BrowserFileSystem_fs);
  for(var i = 0; i < filenames.length; i++){
    let current_name = filenames[i];
    if(current_name.match(new RegExp('^' + GorillaPresenter.escapeRegExp(oldfolder + '/'))) !== null){
      let newname = current_name.replace(oldfolder,newfolder);
      BrowserFileSystem_fs[newname] = BrowserFileSystem_fs[current_name];
      delete BrowserFileSystem_fs[current_name]
    }
  }
}

BrowserFileSystem.packageVector = function(){
  let packageHash = {}
  let files = Object.keys(BrowserFileSystem_fs)
  for(var i = 0; i < files.length; i++){
    let packageIndex = files[i].indexOf("/");
    if(packageIndex > 0){
      packageHash[files[i].substring(0,packageIndex)] = true;
    }
  }
  return Object.keys(packageHash).sort(naturalSort({"direction":false,"caseSensitive":false}));
}

BrowserFileSystem.deletePackage = function(packagename){
  let files = Object.keys(BrowserFileSystem_fs)
  for(var i = 0; i < files.length; i++){
    if(files[i].indexOf(packagename) === 0){
      delete BrowserFileSystem_fs[files[i]];
    }
  }
}