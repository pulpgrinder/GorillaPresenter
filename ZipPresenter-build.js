// Copyright 2020 by Anthony W. Hursh. MIT License.
const fs = require('fs');
const path = require('path')
const mime = require('mime');
const btoa  = require('btoa');
const jsmin = require('jsmin').jsmin;
let version_info
let build_info;
let ZipPresenter_fs = {}
let css_bundle = ""
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
}
function process_pwa(err,results){
    console.log("Processing pwa files...")
    if(err !== null){
      console.error("Build Monster error: " + err);
      return;
    }
    for(var i = 0; i < results.length; i++){
      process_pwa_file(results[i]);
    }
}

function process_pwa_file(file_name){
  // Don't need extraneous MacOS metadata files.
  if(file_name.match(/\.DS_Store$/) !== null){
    return;
  }
  let outfile_name = file_name.replace(/\/pwa\//,"/dist/")
  console.log("Processing: " + outfile_name)
  let file_data = fs.readFileSync(file_name,"binary");
  file_data = file_data.replace(/___VERSION___/g, version_info);
  file_data = file_data.replace(/___BUILD___/g, build_info);
  fs.writeFileSync(outfile_name,file_data,"binary");
}

function process_files(err,results){
  console.log("Building internal filesystem...")
  if(err !== null){
    console.error("Build Monster error: " + err);
    return;
  }
  for(var i = 0; i < results.length; i++){
    process_file(results[i]);
  }
//  process_packages();
  
//  write_filesystem();
// add js,scm, and css to HTML template
  //write_css();
  write_html();
}

function write_filesystem(){
    let filesystem = JSON.stringify(ZipPresenter_fs)
    if (!fs.existsSync(__dirname + "/filesystem")){
      fs.mkdirSync(__dirname + "/filesystem");
    }
    fs.writeFileSync(__dirname +  "/filesystem/ZipPresenter_fs.json",filesystem,"utf8");
}

function create_directories(){
  if (!fs.existsSync(__dirname + "/dist")){
    fs.mkdirSync(__dirname + "/dist");
  }
}

function write_css(){
  fs.writeFileSync(__dirname +  "/dist/css/bundle.css",css_bundle,"utf8");
}
function write_image_file(filename,data){
  fs.writeFileSync(__dirname +  "/dist/images/" + path.basename(filename),data,"binary");
}
function write_font_file(filename,data){
  fs.writeFileSync(__dirname +  "/dist/css/" + path.basename(filename),data,"binary");
}
function write_html(){
  let template = fs.readFileSync(__dirname + "/src/startup-js/index_template.html","utf8");
  template = template.replace(/___VERSION___/g, version_info);
  template = template.replace(/___BUILD___/g, build_info);
  let template_out = "";
  let template_lines = template.split("\n");
  for(var i = 0; i < template_lines.length; i++){
    let template_line = template_lines[i];
    if(template_line.indexOf("$$$") === -1){
      template_out = template_out + template_line + "\n";
    }
    else{
      switch(template_line.trim()){
        case "$$$FILESYSTEM$$$":   template_out = template_out + "ZipPresenter_fs=" + JSON.stringify(ZipPresenter_fs)
              break;
        default: template_out = template_out + template_line + "\n"
              break;
      }
    }
  }
  console.log("Writing html file...");
  fs.writeFileSync(__dirname +  "/dist/index.html",template_out,"utf8");

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
  console.log("Processing: " + outfile_name)
  
/*  if(outfile_name.match(/\.css$/)){
    file_data = fs.readFileSync(file_name,"utf8");
    css_bundle = css_bundle + "\n" + file_data;
    return;
  } */
/*  if(outfile_name.match(/\.jpg$/i) || outfile_name.match(/\.jpeg$/i) || outfile_name.match(/\.png$/i) || outfile_name.match(/\.gif$/i) || outfile_name.match(/\.svg$/i)){
    let file_data = fs.readFileSync(file_name,"binary");
    write_image_file(outfile_name,file_data);
    return;
 } */
 /*if(outfile_name.match(/\.ttf$/i) || outfile_name.match(/\.otf$/i)){
   file_data = fs.readFileSync(file_name,"binary");
   write_font_file(outfile_name,file_data);
   return;
} */
  file_data = fs.readFileSync(file_name,"binary");
  ZipPresenter_fs[outfile_name] = {"timestamp": Date.now(),"data":btoa(file_data)};
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
