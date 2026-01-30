GorillaCSSLoader = {
    loadCustomCSS: async function () {
        let customCSS = "";
        let mediaFiles = await fs.readDirectory("media/");
        for (let i = 0; i < mediaFiles.length; i++) {
            let mediaFile = mediaFiles[i];
            if (mediaFile.match(/\.css$/i)) {
               let cssBaseName = mediaFile.replace(/^media\//, ''); // Remove "media/" prefix if present
               let cssNameWithoutExtension = cssBaseName.replace(/\.[^/.]+$/, ""); // Remove extension

               try {
                   // Read the CSS file content
                   let content = await fs.readTextFile(mediaFile);
                   if (typeof content !== "string" && content && content.toString) {
                       content = content.toString();
                   }
                   if (typeof content === "string") {
                       customCSS += "\n/* " + content + "\n";
                   }
               } catch (err) {
                   console.error("Failed to read CSS file:", mediaFile, err);
               }
            }
        }
        let cssElement = document.getElementById("gorilla-custom-css");
        if(cssElement !== null) { // Get rid of any old one
          cssElement.remove();
        }
        cssElement = document.createElement('style');
        cssElement.type = 'text/css';
        cssElement.id = 'gorilla-custom-css';
        cssElement.appendChild(document.createTextNode(customCSS));
        document.head.appendChild(cssElement);
    },
 
}