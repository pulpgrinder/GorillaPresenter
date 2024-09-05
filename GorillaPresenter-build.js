// Copyright 2020 by Anthony W. Hursh. MIT License.
const fs = require('fs');
const path = require('path')
const mime = require('mime');
const btoa  = require('btoa');
const { get } = require('http');
const jsmin = require('jsmin').jsmin;
let version_info
let build_info;
let BrowserFileSystem = {}
BrowserFileSystem.fs = {}

let debugging = false;
if(process.argv.length === 3){
 if(process.argv[2] === "--debug"){
    debugging = true;
    console.log("Debugging requested. Producing debuggable output.");
 }
}

let source_folder =  __dirname + "/src/"
console.log("Source folder is " + source_folder);
bump_version();
create_directories();
//write_buildtools();
filewalker(source_folder,null,process_files);

//let pwa_folder =  __dirname + "/pwa/"

//filewalker(pwa_folder,null,process_pwa);

function bump_version(){
  version_info = parseFloat(fs.readFileSync(__dirname + "/src/build/version","utf8"));
  build_info = parseInt(fs.readFileSync(__dirname + "/src/build/build","utf8"));
  build_info = build_info + 1;
  fs.writeFileSync(__dirname + "/src/build/build","" + build_info,"utf8");
  date = new Date();
  fs.writeFileSync(__dirname + "/src/build/build_date","" + date,"utf8");
}



function process_files(err,results){
  console.log("Building internal filesystem...")
  if(err !== null){
    console.error("BuildBrowserFS error: " + err);
    return;
  }
  for(var i = 0; i < results.length; i++){
    process_file(results[i]);
  }
  write_html();
  write_manifest();
  write_icons();
 // write_filesystem();
}

function write_filesystem(){
    let filesystem = JSON.stringify(BrowserFileSystem.fs)
    if (!fs.existsSync(__dirname + "/filesystem")){
      fs.mkdirSync(__dirname + "/filesystem");
    }
    fs.writeFileSync(__dirname +  "/filesystem/BrowserFileSystem.fs.json",filesystem,"utf8");
}

function create_directories(){
  if (!fs.existsSync(__dirname + "/dist")){
    fs.mkdirSync(__dirname + "/dist");
  }
}

function write_icons(){
  let icon_name = __dirname + "/src/icons/apple-touch-icon-152x152.png";
  let icon_data = fs.readFileSync(icon_name,"binary");
  let icon_outfile = __dirname + "/dist/apple-touch-icon-152x152.png";
  fs.writeFileSync(icon_outfile,icon_data,"binary");
 
  icon_name = __dirname + "/src/icons/apple-touch-icon-180x180.png";
  icon_data = fs.readFileSync(icon_name,"binary");
  icon_outfile = __dirname + "/dist/apple-touch-icon-180x180.png";
  fs.writeFileSync(icon_outfile,icon_data,"binary");
  icon_name = __dirname + "/src/icons/apple-touch-icon-192x192.png";
  icon_data = fs.readFileSync(icon_name,"binary");
  icon_outfile = __dirname + "/dist/apple-touch-icon-192x192.png";
  fs.writeFileSync(icon_outfile,icon_data,"binary");
  icon_name = __dirname + "/src/icons/apple-touch-icon-512x512.png";
  icon_data = fs.readFileSync(icon_name,"binary");
  icon_outfile = __dirname + "/dist/apple-touch-icon-512x512.png";
  fs.writeFileSync(icon_outfile,icon_data,"binary");
  icon_name = __dirname + "/src/base/favicon.ico";
  icon_data = fs.readFileSync(icon_name,"binary");
  icon_outfile = __dirname + "/dist/favicon.ico";
  fs.writeFileSync(icon_outfile,icon_data,"binary");
}

function write_manifest(){
 /*  let manifest = fs.readFileSync(__dirname + "/src/manifest.json","utf8");
  fs.writeFileSync(__dirname +  "/dist/manifest.json",manifest,"utf8");
  let sw = fs.readFileSync(__dirname + "/src/base/sw.js","utf8");
  sw = sw.replace(/___CACHE_NAME___/g,"V" + version_info + build_info + new Date());
  fs.writeFileSync(__dirname +  "/dist/sw.js",sw,"utf8"); */
}


function write_html(){
  let base_template = fs.readFileSync(__dirname + "/src/base/index_template.html","utf8");
  let iframe_template = fs.readFileSync(__dirname + "/src/base/internal_frame_template.html","utf8");
  iframe_template = iframe_template.replace(/___VERSION___/g, version_info);
  iframe_template = iframe_template.replace(/___BUILD___/g, build_info);
  iframe_template = iframe_template.replace(/___BUILD_DATE___/g,new Date());
  iframe_template = iframe_template.replace(/___FILESYSTEM___/g, "BrowserFileSystem.fs=" + JSON.stringify(BrowserFileSystem.fs));
  iframe_template = iframe_template.replace(/___DEBUGGING___/g,debugging);
  iframe_data =  btoa(iframe_template);
  base_template = base_template.replace(/___IFRAMECONTENT___/,'var iframeContent ="' + iframe_data + '";');
  console.log("Writing html file...");
  if(debugging){
    fs.writeFileSync(__dirname +  "/dist/index.html",iframe_template,"utf8");
  }
  else {
    fs.writeFileSync(__dirname +  "/dist/index.html",base_template,"utf8");
  }
 

}

function process_file(file_name){
  // Don't need extraneous MacOS metadata files.
  if(file_name.match(/\.DS_Store$/) !== null){
    return;
  }
  let file_data
  let outfile_name = file_name.replace(source_folder,"")
  if(outfile_name.match(/^!/)){
    console.log("Skipping: " + outfile_name);
    return;
  }
  console.log("Processing: " + outfile_name);

  file_data = fs.readFileSync(file_name,"binary");
  let encodedData = convert_to_data_url(file_name,file_data);
    BrowserFileSystem.fs[outfile_name] = {"timestamp": Date.now(),"data":encodedData};
  
}

function convert_to_data_url(file_name,data){
  let base64 = btoa(data);
  let mimetype = mime.getType(file_name);
  if(mimetype === null){
    console.error("No mimetype for " + file_name);
    mimetype = "text/plain";
  }
  return "data:" + mimetype + ";base64," + base64;
}

/**
 * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
 *
 * @see http://stackoverflow.com/a/5827895/4241030
 * @param {String} dir
 * @param {Function} done
 */
function filewalker(dir, type, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);
        list.forEach(function(file){
            file = path.resolve(dir, file);
              fs.stat(file, function(err, stat){
                  // If directory, execute a recursive call
                  if (stat && stat.isDirectory()) {
                      // Add directory to array [comment if you need to remove the directories from the array]
                    //  results.push(file);
                      filewalker(file, type, function(err, res){
                          results = results.concat(res);
                          if (!--pending) done(null, results);
                      });

                  } else {
                      if(type !== null){
                        if(file.indexOf(type) === (file.length - type.length)){
                          results.push(file);
                        }
                      }
                      else {
                        results.push(file)
                      }
                    if (!--pending) done(null, results);
                  }
              });
        });
    });
};
