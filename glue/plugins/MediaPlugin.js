MediaPlugin = {

    mediaSequenceNumber: 0,
    mediaData: [],
    mediaPaths: [],
    mediaDimensions: [],  // Cache dimensions for each media item
    
    // Get image dimensions and cache the blob URL to prevent double-loading
    getImageDimensionsAndCache: async function (filePath, seq) {
        try {
            const blob = await fs.readBinaryFile(filePath);
            const url = URL.createObjectURL(blob);
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    // Cache the URL for later use in postprocess
                    MediaPlugin.mediaData[seq] = url;
                    resolve({ width: img.width, height: img.height, url: url });
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load image'));
                };
                img.src = url;
            });
        } catch (e) {
            console.error('Failed to get image dimensions for', filePath, e);
            return null;
        }
    },
    
    reset: async function () {
        this.mediaSequenceNumber = 0;
        for (let url of this.mediaData) {
            try {
                URL.revokeObjectURL(url);
            } catch (e) {
                // ignore
            }
        }
        this.mediaData = [];
        this.mediaPaths = [];
        this.mediaDimensions = [];
    },

    renderHTML: async function (mediaSpec) {
        let specparts = mediaSpec.split("|").map(part => part.trim());
        mediaSpec = specparts[0];
        let title = "";
        if (specparts.length > 1) {
            title = specparts[1];
        }

        let mediaFile
        if (mediaSpec.startsWith("http://") || mediaSpec.startsWith("https://")) {
            if (title === "") {
                title = mediaSpec;
            }
            mediaFile = mediaSpec;
        } else {
            mediaFile = await GorillaMedia.findMediaFile(mediaSpec);
            if (title === "") {
                title = GorillaMedia.splitFilePath(mediaFile).basePath.replace(/media\//, ""); // Strip "media/" from display title if present
            }
        }
        if (mediaFile) {
            // Don't load binary data now. Emit placeholders with data attributes
            const seq = MediaPlugin.mediaSequenceNumber++;
            const isExternal = mediaSpec.startsWith("http://") || mediaSpec.startsWith("https://");
            const dataAttr = isExternal ? `data-media-src="${mediaFile}"` : `data-media-path="${mediaFile}"`;

            if (mediaFile.match(/\.(jpe?g|png|gif|webp|svg)$/i)) {
                // image: set src for external, placeholder for local
                if (isExternal) {
                    return `<img id='gorilla-media-${seq}' data-sequence="${seq}" src="${mediaFile}" alt="${title}" title="${title}" class="gorilla-media gorilla-media-image" />`;
                }
                MediaPlugin.mediaPaths[seq] = mediaFile;
                // Get dimensions and cache blob URL to prevent layout shift and double-loading
                const dims = await MediaPlugin.getImageDimensionsAndCache(mediaFile, seq);
                if (dims) {
                    MediaPlugin.mediaDimensions[seq] = dims;
                    // Set src immediately with cached URL to prevent flickering - no data attributes needed
                    return `<img id='gorilla-media-${seq}' data-sequence="${seq}" width="${dims.width}" height="${dims.height}" src="${dims.url}" alt="${title}" title="${title}" class="gorilla-media gorilla-media-image" data-loaded="true" />`;
                } else {
                    // Fallback if dimension loading failed - will be loaded in postprocess
                    return `<img id='gorilla-media-${seq}' data-sequence="${seq}" ${dataAttr} alt="${title}" title="${title}" class="gorilla-media gorilla-media-image" />`;
                }
            } else if (mediaFile.match(/\.(mp4|mov|avi|webm)$/i)) {
                if (isExternal) {
                    return `<video id='gorilla-media-${seq}' data-sequence="${seq}" controls alt="${title}" title="${title}" class="gorilla-media gorilla-media-video"><source src="${mediaFile}">Your browser does not support the video tag.</video>`;
                }
                MediaPlugin.mediaPaths[seq] = mediaFile;
                return `<video id='gorilla-media-${seq}' data-sequence="${seq}" ${dataAttr} controls alt="${title}" title="${title}" class="gorilla-media gorilla-media-video"><source></video>`;
            } else if (mediaFile.match(/\.(mp3|wav|ogg)$/i)) {
                if (isExternal) {
                    return `<audio id='gorilla-media-${seq}' data-sequence="${seq}" controls alt="${title}" title="${title}" class="gorilla-media gorilla-media-audio"><source src="${mediaFile}">Your browser does not support the audio element.</audio>`;
                }
                MediaPlugin.mediaPaths[seq] = mediaFile;
                return `<audio id='gorilla-media-${seq}' data-sequence="${seq}" ${dataAttr} controls alt="${title}" title="${title}" class="gorilla-media gorilla-media-audio"><source></audio>`;
            } else {
                // Generic file -- provide download placeholder; load data URI lazily in postprocess
                MediaPlugin.mediaPaths[seq] = mediaFile;
                return `<a id='gorilla-media-${seq}' data-sequence="${seq}" ${dataAttr} class="gorilla-media gorilla-media-download" download>${GorillaMedia.getFileIcon(GorillaMedia.splitFilePath(mediaFile).extension)} Download ${mediaSpec}</a>`;
            }
        } else {
            console.warn("Media file not found for directive: " + mediaSpec);
            return `<span class="gorilla-media-missing">[Missing media: ${mediaSpec}]</span>`;
        }
    },
    postprocess: async function () {
        const mediaElements = document.querySelectorAll('.gorilla-media');
        for (const element of mediaElements) {
            const seqAttr = element.getAttribute('data-sequence');
            const dataPath = element.getAttribute('data-media-path');
            const dataSrc = element.getAttribute('data-media-src');
            const dataLoaded = element.getAttribute('data-loaded');

            const sequence = seqAttr ? parseInt(seqAttr, 10) : null;

            // If external src is provided, nothing to do
            if (dataSrc) continue;
            
            // If this element was already loaded in renderHTML (has cached blob URL), just add event listener
            const tag = element.tagName.toLowerCase();
            if (dataLoaded === 'true') {
                if (tag === 'img' || tag === 'a') {
                    element.addEventListener('click', (e) => e.stopPropagation());
                } else if (tag === 'video' || tag === 'audio') {
                    element.addEventListener('click', (e) => { e.stopPropagation(); });
                }
                continue;
            }

            if (!dataPath) {
                // No local data path — check for external sources and ensure media elements are loaded
                const tagName = element.tagName.toLowerCase();
                if (tagName === 'video' || tagName === 'audio') {
                    const sourceElement = element.querySelector('source');
                    if (sourceElement && sourceElement.getAttribute('src')) {
                        try { element.load(); } catch (e) { /* ignore */ }
                        continue;
                    }
                    if (element.getAttribute('src')) {
                        try { element.load(); } catch (e) { /* ignore */ }
                        continue;
                    }
                }
                // nothing else to do for external anchors/images
                // Try legacy sequence attribute mapping: fallback to mediaPaths if present
                const seqLegacy = element.getAttribute('sequence');
                if (seqLegacy) {
                    const seqNum = parseInt(seqLegacy, 10);
                    const mapped = MediaPlugin.mediaPaths[seqNum];
                    if (mapped) {
                        // treat this as a local path now
                        try {
                            const blob = await fs.readBinaryFile(mapped);
                            const url = URL.createObjectURL(blob);
                            MediaPlugin.mediaData[seqNum] = url;
                            const tag = element.tagName.toLowerCase();
                            if (tag === 'video' || tag === 'audio') {
                                const sourceElement2 = element.querySelector('source');
                                try {
                                    element.setAttribute('src', url);
                                    element.load();
                                } catch (e) {
                                    /* ignore */
                                }
                            } else if (tag === 'img') {
                                element.setAttribute('src', url);
                            } else if (tag === 'a') {
                                element.setAttribute('href', url);
                            }
                            continue;
                        } catch (e) {
                            console.error('MediaPlugin failed to load legacy media for', mapped, e);
                        }
                    }
                }
                continue;
            }

            try {
                // If element already has a blob: URL that may have been revoked, revoke it and recreate from known path
                const sourceElement = element.querySelector('source');
                let existingSrc = null;
                if (sourceElement && sourceElement.getAttribute('src')) existingSrc = sourceElement.getAttribute('src');
                if (!existingSrc && element.getAttribute('src')) existingSrc = element.getAttribute('src');
                if (existingSrc && existingSrc.startsWith('blob:')) {
                    try { URL.revokeObjectURL(existingSrc); } catch (e) { /* ignore */ }
                }

                const blob = await fs.readBinaryFile(dataPath);
                const url = URL.createObjectURL(blob);
                if (sequence !== null) {
                    MediaPlugin.mediaData[sequence] = url;
                } else {
                    MediaPlugin.mediaData.push(url);
                }

                const tag = element.tagName.toLowerCase();
                if (tag === 'img') {
                    element.setAttribute('src', url);
                    // Remove data attributes now that src is set
                    element.removeAttribute('data-media-path');
                    element.removeAttribute('data-media-src');
                    // prevent clicks on media controls from advancing slides
                    element.addEventListener('click', (e) => e.stopPropagation());
                } else if (tag === 'video' || tag === 'audio') {
                    const sourceElement = element.querySelector('source');
                    try { element.setAttribute('src', url); element.load(); } catch (e) { /* ignore */ }
                    // stop clicks on the media element from bubbling to slide handlers
                    element.addEventListener('click', (e) => { e.stopPropagation(); });
                } else if (tag === 'a') {
                    element.setAttribute('href', url);
                    element.addEventListener('click', (e) => e.stopPropagation());
                }
            } catch (e) {
                console.error('MediaPlugin failed to load media for', dataPath, e);
            }
        }
    },
};