MediaPlugin = {

    mediaSequenceNumber: 0,
    mediaData: [],
    reset: async function () {
        this.mediaSequenceNumber = 0;
        for(let url of this.mediaData) {
            URL.revokeObjectURL(url);
        } 
        this.mediaData = [];
    },

    renderHTML: async function (mediaSpec) {
        let specparts = mediaSpec.split("|").map(part => part.trim());
        mediaSpec = specparts[0];
        let title = "";
        if(specparts.length > 1) {
            console.log("Media directive has title: " + specparts[1]);
           title = specparts[1];
        }
        
        let mediaFile
        if(mediaSpec.startsWith("http://") || mediaSpec.startsWith("https://") ) {
            if(title === "") {
                title = mediaSpec;
            }
            mediaFile= mediaSpec;
        } else {
         mediaFile = await GorillaMedia.findMediaFile(mediaSpec);
         console.log("Resolved media spec '" + mediaSpec + "' to file: " + mediaFile);
         if(title === "") {
         title = GorillaMedia.splitFilePath(mediaFile).basePath.replace(/media\//, ""); // Strip "media/" from display title if present
        }
            }
        if (mediaFile) {
             if(mediaSpec.startsWith("http://") || mediaSpec.startsWith("https://") ) {
                    MediaPlugin.mediaData.push(mediaFile);
             } else {
                MediaPlugin.mediaData.push(URL.createObjectURL(await fs.readBinaryFile(mediaFile)));
                }
            if (mediaFile.endsWith(".jpeg") || mediaFile.endsWith(".jpg") || mediaFile.endsWith(".png") || mediaFile.endsWith(".gif")) {
                return `<img id='gorilla-media-${MediaPlugin.mediaSequenceNumber}' sequence="${MediaPlugin.mediaSequenceNumber++}" src="" alt="${title}" title="${title}" class="gorilla-media gorilla-media-image" />`;
            } else if (mediaFile.endsWith(".mp4") || mediaFile.endsWith(".mov") || mediaFile.endsWith(".avi") || mediaFile.endsWith(".webm")) {
                return `<video id='gorilla-media-${MediaPlugin.mediaSequenceNumber}' sequence="${MediaPlugin.mediaSequenceNumber++}" controls  alt="${title}" title="${title}" class="gorilla-media gorilla-media-video"><source src="">Your browser does not support the video tag.</video>`;
            } else if (mediaFile.endsWith(".mp3") || mediaFile.endsWith(".wav")) {
                return `<audio id='gorilla-media-${MediaPlugin.mediaSequenceNumber}' sequence="${MediaPlugin.mediaSequenceNumber++}" controls  alt="${title}" title="${title}" class="gorilla-media gorilla-media-audio"><source src="">Your browser does not support the audio element.</audio>`;
            }
            else {
                MediaPlugin.mediaData.pop();
                let mediadata = await GorillaUtility.readZipFileAsDataURI(mediaFile);
                return "<a id='gorilla-media-" + (MediaPlugin.mediaSequenceNumber++) + "' sequence=\"" + (MediaPlugin.mediaSequenceNumber++) + "\" href='" + mediadata + "' download>" + GorillaMedia.GorillaMedia.getFileIcon(GorillaMedia.splitFilePath(mediaFile).extension) + " Download " + mediaSpec + "</a>";
            }
        } else {
            console.warn("Media file not found for directive: " + mediaSpec);
            return `<span class="gorilla-media-missing">[Missing media: ${mediaSpec}]</span>`;
        }
    },

    postprocess: function () {
        const mediaElements = document.querySelectorAll('.gorilla-media');
        mediaElements.forEach((element) => {
            const sequence = parseInt(element.getAttribute('sequence'));
            const dataURI = MediaPlugin.mediaData[sequence];
            if (element.tagName.toLowerCase() === 'img') {
                element.setAttribute('src', dataURI);

            } else if (element.tagName.toLowerCase() === 'video') {
                const sourceElement = element.querySelector('source');
                sourceElement.setAttribute('src', dataURI);
                element.load();

            } else if (element.tagName.toLowerCase() === 'audio') {
                const sourceElement = element.querySelector('source');
                sourceElement.setAttribute('src', dataURI);
                element.load();
            }

            else if (element.tagName.toLowerCase() === 'a') {
                element.setAttribute('href', dataURI);
            }
        });
    },
};