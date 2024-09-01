// BrowserFileSystem is a simple in-memory file system for
// use in web applications.
// Copyright 2019-2024 by Anthony W. Hursh
// MIT License.

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
  let filenames = Object.keys(BrowserFileSystem.fs);
  let license_text = BrowserFileSystem.readInternalTextFile( 
    "base/LICENSE-GorillaPresenter.md") + "\n\n"
  for(var i = 0; i < filenames.length; i++){
    if((filenames[i].match(/LICENSE/) !== null) && (filenames[i] !==  
      "base/LICENSE-GorillaPresenter.md")){
      let packagename = filenames[i].substring(0,filenames[i].indexOf["/"])
      license_text = license_text + "<h2>" + packagename + " </h2>\n\n" + BrowserFileSystem.readInternalTextFile(filenames[i]) + "\n\n"
    }
  }
  return license_text;

}
/*
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
*/

BrowserFileSystem.getInternalDir = function(basedir){
  let dirfiles = [];
  let filelist = Object.keys(BrowserFileSystem.fs).sort();
  for(var i = 0; i < filelist.length; i++){
    let key = filelist[i];
    if((basedir === "") || (key.match(RegExp("^" + BrowserFileSystem.makeGlob(basedir))) !== null)){
        dirfiles.push(key);
    }
  }
  return dirfiles;
}



BrowserFileSystem.getFileSystemJSON = function(){
  return JSON.stringify(BrowserFileSystem.fs);
}
BrowserFileSystem.getPackageJSON = function(package_prefix){
  let keys = Object.keys(BrowserFileSystem.fs);
  let package = {}
  for(var i = 0; i < keys.length; i++){
    if(keys[i].indexOf(package_prefix) === 0){
      package[keys[i]] = BrowserFileSystem.fs[keys[i]]
    }
  }
  package["version"] = GorillaPresenter.packageVersion;
  return JSON.stringify(package) + "\n";
}

BrowserFileSystem.deleteInternalFile = function(filename){
  if(BrowserFileSystem.fs[filename] !== undefined){
      delete BrowserFileSystem.fs[filename];
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
  let keys = Object.keys(BrowserFileSystem.fs);
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
    let keys = Object.keys(BrowserFileSystem.fs);
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
  if(BrowserFileSystem.fs[filename] !== undefined){
      BrowserFileSystem.fs["trash/" + filename] = BrowserFileSystem.fs[filename]
      delete BrowserFileSystem.fs[filename];
      return true;
  }
  else {
    console.error("BrowserFileSystem.trashInternalFile: " + filename + " is not in internal filesystem");
    return false;
  }
}

BrowserFileSystem.unTrashInternalFile = function(filename){
  let trashname = "trash/" + filename;
  if(BrowserFileSystem.fs[trashname] !== undefined){
      BrowserFileSystem.fs[filename] = BrowserFileSystem.fs[trashname]
      delete BrowserFileSystem.fs[trashname];
      return true;
  }
  else {
    console.error("BrowserFileSystem.unTrashInternalFile: " + filename + " is not in the trash");
    return false;
  }
}
BrowserFileSystem.getBase64Data = function(filename){
  if(BrowserFileSystem.fs[filename] !== undefined){
    let dataURL = BrowserFileSystem.fs[filename]["data"]
    let base64offset = dataURL.indexOf(";base64,");
    let base64data  = dataURL.substring(base64offset + 8);
    return base64data;
  }
  console.error("BrowserFileSystem.getBase64Data: " + filename + " is not in internal filesystem");
  return null;
}
BrowserFileSystem.internalFileToBlob = function(filename) {
  let filetype = BrowserFileSystem.file_extension(filename);
  if(BrowserFileSystem.mimeTypes[filetype] === undefined){
    filetype = "application/octet-stream";
  }
  if(BrowserFileSystem.fs[filename] !== undefined){
    //let bytes = BrowserFileSystem.base_64_to_bytes(BrowserFileSystem.getBase64Data(filename));
    let bytes = BrowserFileSystem.base64ToBytes(BrowserFileSystem.getBase64Data(filename));
    let blob = new Blob([bytes], {type: mimetype});
  return blob;
  }
  console.error("BrowserFileSystem.internalFileToBlob: " + filename + " is not in internal filesystem");
  return false;
}

BrowserFileSystem.readInternalFileDataURL = function(filename){
  if(BrowserFileSystem.fs[filename] !== undefined){
    return BrowserFileSystem.fs[filename]["data"];
  }
  console.error("BrowserFileSystem.readInternalFileDataURL: " + filename + " is not in internal filesystem");
  return null;
}

BrowserFileSystem.readInternalFile = function(filename){
  if(BrowserFileSystem.fs[filename] !== undefined){
     // return BrowserFileSystem.base_64_to_bytes(BrowserFileSystem.getBase64Data(filename));
     return BrowserFileSystem.base64ToBytes(BrowserFileSystem.getBase64Data(filename));
  }
  console.error("BrowserFileSystem.readInternalFile: " + filename + " is not in internal filesystem");
  return null;
}

BrowserFileSystem.base64ToBytes = function(base64) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

BrowserFileSystem.bytesToBase64 = function(bytes){
  const encodedBytes = new TextEncoder("utf-8").encode(bytes);
  const binString = Array.from(encodedBytes, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}


BrowserFileSystem.dataToDataURL = function(data,mimetype){
  let base64data = BrowserFileSystem.bytesToBase64(data)
  return 'data:' + mimetype + ';base64,' + base64data;
}

BrowserFileSystem.dataURLToData = function(dataURI){
  let base64Index = dataURI.indexOf(';base64,') + 8;
  let base64 = dataURI.substring(base64Index);
  let raw = BrowserFileSystem.base64ToBytes(base64);
  let rawLength = raw.length;
  let array = new Uint8Array(new ArrayBuffer(rawLength));
  let i;
  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
BrowserFileSystem.writeDataURLToInternalFile = function(filename,data){
  BrowserFileSystem.fs[filename] = {}
  BrowserFileSystem.fs[filename]["data"] = data;
  BrowserFileSystem.fs[filename]["timestamp"] = Date.now();
  return true;
}

BrowserFileSystem.getFileTimeStamp = function(filename){
  if(BrowserFileSystem.fs[filename] === undefined){
    return false;
  }
  return parseInt(BrowserFileSystem.fs[filename]["timestamp"])
}
BrowserFileSystem.writeInternalFile = function(filename,data){
  BrowserFileSystem.writeRawInternalFile(filename,  BrowserFileSystem.bytesToBase64(data));
}
BrowserFileSystem.writeRawInternalFile = function(filename,data){
  let filetype = BrowserFileSystem.file_extension(filename);
  let mimetype = BrowserFileSystem.mimeTypes[filetype];
  if(mimetype === undefined){
    mimetype = "application/octet-stream";
  }
  if(BrowserFileSystem.fs[filename] === undefined){
    BrowserFileSystem.fs[filename] = {}
  }
  BrowserFileSystem.fs[filename]["data"] = 'data:' + mimetype + ';base64,' + data;
  BrowserFileSystem.fs[filename]["timestamp"] = Date.now();
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
  let filenames = Object.keys(BrowserFileSystem.fs);
  for(var i = 0; i < filenames.length; i++){
      let key = filenames[i];
      if(key.match(/.*\$\$.+\$\$$/) === null){
        filetree.push(key);
      }
    }
    return filetree;
}

BrowserFileSystem.fileExists = function(filename){
  if(BrowserFileSystem.fs[filename] !== undefined){
    return true;
  }
  return false;
}

BrowserFileSystem.file_rename = function (oldname,newname){
  if(BrowserFileSystem.fs[newname] !== undefined){
    console.error("Can't rename " + oldname + " to " + newname +  ". " + newname + " exists.")
    return false;
  }
  if(BrowserFileSystem.fs[oldname] === undefined){
    console.error("Can't rename " + oldname + " to " + newname + ". " + oldname + " does not exist.")
    return false;
  }
  BrowserFileSystem.fs[newname] = BrowserFileSystem.fs[oldname];
  delete BrowserFileSystem.fs[oldname];
  return true;
}

BrowserFileSystem.folder_rename = function (oldfolder,newfolder){
  let filenames = Object.keys(BrowserFileSystem.fs);
  for(var i = 0; i < filenames.length; i++){
    let current_name = filenames[i];
    if(current_name.match(new RegExp('^' + GorillaPresenter.escapeRegExp(oldfolder + '/'))) !== null){
      let newname = current_name.replace(oldfolder,newfolder);
      BrowserFileSystem.fs[newname] = BrowserFileSystem.fs[current_name];
      delete BrowserFileSystem.fs[current_name]
    }
  }
}

BrowserFileSystem.packageVector = function(){
  let packageHash = {}
  let files = Object.keys(BrowserFileSystem.fs)
  for(var i = 0; i < files.length; i++){
    let packageIndex = files[i].indexOf("/");
    if(packageIndex > 0){
      packageHash[files[i].substring(0,packageIndex)] = true;
    }
  }
  return Object.keys(packageHash).sort(naturalSort({"direction":false,"caseSensitive":false}));
}

BrowserFileSystem.deletePackage = function(packagename){
  let files = Object.keys(BrowserFileSystem.fs)
  for(var i = 0; i < files.length; i++){
    if(files[i].indexOf(packagename) === 0){
      delete BrowserFileSystem.fs[files[i]];
    }
  }
}
BrowserFileSystem.uploadElementId = "browser-file-system-uploader";

BrowserFileSystem.setUploadElementId = function(elementId){
  BrowserFileSystem["uploadElementId"] = elementId;
}

BrowserFileSystem.uploadFile = function(type,multiple,format,callback){
  let uploader = document.createElement("input");
  uploader.type = "file";
  uploader.id = BrowserFileSystem["uploadElementId"];
  uploader.style.display = "none";
  
  if(type !== false){
      uploader.setAttribute('accept', type);
   }
  if(multiple === true){
    uploader.setAttribute('multiple','');
  }
  uploader.value = '';
  document.body.appendChild(uploader);
  uploader.onchange = function(){
    let curFiles = uploader.files;
    for (let index = 0; index < curFiles.length; index++) {
      let reader = new FileReader();
      reader.onloadend = (function(filename) {
        return function(evt) {
          callback(filename,evt.target.result)
          if(index = curFiles.length - 1){
            document.body.removeChild(uploader);
          };
        };
     
      })(curFiles[index].name);
      if(format === "data"){
        reader.readAsDataURL(curFiles[index]);
      }
      else if (format === "text"){
        reader.readAsText(curFiles[index]);
      }
      else {
        console.error("BrowserFileSystem.uploadFile: unrecognized format requested: " + format);
      }
    }
  }
  setTimeout(function(){
    uploader.click();
  },10)
}

BrowserFileSystem.downloadFile = function(filename,data,mime_type){
  var blob = new Blob([data], {type: mime_type});
  BrowserFileSystem.downloadBlob(filename,blob);
}

BrowserFileSystem.downloadBlob = function(filename,blob){
let element = document.createElement('a')
element.href = window.URL.createObjectURL(blob);
element.setAttribute('download', filename);
element.style.display = 'none';
element.innerHTML = "Download";
document.body.appendChild(element)
 element.click();
 document.body.removeChild(element);
 window.URL.revokeObjectURL(element.href);
 delete element;
}


BrowserFileSystem.downloadInternalFile = function(filename){
var blob = BrowserFileSystem.internalFileToBlob(filename);
if(blob !== false){
 BrowserFileSystem.downloadBlob(filename,blob)
}
return false;
}

/* These are some mime types commonly used on the web. It's easy to add more at runtime... if your file extension is "foo", and is intended for use with an application called "Foobar", just do something like: 
  BrowserFileSystem.mimeTypes["foo"] = {
    description: "Foobar File",
    mimetype: "application/foobar"
  } 
  Note that you should only do this if there's an actual registered mime type for the file extension. Otherwise, you should use "application/octet-stream" as the mimetype.
  */

BrowserFileSystem.mimeTypes = {
  "jpeg": {
    description: "JPEG Image",
    mimetype: "image/jpeg"
  },
  "jpg": {
    description: "JPEG Image",
    mimetype: "image/jpeg"
  },
  "png": {
    description: "PNG Image",
    mimetype: "image/png"
  },
  "html": {
    description: "HTML Document",
    mimetype: "text/html"
  },
  "htm": {
    description: "HTML Document",
    mimetype: "text/html"
  },
  "css": {
    description: "CSS Stylesheet",
    mimetype: "text/css"
  },
  "js": {
    description: "JavaScript File",
    mimetype: "application/javascript"
  },
  "json": {
    description: "JSON Format",
    mimetype: "application/json"
  },
  "svg": {
    description: "SVG Image",
    mimetype: "image/svg+xml"
  },
  "txt": {
    description: "Plain Text",
    mimetype: "text/plain"
  },
  "pdf": {
    description: "PDF Document",
    mimetype: "application/pdf"
  },
  "mp4": {
    description: "MP4 Video",
    mimetype: "video/mp4"
  },
  "mp3": {
    description: "MP3 Audio",
    mimetype: "audio/mpeg"
  },
  "zip": {
    description: "ZIP Archive",
    mimetype: "application/zip"
  },
  "rar": {
    description: "RAR Archive",
    mimetype: "application/x-rar-compressed"
  },
  "gif": {
    description: "GIF Image",
    mimetype: "image/gif"
  },
  "doc": {
    description: "Microsoft Word Document",
    mimetype: "application/msword"
  },
  "docx": {
    description: "Microsoft Word (OpenXML)",
    mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  "xls": {
    description: "Microsoft Excel Document",
    mimetype: "application/vnd.ms-excel"
  },
  "xlsx": {
    description: "Microsoft Excel (OpenXML)",
    mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  "ppt": {
    description: "Microsoft PowerPoint Document",
    mimetype: "application/vnd.ms-powerpoint"
  },
  "pptx": {
    description: "Microsoft PowerPoint (OpenXML)",
    mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  },
  "ttf": {
    description: "TrueType Font",
    mimetype: "font/ttf"
  },
  "otf": {
    description: "OpenType Font",
    mimetype: "font/otf"
  },
  "woff": {
    description: "Web Open Font Format",
    mimetype: "font/woff"
  },
  "woff2": {
    description: "Web Open Font Format 2",
    mimetype: "font/woff2"
  },
  "eot": {
    description: "Embedded OpenType Font",
    mimetype: "font/eot"
  },
  "csv": {
    description: "Comma Separated Values",
    mimetype: "text/csv"
  },
  "xml": {
    description: "XML Document",
    mimetype: "application/xml"
  },
  "webm": {
    description: "WebM Video",
    mimetype: "video/webm"
  },
  "ogg": {
    description: "Ogg Audio",
    mimetype: "audio/ogg"
  },
  "webp": {
    description: "WebP Image",
    mimetype: "image/webp"
  },
  "ico": {
    description: "Icon Image",
    mimetype: "image/x-icon"
  },
  "webmanifest": {
    description: "Web App Manifest",
    mimetype: "application/manifest+json"
  },
  "md": {
    description: "Markdown Document",
    mimetype: "text/markdown"
  },
};





BrowserFileSystem.escapeRegExp = function(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    }

BrowserFileSystem.makeGlob = function(text) {
      text =  text.replace(/[-[\]{}()+.,\\^$|#\s]/g, '\\$&')
      return text.replace(/\*/,".*")
    }
// ISBN regex ^(ISBN[-]*(1[03])*[ ]*(: ){0,1})*(([0-9Xx][- ]*){13}|([0-9Xx][- ]*){10})$
