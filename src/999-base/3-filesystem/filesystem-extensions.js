// filesystem-extensions.js
// Copyright 2019, 2020 by Anthony W. Hursh
// MIT License.


GuerrillaPresenter.file_extension = function(filename){
  let end = filename.lastIndexOf('.');
  if(end < 0){
    return "";
  }
  return filename.substring  (end + 1);
}

GuerrillaPresenter.file_basename = function(filename){
  return filename.substring(filename.lastIndexOf('/') + 1);
}

GuerrillaPresenter.file_path = function(filename){
  let end = filename.lastIndexOf("/")
  return filename.substring(0,end);
}

GuerrillaPresenter.file_basename_no_extension = function(filename){
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


GuerrillaPresenter.file_path_no_extension = function(filename){
  let end = filename.lastIndexOf('.');
  if(end < 0){
    end = filename.length;
  }
  return filename.substring(0,end);
}


GuerrillaPresenter.collectLicenses = function(){
  let filenames = Object.keys(GuerrillaPresenter_fs);
  let license_text = GuerrillaPresenter.readInternalTextFile("1-root/LICENSE-GuerrillaPresenter.fmk") + "\n\n"
  for(var i = 0; i < filenames.length; i++){
    if((filenames[i].match(/LICENSE/) !== null) && (filenames[i] !== "1-root/LICENSE-GuerrillaPresenter.fmk")){
      let packagename = filenames[i].substring(0,filenames[i].indexOf["/"])
      license_text = license_text + "[h2 " + packagename + " h2]\n\n" + GuerrillaPresenter.readInternalTextFile(filenames[i]) + "\n\n"
    }
  }
  return license_text;

}

GuerrillaPresenter.base_64_to_bytes = function(string_buffer){
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

GuerrillaPresenter.getInternalDir = function(basedir){
  let dirfiles = [];
  let filelist = Object.keys(GuerrillaPresenter_fs).sort();
  for(var i = 0; i < filelist.length; i++){
    let key = filelist[i];
    if((basedir === "") || (key.match(RegExp("^" + GuerrillaPresenter.makeGlob(basedir))) !== null)){
        dirfiles.push(key);
    }
  }
  return dirfiles;
}

GuerrillaPresenter.internalFileToBlob = function(filename) {
  let filetype = GuerrillaPresenter.file_extension(filename);
  let mimetype = Stretchr.Filetypes.mimeFor(filetype);
  if(GuerrillaPresenter_fs[filename] !== undefined){
    let bytes = GuerrillaPresenter.base_64_to_bytes(GuerrillaPresenter_fs[filename]["data"]);
    var blob = new Blob([bytes], {type: mimetype});
  return blob;
  }
  console.error("GuerrillaPresenter.internalFileToBlob: " + filename + " is not in internal filesystem");
  return false;
}

GuerrillaPresenter.readInternalFileDataURL = function(filename){
  let filetype = GuerrillaPresenter.file_extension(filename);
  let mimetype = Stretchr.Filetypes.mimeFor(filetype)
  if(GuerrillaPresenter_fs[filename] !== undefined){
    return 'data:' + mimetype + ';base64,' + GuerrillaPresenter_fs[filename]["data"];
  }
  console.error("GuerrillaPresenter.readInternalFileDataURL: " + filename + " is not in internal filesystem");
  return null;
}

GuerrillaPresenter.getFileSystemJSON = function(){
  return JSON.stringify(GuerrillaPresenter_fs);
}
GuerrillaPresenter.getPackageJSON = function(package_prefix){
  let keys = Object.keys(GuerrillaPresenter_fs);
  let package = {}
  for(var i = 0; i < keys.length; i++){
    if(keys[i].indexOf(package_prefix) === 0){
      package[keys[i]] = GuerrillaPresenter_fs[keys[i]]
    }
  }
  package["version"] = GuerrillaPresenter.packageVersion;
  return JSON.stringify(package) + "\n";
}

GuerrillaPresenter.deleteInternalFile = function(filename){
  if(GuerrillaPresenter_fs[filename] !== undefined){
      delete GuerrillaPresenter_fs[filename];
      return true;
  }
  else {
    console.error("GuerrillaPresenter.deleteInternalFile: " + filename + " is not in internal filesystem");
    return false;
  }
}

GuerrillaPresenter.dir = function(dirspec){
  let direntries = [];
  dirspec = dirspec.replace(/\./g,"\\.")
  dirspec = dirspec.replace(/\*/g,".*")
  let re = new RegExp(dirspec);
  let keys = Object.keys(GuerrillaPresenter_fs);
  for(var i = 0; i < keys.length; i++){
    let key = keys[i];
    if(key.match(re) !== null){
      direntries.push(key)
    }
  }
  return direntries.sort();
}

GuerrillaPresenter.collectTrash = function(){
    let trashed_files = [];
    let keys = Object.keys(GuerrillaPresenter_fs);
    for(var i = 0; i < keys.length; i++){
      if(keys[i].indexOf("trash/") === 0){
        trashed_files.push(keys[i].replace(/^trash\//,""))
      }
    }
    return trashed_files;
}
GuerrillaPresenter.emptyTrash = function(){
  let trashed_files = GuerrillaPresenter.collectTrash();
  for(var i = 0; i < trashed_files.length; i++){
    GuerrillaPresenter.deleteInternalFile("trash/" + trashed_files[i])
  }
}
GuerrillaPresenter.trashInternalFile = function(filename){
  if(GuerrillaPresenter_fs[filename] !== undefined){
      GuerrillaPresenter_fs["trash/" + filename] = GuerrillaPresenter_fs[filename]
      delete GuerrillaPresenter_fs[filename];
      return true;
  }
  else {
    console.error("GuerrillaPresenter.trashInternalFile: " + filename + " is not in internal filesystem");
    return false;
  }
}

GuerrillaPresenter.unTrashInternalFile = function(filename){
  let trashname = "trash/" + filename;
  if(GuerrillaPresenter_fs[trashname] !== undefined){
      GuerrillaPresenter_fs[filename] = GuerrillaPresenter_fs[trashname]
      delete GuerrillaPresenter_fs[trashname];
      return true;
  }
  else {
    console.error("GuerrillaPresenter.unTrashInternalFile: " + filename + " is not in the trash");
    return false;
  }
}
GuerrillaPresenter.readInternalFile = function(filename){
  if(GuerrillaPresenter_fs[filename] !== undefined){
      return GuerrillaPresenter.base_64_to_bytes(GuerrillaPresenter_fs[filename]["data"]);
  }
  console.error("GuerrillaPresenter.readInternalFile: " + filename + " is not in internal filesystem");
  return null;
}

GuerrillaPresenter.dataToDataURL = function(data,mimetype){
  let base64data = GuerrillaPresenter.bytes_to_base_64(new TextEncoder("utf-8").encode(data))
  return 'data:' + mimetype + ';base64,' + base64data;
}

GuerrillaPresenter.dataURLToData = function(dataURI){
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
GuerrillaPresenter.writeDataURLToInternalFile = function(filename,data){
  let base64offset = data.indexOf("base64,");
  data = data.substring(base64offset + 7);
  GuerrillaPresenter_fs[filename] = {}
  GuerrillaPresenter_fs[filename]["data"] = data;
  GuerrillaPresenter_fs[filename]["timestamp"] = Date.now();
  return true;
}
GuerrillaPresenter.getFileTimeStamp = function(filename){
  if(GuerrillaPresenter_fs[filename] === undefined){
    return false;
  }
  return parseInt(GuerrillaPresenter_fs[filename]["timestamp"])
}
GuerrillaPresenter.writeInternalFile = function(filename,data){
  GuerrillaPresenter.writeRawInternalFile(filename,  GuerrillaPresenter.bytes_to_base_64(data));
}
GuerrillaPresenter.writeRawInternalFile = function(filename,data){
  let filetype = GuerrillaPresenter.file_extension(filename);
  if(GuerrillaPresenter_fs[filename] === undefined){
    GuerrillaPresenter_fs[filename] = {}
  }
  GuerrillaPresenter_fs[filename]["data"] = data;
  GuerrillaPresenter_fs[filename]["timestamp"] = Date.now();
  return true;
}

GuerrillaPresenter.readInternalTextFile = function(filename){
    return new TextDecoder("utf-8").decode(GuerrillaPresenter.readInternalFile(filename));
}
GuerrillaPresenter.writeInternalTextFile = function(filename,data){
    let bindata = new TextEncoder("utf-8").encode(data)
    GuerrillaPresenter.writeInternalFile(filename,bindata);
    return true;
}

GuerrillaPresenter.getSortedFileNames = function(){
  return GuerrillaPresenter.getUnsortedFileNames.sort();
}

GuerrillaPresenter.getUnsortedFileNames = function(){
  let filetree = [];
  let filenames = Object.keys(GuerrillaPresenter_fs);
  for(var i = 0; i < filenames.length; i++){
      let key = filenames[i];
      if(key.match(/.*\$\$.+\$\$$/) === null){
        filetree.push(key);
      }
    }
    return filetree;
}

GuerrillaPresenter.fileExists = function(filename){
  if(GuerrillaPresenter_fs[filename] !== undefined){
    return true;
  }
  return false;
}

GuerrillaPresenter.file_rename = function (oldname,newname){
  if(GuerrillaPresenter_fs[newname] !== undefined){
    console.error("Can't rename " + oldname + " to " + newname +  ". " + newname + " exists.")
    return false;
  }
  if(GuerrillaPresenter_fs[oldname] === undefined){
    console.error("Can't rename " + oldname + " to " + newname + ". " + oldname + " does not exist.")
    return false;
  }
  GuerrillaPresenter_fs[newname] = GuerrillaPresenter_fs[oldname];
  delete GuerrillaPresenter_fs[oldname];
  return true;
}

GuerrillaPresenter.folder_rename = function (oldfolder,newfolder){
  let filenames = Object.keys(GuerrillaPresenter_fs);
  for(var i = 0; i < filenames.length; i++){
    let current_name = filenames[i];
    if(current_name.match(new RegExp('^' + GuerrillaPresenter.escapeRegExp(oldfolder + '/'))) !== null){
      let newname = current_name.replace(oldfolder,newfolder);
      GuerrillaPresenter_fs[newname] = GuerrillaPresenter_fs[current_name];
      delete GuerrillaPresenter_fs[current_name]
    }
  }
}

GuerrillaPresenter.packageVector = function(){
  let packageHash = {}
  let files = Object.keys(GuerrillaPresenter_fs)
  for(var i = 0; i < files.length; i++){
    let packageIndex = files[i].indexOf("/");
    if(packageIndex > 0){
      packageHash[files[i].substring(0,packageIndex)] = true;
    }
  }
  return Object.keys(packageHash).sort(naturalSort({"direction":false,"caseSensitive":false}));
}

GuerrillaPresenter.deletePackage = function(packagename){
  let files = Object.keys(GuerrillaPresenter_fs)
  for(var i = 0; i < files.length; i++){
    if(files[i].indexOf(packagename) === 0){
      delete GuerrillaPresenter_fs[files[i]];
    }
  }
}