class GorillaMediaRecorder {
    constructor() {
        this.video = null;
        this.videoContainer = null;
        this.timeline = null;
        this.waveformCanvas = null;
        this.waveformCtx = null;
        this.selection = null;
        this.playhead = null;
        this.isDraggingPlayhead = false;
        this.recorderIcons = {
            recordstop: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M448,256c0-106-86-192-192-192S64,150,64,256s86,192,192,192S448,362,448,256Z\" style=\"fill:none;stroke:red;stroke-miterlimit:10;stroke-width:32px\"/><path d=\"M310.4,336H201.6A25.62,25.62,0,0,1,176,310.4V201.6A25.62,25.62,0,0,1,201.6,176H310.4A25.62,25.62,0,0,1,336,201.6V310.4A25.62,25.62,0,0,1,310.4,336Z\" style=\"fill:red;\"/></svg>",
            record: "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path style=\"fill:red;\" d=\"M256,464C141.31,464,48,370.69,48,256S141.31,48,256,48s208,93.31,208,208S370.69,464,256,464Z\"/></svg>\n",

            play: "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M133,440a35.37,35.37,0,0,1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37,7.46-27.53,19.46-34.33a35.13,35.13,0,0,1,35.77.45L399.12,225.48a36,36,0,0,1,0,61L151.23,434.88A35.5,35.5,0,0,1,133,440Z\"/></svg>\n\n",

            pause: "\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><path d=\"M208,432H160a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V416A16,16,0,0,1,208,432Z\"/><path d=\"M352,432H304a16,16,0,0,1-16-16V96a16,16,0,0,1,16-16h48a16,16,0,0,1,16,16V416A16,16,0,0,1,352,432Z\"/></svg>\n"

        };
        this.currentState = 'IDLE';
        this.controlButtons = {};
        this.stateMachine = {
            IDLE: {
                enabledButtons: {
                    "undoBtn": true,
                    "playBtn": true,
                    "recordBtn": true,
                    "trimBtn": true,
                    "cutBtn": true,
                    "clearSelectionBtn": true,
                    "saveBtn": true,
                },
                images: {
                    "playBtn": this.recorderIcons.play,
                    "recordBtn": this.recorderIcons.record,
                }
            },
            RECORDING:
            {
                enabledButtons: {
                    "undoBtn": false,
                    "playBtn": false,
                    "recordBtn": true,
                    "trimBtn": false,
                    "cutBtn": false,
                    "clearSelectionBtn": false,
                    "saveBtn": false,
                },
                images: {
                    "recordBtn": this.recorderIcons.recordstop,
                }
            },
            PLAYING: {
                enabledButtons: {
                    "undoBtn": false,
                    "playBtn": true,
                    "recordBtn": false,
                    "trimBtn": false,
                    "cutBtn": false,
                    "clearSelectionBtn": false,
                    "saveBtn": false,
                },
                images: {
                    "playBtn": this.recorderIcons.pause,
                    "recordBtn": this.recorderIcons.record,
                }
            },
            TRIM: {
                enabledButtons: {
                    "undoBtn": false,
                    "playBtn": true,
                    "recordBtn": false,
                    "trimBtn": false,
                    "cutBtn": false,
                    "clearSelectionBtn": false,
                    "saveBtn": false,
                },
                images: {
                }
            },
            CUT: {
                enabledButtons: {
                    "undoBtn": false,
                    "playBtn": true,
                    "recordBtn": false,
                    "trimBtn": false,
                    "cutBtn": false,
                    "clearSelectionBtn": false,
                    "saveBtn": false,
                },
                images: {
                }
            },

        };
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.currentBlob = null;
        this.undoStack = [];
        this.isRecording = false;
        this.recordingMode = 'video';
        this.selectionStart = null;
        this.selectionEnd = null;
        this.isDragging = false;
        this.recordingStream = null;
        this.recordingStartTime = null;
        this.isBusy = false;

        this.onStatusChange = null;
        this.onUndoStateChange = null;
        this.onExportButtonUpdate = null;
        this.onBusyStateChange = null;

    }

    stateTransition(newState) {
        const stateParameters = GorillaRecorder.stateMachine[newState];
        if (!stateParameters) {
            console.error("Invalid state transition:", newState);
            return;
        }
        GorillaRecorder.currentState = newState;
        const buttons = stateParameters.enabledButtons;
        for (const buttonId in buttons) {
            const isEnabled = buttons[buttonId];
            let buttonElement = GorillaRecorder.controlButtons[buttonId];
            if (buttonElement) {
                buttonElement.disabled = !isEnabled;
            }
        }
        // Update button images
        const images = stateParameters.images;
        for (const buttonId in images) {
            const imageSvg = images[buttonId];
            const buttonElement = GorillaRecorder.controlButtons[buttonId];
            if (buttonElement) {
                buttonElement.innerHTML = imageSvg;
            }
        }
    }


    init(videoContainerSelector, timelineSelector) {
        GorillaRecorder.videoContainer = document.querySelector(videoContainerSelector);
        GorillaRecorder.timeline = document.querySelector(timelineSelector);

        if (!GorillaRecorder.videoContainer || !GorillaRecorder.timeline) {
            throw new Error('Video container or timeline not found');
        }

        // Create video element
        GorillaRecorder.video = document.createElement('video');
        GorillaRecorder.video.controls = false;
        GorillaRecorder.video.playsInline = true;
        GorillaRecorder.video.setAttribute('playsinline', '');
        GorillaRecorder.videoContainer.appendChild(GorillaRecorder.video);

        // Create recording indicator
        GorillaRecorder.recordingIndicator = document.createElement('div');
        GorillaRecorder.recordingIndicator.className = 'gorilla-media-recorder-recording-indicator';
        GorillaRecorder.recordingIndicator.innerHTML = '<span class="gorilla-media-recorder-recording-dot"></span>Recording in Progress...';
        GorillaRecorder.videoContainer.appendChild(GorillaRecorder.recordingIndicator);

        // Create waveform canvas
        GorillaRecorder.waveformCanvas = document.createElement('canvas');
        GorillaRecorder.timeline.appendChild(GorillaRecorder.waveformCanvas);
        GorillaRecorder.waveformCtx = GorillaRecorder.waveformCanvas.getContext('2d');

        // Create selection overlay
        GorillaRecorder.selection = document.createElement('div');
        GorillaRecorder.selection.className = 'gorilla-media-recorder-selection';
        GorillaRecorder.timeline.appendChild(GorillaRecorder.selection);

        // Create playhead
        GorillaRecorder.playhead = document.createElement('div');
        GorillaRecorder.playhead.className = 'gorilla-media-recorder-playhead';
        GorillaRecorder.timeline.appendChild(GorillaRecorder.playhead);

        // Set up event listeners
        GorillaRecorder.setupEventListeners();
        GorillaRecorder.resizeCanvas();

        return this;
    }
setupEventListeners() {
    // Video events
    GorillaRecorder.video.addEventListener('timeupdate', () => {
        if (!GorillaRecorder.isDraggingPlayhead) {
            GorillaRecorder.updatePlayhead();
        }

        if (GorillaRecorder.selectionStart !== null && GorillaRecorder.selectionEnd !== null && !GorillaRecorder.video.paused) {
            if (GorillaRecorder.video.currentTime >= GorillaRecorder.selectionEnd) {
                GorillaRecorder.video.pause();
                GorillaRecorder.stateTransition('IDLE');
                GorillaRecorder.video.currentTime = GorillaRecorder.selectionStart;
            }
        }
    });
    GorillaRecorder.video.addEventListener('ended', () => {
        GorillaRecorder.stateTransition('IDLE');
    });
    GorillaRecorder.video.onloadedmetadata = () => {
        GorillaRecorder.updatePlayhead();
        if (GorillaRecorder.video.duration && GorillaRecorder.video.duration !== Infinity && !isNaN(GorillaRecorder.video.duration)) {
            GorillaRecorder.setStatus('Media loaded. Duration: ' + GorillaRecorder.video.duration.toFixed(1) + 's');
        } else {
            GorillaRecorder.setStatus('Media loaded');
        }
    };

    GorillaRecorder.video.onerror = (e) => {
        console.error('Media error:', GorillaRecorder.video.error);
        GorillaRecorder.setStatus('Error loading media');
    };

    // Timeline events
    GorillaRecorder.timeline.onmousedown = (e) => GorillaRecorder.handleTimelineMouseDown(e);
    
    // Playhead drag events
    GorillaRecorder.playhead.onmousedown = (e) => {
        e.stopPropagation();
        GorillaRecorder.handlePlayheadMouseDown(e);
    };
    
    document.onmousemove = (e) => {
        GorillaRecorder.handleDocumentMouseMove(e);
        GorillaRecorder.handlePlayheadMouseMove(e);
    };
    document.onmouseup = () => {
        GorillaRecorder.handleDocumentMouseUp();
        GorillaRecorder.handlePlayheadMouseUp();
    };

    // Window resize
    window.addEventListener('resize', () => GorillaRecorder.resizeCanvas());
    GorillaRecorder.video.muted = false;
    const volumeSlider = document.getElementById('gorilla-media-recorder-volume-slider');

    volumeSlider.addEventListener('input', (e) => {
        GorillaRecorder.video.volume = e.target.value / 100;
    });
}

handlePlayheadMouseDown(e) {
    if (!GorillaRecorder.currentBlob || !GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) return;
    GorillaRecorder.isDraggingPlayhead = true;
    GorillaRecorder.playhead.style.cursor = 'grabbing';
}

handlePlayheadMouseMove(e) {
    if (!GorillaRecorder.isDraggingPlayhead || !GorillaRecorder.currentBlob) return;
    
    const rect = GorillaRecorder.timeline.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * GorillaRecorder.video.duration;
    
    GorillaRecorder.video.currentTime = newTime;
    GorillaRecorder.updatePlayhead();
    GorillaRecorder.setStatus(`Seek: ${newTime.toFixed(2)}s`);
}

handlePlayheadMouseUp() {
    if (GorillaRecorder.isDraggingPlayhead) {
        GorillaRecorder.isDraggingPlayhead = false;
        GorillaRecorder.playhead.style.cursor = 'grab';
        if (GorillaRecorder.video.currentTime !== null) {
            GorillaRecorder.setStatus(`Position: ${GorillaRecorder.video.currentTime.toFixed(2)}s`);
        }
    }
}
  handleTimelineMouseDown(e) {
    if (!GorillaRecorder.currentBlob || !GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) return;
    
    // Check if click is on playhead
    const playheadRect = GorillaRecorder.playhead.getBoundingClientRect();
    const clickX = e.clientX;
    
    // Give playhead a 10px tolerance on each side
    if (clickX >= playheadRect.left - 10 && clickX <= playheadRect.right + 10 && 
        GorillaRecorder.playhead.style.display !== 'none') {
        GorillaRecorder.handlePlayheadMouseDown(e);
        return;
    }
    
    // Otherwise, start region selection
    GorillaRecorder.isDragging = true;
    const rect = GorillaRecorder.timeline.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    GorillaRecorder.selectionStart = pos * GorillaRecorder.video.duration;
    GorillaRecorder.selectionEnd = GorillaRecorder.selectionStart;
    GorillaRecorder.updateSelection();
}

   handleDocumentMouseMove(e) {
    if (GorillaRecorder.isDraggingPlayhead) {
        GorillaRecorder.handlePlayheadMouseMove(e);
        return;
    }
    
    if (!GorillaRecorder.isDragging || !GorillaRecorder.currentBlob) return;
    const rect = GorillaRecorder.timeline.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    GorillaRecorder.selectionEnd = pos * GorillaRecorder.video.duration;
    GorillaRecorder.updateSelection();
}

    handleDocumentMouseUp() {
        if (GorillaRecorder.isDragging) {
            GorillaRecorder.isDragging = false;
            if (GorillaRecorder.selectionStart > GorillaRecorder.selectionEnd) {
                [GorillaRecorder.selectionStart, GorillaRecorder.selectionEnd] = [GorillaRecorder.selectionEnd, GorillaRecorder.selectionStart];
            }
            GorillaRecorder.updateSelection();
            if (GorillaRecorder.selectionStart !== null && GorillaRecorder.selectionEnd !== null) {
                GorillaRecorder.setStatus(`Selection: ${GorillaRecorder.selectionStart.toFixed(2)}s - ${GorillaRecorder.selectionEnd.toFixed(2)}s (${(GorillaRecorder.selectionEnd - GorillaRecorder.selectionStart).toFixed(2)}s)`);
            }
        }
    }

    setRecordingMode(mode) {
        GorillaRecorder.recordingMode = mode;
        GorillaRecorder.updateExportButton();
    }
    /* May put this back if clarification on copyright status of JS port of LAME is obtained 
    async convertToMp3(blob, bitrate = 128) {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const left = audioBuffer.getChannelData(0);
        const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

        const leftInt16 = new Int16Array(left.length);
        const rightInt16 = channels > 1 ? new Int16Array(right.length) : leftInt16;

        for (let i = 0; i < left.length; i++) {
            leftInt16[i] = Math.max(-1, Math.min(1, left[i])) * 32767;
            if (channels > 1) rightInt16[i] = Math.max(-1, Math.min(1, right[i])) * 32767;
        }

        const encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
        const mp3Data = [];
        const blockSize = 1152;

        for (let i = 0; i < leftInt16.length; i += blockSize) {
            const leftChunk = leftInt16.subarray(i, i + blockSize);
            const rightChunk = channels > 1 ? rightInt16.subarray(i, i + blockSize) : leftChunk;
            const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }

        const finalBuf = encoder.flush();
        if (finalBuf.length > 0) mp3Data.push(finalBuf);

        audioContext.close();
        return new Blob(mp3Data, { type: 'audio/mp3' });
    } */

    async saveRecording() {
        if (!GorillaRecorder.currentBlob) {
            GorillaAlert.show('No recording to save.');
            return;
        }
        let title = (GorillaPresenter.currentSlideNumber + 1) + ") " + document.getElementById("gorilla-slide-header-" + GorillaPresenter.currentSlideNumber).innerText.trim();
        let saveNameInfo = await GorillaMediaFilePrompt.prompt('Enter title for the recording:', title, true);
    
       
        if (!saveNameInfo) {
            return;
        }
        let rawName = saveNameInfo.value.trim();
        let saveName = "media/" + rawName;
        const finalBlob = GorillaRecorder.currentBlob;
        if (GorillaRecorder.currentBlob.type.startsWith('video/')) {
            rawName += ' (video recording)';
            if (!saveName.toLowerCase().endsWith('.webm')) {
                saveName += ' (video recording).webm';
                //finalBlob = GorillaRecorder.currentBlob;
            }
        } else if (GorillaRecorder.currentBlob.type.startsWith('audio/')) {
            rawName += ' (audio recording)';
           /* if (!saveName.toLowerCase().endsWith('.mp3')) {
                saveName += ' (audio recording).mp3';
                finalBlob = await GorillaRecorder.convertToMp3(GorillaRecorder.currentBlob);
            }*/
            if (!saveName.toLowerCase().endsWith('.webm')) {
                saveName += ' (audio recording).webm';
               // finalBlob = GorillaRecorder.currentBlob;
            }
        } else {
            GorillaAlert.show('Unsupported media type for saving.');
            return;
        }
        let addtoSlide = saveNameInfo.addtoSlide;
        if (addtoSlide === true) {
            let code = GorillaEditor.getCode();
            let rawslides = code.split(/^#\s/m);
            let currentSlide = rawslides[GorillaPresenter.currentSlideNumber + 1];

            let mediaString = "{{{media " + rawName + "}}}";
            if (currentSlide.indexOf(mediaString) === -1) {
                let currentLines = currentSlide.split('\n');
                currentLines.splice(1, 0, mediaString);
                rawslides[GorillaPresenter.currentSlideNumber + 1] = currentLines.join('\n');
            }
            code = rawslides.join("# ");
          
            GorillaEditor.updateCode(code);
            
            GorillaEditor.setCursorPosition(currentPosition.start + mediaString.length, currentPosition.start + mediaString.length);
        }
        await fs.writeBinaryFile(saveName, finalBlob);
        GorillaPresenter.updateSlideData();
        fs.zipModified = true;
        GorillaPresenter.markDirty(true);
        GorillaRecorder.setStatus('Recording saved as ' + saveName);

    }

    resizeCanvas() {
        GorillaRecorder.waveformCanvas.width = GorillaRecorder.timeline.offsetWidth;
        GorillaRecorder.waveformCanvas.height = GorillaRecorder.timeline.offsetHeight;
        if (GorillaRecorder.currentBlob) {
            GorillaRecorder.drawWaveform();
        }
    }

    async drawWaveform() {
        if (!GorillaRecorder.currentBlob) {
            console.log("no blob")
            return;
        }
        try {
            const audioContext = new AudioContext();
            const arrayBuffer = await GorillaRecorder.currentBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const width = GorillaRecorder.waveformCanvas.width;
            const height = GorillaRecorder.waveformCanvas.height;
            const data = audioBuffer.getChannelData(0);
            const step = Math.ceil(data.length / width);
            const amp = height / 2;

            GorillaRecorder.waveformCtx.fillStyle = '#090000ff';
            GorillaRecorder.waveformCtx.fillRect(0, 0, width, height);

            GorillaRecorder.waveformCtx.fillStyle = '#2ab02eff';
            GorillaRecorder.waveformCtx.strokeStyle = '#eaee15ff';
            GorillaRecorder.waveformCtx.lineWidth = 1;

            for (let i = 0; i < width; i++) {
                let min = 1.0;
                let max = -1.0;

                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }

                const yMin = (1 + min) * amp;
                const yMax = (1 + max) * amp;

                GorillaRecorder.waveformCtx.fillRect(i, yMin, 1, yMax - yMin);
            }

            audioContext.close();
        } catch (error) {
            console.error('Error drawing waveform:', error);
        }
    }

    updatePlayhead() {
        if (!GorillaRecorder.currentBlob || !GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) {
            GorillaRecorder.playhead.style.display = 'none';
            return;
        }

        GorillaRecorder.playhead.style.display = 'block';
        const percent = (GorillaRecorder.video.currentTime / GorillaRecorder.video.duration) * 100;
        GorillaRecorder.playhead.style.left = percent + '%';
    }

    updateSelection() {
        if (GorillaRecorder.selectionStart === null || GorillaRecorder.selectionEnd === null || !GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) {
            GorillaRecorder.selection.style.display = 'none';
            return;
        }
        const start = Math.min(GorillaRecorder.selectionStart, GorillaRecorder.selectionEnd);
        const end = Math.max(GorillaRecorder.selectionStart, GorillaRecorder.selectionEnd);
        const startPercent = (start / GorillaRecorder.video.duration) * 100;
        const widthPercent = ((end - start) / GorillaRecorder.video.duration) * 100;

        GorillaRecorder.selection.style.display = 'block';
        GorillaRecorder.selection.style.left = startPercent + '%';
        GorillaRecorder.selection.style.width = widthPercent + '%';
    }

    clearSelection() {
        GorillaRecorder.selectionStart = null;
        GorillaRecorder.selectionEnd = null;
        GorillaRecorder.selection.style.display = 'none';
        GorillaRecorder.setStatus('Selection cleared');
    }

    async loadNewBlob(blob, saveUndo = true) {
        if (saveUndo && GorillaRecorder.currentBlob) {
            GorillaRecorder.undoStack.push(GorillaRecorder.currentBlob);
            if (GorillaRecorder.undoStack.length > 10) {
                GorillaRecorder.undoStack.shift();
            }
            GorillaRecorder.updateUndoState();
        }

        GorillaRecorder.currentBlob = blob;

        GorillaRecorder.video.srcObject = null;

        if (GorillaRecorder.video.src && GorillaRecorder.video.src.startsWith('blob:')) {
            URL.revokeObjectURL(GorillaRecorder.video.src);
        }

        const url = URL.createObjectURL(blob);
        GorillaRecorder.video.src = url;
        GorillaRecorder.video.muted = false;

        return new Promise((resolve) => {
            GorillaRecorder.video.onloadedmetadata = () => {
                console.log('Video metadata loaded, duration:', GorillaRecorder.video.duration);
                GorillaRecorder.clearSelection();
                GorillaRecorder.drawWaveform();
                GorillaRecorder.updateExportButton();
                GorillaRecorder.updatePlayhead();
                resolve();
            };
            GorillaRecorder.video.load();
        });
    }

    async recordingHandler() {
        if (GorillaRecorder.currentState === 'RECORDING') {
            GorillaRecorder.stopRecording();
            GorillaRecorder.stateTransition('IDLE');
            return;
        }
        GorillaRecorder.stateTransition('RECORDING');
        try {
            const constraints = GorillaRecorder.recordingMode === 'video'
                ? { video: { width: 1280, height: 720 }, audio: true }
                : { audio: true };

            GorillaRecorder.recordingStream = await navigator.mediaDevices.getUserMedia(constraints);

            GorillaRecorder.recordedChunks = [];
            GorillaRecorder.recordingStartTime = Date.now();

            let mimeType;
            if (GorillaRecorder.recordingMode === 'video') {
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                    mimeType = 'video/webm;codecs=vp9,opus';
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                    mimeType = 'video/webm;codecs=vp8,opus';
                } else {
                    mimeType = 'video/webm';
                }
            } else {
                if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                    mimeType = 'audio/webm;codecs=opus';
                } else {
                    mimeType = 'audio/webm';
                }
            }

            GorillaRecorder.mediaRecorder = new MediaRecorder(GorillaRecorder.recordingStream, {
                mimeType: mimeType,
                videoBitsPerSecond: GorillaRecorder.recordingMode === 'video' ? 2500000 : undefined,
                audioBitsPerSecond: 128000
            });

            GorillaRecorder.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    GorillaRecorder.recordedChunks.push(e.data);
                }
            };

            GorillaRecorder.mediaRecorder.onstop = async () => {
                if (GorillaRecorder.recordedChunks.length === 0) {
                    alert('No data was recorded. Please try again.');
                    GorillaRecorder.recordingStream.getTracks().forEach(track => track.stop());
                    GorillaRecorder.recordingIndicator.classList.remove('gorilla-media-recorder-active');
                    return;
                }

                const originalBlob = new Blob(GorillaRecorder.recordedChunks, { type: mimeType });
                const duration = GorillaRecorder.mediaRecorder._recordingDuration || 1000;
                const fixedBlob = await ysFixWebmDuration(originalBlob, duration);

                GorillaRecorder.recordingStream.getTracks().forEach(track => track.stop());
                GorillaRecorder.recordingStream = null;

                // Hide recording indicator
                GorillaRecorder.recordingIndicator.classList.remove('gorilla-media-recorder-active');

                GorillaRecorder.undoStack = [];
                GorillaRecorder.updateUndoState();

                await GorillaRecorder.loadNewBlob(fixedBlob, false);

                GorillaRecorder.setStatus(`${GorillaRecorder.recordingMode === 'video' ? 'Video' : 'Audio'} recording complete`);
            };

            GorillaRecorder.mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                alert('Recording error occurred');
            };

            GorillaRecorder.mediaRecorder.start(1000);
            GorillaRecorder.isRecording = true;

            if (GorillaRecorder.recordingMode === 'video') {
                GorillaRecorder.video.srcObject = GorillaRecorder.recordingStream;
                GorillaRecorder.video.muted = true;
                GorillaRecorder.video.play();
                // Show live preview for video
                GorillaRecorder.recordingIndicator.classList.remove('gorilla-media-recorder-active');
            } else {
                GorillaRecorder.video.srcObject = null;
                GorillaRecorder.videoContainer.style.display = 'none';
            }

            // Show recording indicator
            GorillaRecorder.recordingIndicator.classList.add('gorilla-media-recorder-active');

            GorillaRecorder.setStatus(`Recording ${GorillaRecorder.recordingMode}...`);
            return true;
        } catch (error) {
            console.error('Error accessing media:', error);
            alert(`Failed to access ${GorillaRecorder.recordingMode === 'video' ? 'camera/microphone' : 'microphone'}. Please check permissions.`);
            return false;
        }
    }

    async stopRecording() {
        if (GorillaRecorder.currentState !== 'RECORDING') {
            return;
        }
        GorillaRecorder.stateTransition('IDLE')
        const recordingDuration = Date.now() - GorillaRecorder.recordingStartTime;

        GorillaRecorder.mediaRecorder.requestData();
        await new Promise(resolve => setTimeout(resolve, 100));
        GorillaRecorder.mediaRecorder.stop();
        GorillaRecorder.videoContainer.style.display = 'block';

        GorillaRecorder.isRecording = false;
        GorillaRecorder.setStatus('Recording stopped, processing...');
        GorillaRecorder.mediaRecorder._recordingDuration = recordingDuration;
    }

    playHandler() {
        const playBtn = GorillaRecorder.controlButtons['playBtn'];
        if (GorillaRecorder.selectionStart !== null && GorillaRecorder.selectionEnd !== null) {
            if (GorillaRecorder.video.paused || GorillaRecorder.video.currentTime < GorillaRecorder.selectionStart || GorillaRecorder.video.currentTime >= GorillaRecorder.selectionEnd) {
                GorillaRecorder.stateTransition('PLAYING');
                GorillaRecorder.video.currentTime = GorillaRecorder.selectionStart;
                GorillaRecorder.video.play();
            } else {
                GorillaRecorder.video.pause();
                GorillaRecorder.stateTransition('IDLE');
            }
        } else {
            if (GorillaRecorder.video.paused) {
                playBtn.innerHTML = GorillaRecorder.recorderIcons.pause;
                GorillaRecorder.video.play();
                GorillaRecorder.stateTransition('PLAYING');
            } else {
                GorillaRecorder.video.pause();
                playBtn.innerHTML = GorillaRecorder.recorderIcons.play;
                GorillaRecorder.stateTransition('IDLE');
            }
        }
    }

    async trim() {

        if (!GorillaRecorder.currentBlob || GorillaRecorder.selectionStart === null || GorillaRecorder.selectionEnd === null) {
            alert('Please select a region first');
            return;
        }
        if (!GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) {
            alert('Cannot edit: duration is invalid. Try re-recording.');
            return;
        }
        GorillaRecorder.stateTransition('TRIM');
        GorillaRecorder.setStatus('Trimming...');
        await GorillaRecorder.processMedia('trim')
        GorillaRecorder.stateTransition('IDLE');
    }

    async cut() {
        if (!GorillaRecorder.currentBlob || GorillaRecorder.selectionStart === null || GorillaRecorder.selectionEnd === null) {
            alert('Please select a region first');
            return;
        }
        if (!GorillaRecorder.video.duration || GorillaRecorder.video.duration === Infinity) {
            alert('Cannot edit: duration is invalid. Try re-recording.');
            return;
        }
        GorillaRecorder.stateTransition('CUT');
        GorillaRecorder.setStatus('Cutting...');
        await GorillaRecorder.processMedia('cut');
        GorillaRecorder.stateTransition('IDLE');
    }

    async undo() {
        if (GorillaRecorder.undoStack.length > 0) {
            const previousBlob = GorillaRecorder.undoStack.pop();
            await GorillaRecorder.loadNewBlob(previousBlob, false);
            GorillaRecorder.updateUndoState();
            GorillaRecorder.setStatus('Undo successful');
        }
    }

    canUndo() {
        return GorillaRecorder.undoStack.length > 0;
    }

    async processMedia(mode) {
        const isVideo = GorillaRecorder.currentBlob.type.startsWith('video/');
        if (!isVideo) {
            await GorillaRecorder.processAudio(mode);
        } else {
            await GorillaRecorder.processVideo(mode);
        }
    }

    async processAudio(mode) {
        try {
            const audioContext = new AudioContext();
            const arrayBuffer = await GorillaRecorder.currentBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const sampleRate = audioBuffer.sampleRate;
            const numberOfChannels = audioBuffer.numberOfChannels;

            let newBuffer;
            if (mode === 'trim') {
                const startSample = Math.floor(GorillaRecorder.selectionStart * sampleRate);
                const endSample = Math.floor(GorillaRecorder.selectionEnd * sampleRate);
                const length = endSample - startSample;

                newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
                for (let ch = 0; ch < numberOfChannels; ch++) {
                    newBuffer.getChannelData(ch).set(
                        audioBuffer.getChannelData(ch).subarray(startSample, endSample)
                    );
                }
            } else {
                const startSample = Math.floor(GorillaRecorder.selectionStart * sampleRate);
                const endSample = Math.floor(GorillaRecorder.selectionEnd * sampleRate);
                const length = audioBuffer.length - (endSample - startSample);

                newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
                for (let ch = 0; ch < numberOfChannels; ch++) {
                    const channelData = newBuffer.getChannelData(ch);
                    const sourceData = audioBuffer.getChannelData(ch);
                    channelData.set(sourceData.subarray(0, startSample), 0);
                    channelData.set(sourceData.subarray(endSample), startSample);
                }
            }

            const offlineContext = new OfflineAudioContext(numberOfChannels, newBuffer.length, sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = newBuffer;
            source.connect(offlineContext.destination);
            source.start();

            const renderedBuffer = await offlineContext.startRendering();

            const destination = audioContext.createMediaStreamDestination();
            const playbackSource = audioContext.createBufferSource();
            playbackSource.buffer = renderedBuffer;
            playbackSource.connect(destination);

            const mimeType = 'audio/webm;codecs=opus';
            const recorder = new MediaRecorder(destination.stream, { mimeType, audioBitsPerSecond: 128000 });

            const chunks = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            const recordStartTime = Date.now();


            recorder.onstop = async () => {
                const duration = Date.now() - recordStartTime;
                const originalBlob = new Blob(chunks, { type: 'audio/webm' });
                const fixedBlob = await ysFixWebmDuration(originalBlob, duration);

                await GorillaRecorder.loadNewBlob(fixedBlob, true);
                audioContext.close();
                GorillaRecorder.setStatus(mode === 'trim' ? 'Trim complete' : 'Cut complete');
            };

            recorder.start();
            playbackSource.start();

            setTimeout(() => {
                recorder.stop();
            }, (renderedBuffer.duration * 1000) + 100);

        } catch (error) {
            console.error('Error processing audio:', error);
            alert('Error processing audio: ' + error.message);
        }
    }

    async processVideo(mode) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const tempVideo = document.createElement('video');
        tempVideo.crossOrigin = 'anonymous';
        tempVideo.src = URL.createObjectURL(GorillaRecorder.currentBlob);

        await new Promise(resolve => {
            tempVideo.onloadedmetadata = resolve;
        });

        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;

        const canvasStream = canvas.captureStream(30);
        const videoTrack = canvasStream.getVideoTracks()[0];

        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(tempVideo);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);

        const audioTrack = destination.stream.getAudioTracks()[0];
        const combinedStream = new MediaStream([videoTrack, audioTrack]);

        let mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
        }

        const newRecorder = new MediaRecorder(combinedStream, {
            mimeType: mimeType,
            videoBitsPerSecond: 2500000,
            audioBitsPerSecond: 128000
        });

        const chunks = [];
        const startTime = Date.now();

        newRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        newRecorder.onstop = async () => {
            const duration = Date.now() - startTime;
            const originalBlob = new Blob(chunks, { type: 'video/webm' });
            const fixedBlob = await ysFixWebmDuration(originalBlob, duration);

            audioContext.close();
            await GorillaRecorder.loadNewBlob(fixedBlob, true);
            GorillaRecorder.setStatus(mode === 'trim' ? 'Trim complete' : 'Cut complete');
        };

        newRecorder.start(1000);
        tempVideo.muted = false;

        if (mode === 'trim') {
            tempVideo.currentTime = GorillaRecorder.selectionStart;
            await new Promise(resolve => {
                tempVideo.onseeked = resolve;
            });
            tempVideo.play();

            const drawFrame = () => {
                if (tempVideo.currentTime >= GorillaRecorder.selectionEnd) {
                    newRecorder.stop();
                    tempVideo.pause();
                    return;
                }
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(drawFrame);
            };
            drawFrame();

        } else {
            // Cut mode
            let isRecordingPhase1 = true;
            let hasStartedPhase2 = false;

            // Set up the seek handler FIRST before any seeks happen
            tempVideo.onseeked = () => {
                if (!isRecordingPhase1 && !hasStartedPhase2) {
                    hasStartedPhase2 = true;
                    // Check if there's actually content after selectionEnd
                    if (GorillaRecorder.selectionEnd >= tempVideo.duration - 0.1) {
                        // Nothing to record in phase 2, we're done
                        newRecorder.stop();
                        tempVideo.pause();
                    } else {
                        tempVideo.play();
                        requestAnimationFrame(drawFrame);
                    }
                }
            };

            tempVideo.currentTime = 0;
            await new Promise(resolve => setTimeout(resolve, 50));

            tempVideo.play();

            const drawFrame = () => {
                if (isRecordingPhase1) {
                    if (tempVideo.currentTime >= GorillaRecorder.selectionStart) {
                        // End phase 1, start seeking to phase 2
                        isRecordingPhase1 = false;
                        tempVideo.pause();
                        tempVideo.currentTime = GorillaRecorder.selectionEnd;
                        // Don't call drawFrame here - let onseeked handle it
                        return;
                    }
                } else if (hasStartedPhase2) {
                    // Phase 2: recording from selectionEnd to end
                    if (tempVideo.currentTime >= tempVideo.duration - 0.1) {
                        newRecorder.stop();
                        tempVideo.pause();
                        return;
                    }
                } else {
                    // Waiting for seek to complete, don't draw
                    requestAnimationFrame(drawFrame);
                    return;
                }

                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(drawFrame);
            };

            drawFrame();
        }
    }

    async exportMedia() {
        if (!GorillaRecorder.currentBlob) {
            alert('No media to export');
            return;
        }

        const isVideo = GorillaRecorder.currentBlob.type.startsWith('video/');

        if (isVideo) {
            const url = URL.createObjectURL(GorillaRecorder.currentBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-video.webm';
            a.click();
            GorillaRecorder.setStatus('Video exported as WebM');
        } else {
            GorillaRecorder.setStatus('Converting to MP3...');
            try {
                const mp3Blob = await GorillaRecorder.convertToMp3(GorillaRecorder.currentBlob);
                const url = URL.createObjectURL(mp3Blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'edited-audio.mp3';
                a.click();
                GorillaRecorder.setStatus('Audio exported as MP3');
            } catch (error) {
                console.error('Error converting to MP3:', error);
                alert('Error converting to MP3: ' + error.message);
            }
        }
    }

    async convertToMp3(blob, bitrate = 128) {
        const audioContext = new AudioContext();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const left = audioBuffer.getChannelData(0);
        const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

        const leftInt16 = new Int16Array(left.length);
        const rightInt16 = channels > 1 ? new Int16Array(right.length) : leftInt16;

        for (let i = 0; i < left.length; i++) {
            leftInt16[i] = Math.max(-1, Math.min(1, left[i])) * 32767;
            if (channels > 1) rightInt16[i] = Math.max(-1, Math.min(1, right[i])) * 32767;
        }

        const encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
        const mp3Data = [];
        const blockSize = 1152;

        for (let i = 0; i < leftInt16.length; i += blockSize) {
            const leftChunk = leftInt16.subarray(i, i + blockSize);
            const rightChunk = channels > 1 ? rightInt16.subarray(i, i + blockSize) : leftChunk;
            const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }

        const finalBuf = encoder.flush();
        if (finalBuf.length > 0) mp3Data.push(finalBuf);

        audioContext.close();
        return new Blob(mp3Data, { type: 'audio/mp3' });
    }

    setStatus(msg) {
        if (GorillaRecorder.onStatusChange) {
            GorillaRecorder.onStatusChange(msg);
        }
    }



    updateUndoState() {
        if (GorillaRecorder.onUndoStateChange) {
            GorillaRecorder.onUndoStateChange(GorillaRecorder.canUndo());
        }
    }

    updateExportButton() {
        if (GorillaRecorder.onExportButtonUpdate) {
            const isVideo = GorillaRecorder.currentBlob ? GorillaRecorder.currentBlob.type.startsWith('video/') : GorillaRecorder.recordingMode === 'video';
            GorillaRecorder.onExportButtonUpdate(isVideo);
        }
    }
}

// Initialize
const GorillaRecorder = new GorillaMediaRecorder();
GorillaRecorder.init('#gorilla-media-recorder-video-container', '#gorilla-media-recorder-timeline');

// Get UI elements
const statusDiv = document.getElementById('gorilla-media-recorder-status');
const undoBtn = document.getElementById('gorilla-media-recorder-undo');
GorillaRecorder.controlButtons['undoBtn'] = undoBtn;
const playBtn = document.getElementById('gorilla-media-recorder-play');
GorillaRecorder.controlButtons['playBtn'] = playBtn;
const recordBtn = document.getElementById('gorilla-media-recorder-record');
GorillaRecorder.controlButtons['recordBtn'] = recordBtn;
const trimBtn = document.getElementById('gorilla-media-recorder-trim');
GorillaRecorder.controlButtons['trimBtn'] = trimBtn;
const cutBtn = document.getElementById('gorilla-media-recorder-cut');
GorillaRecorder.controlButtons['cutBtn'] = cutBtn;
const clearSelectionBtn = document.getElementById('gorilla-media-recorder-clear-selection');
GorillaRecorder.controlButtons['clearSelectionBtn'] = clearSelectionBtn;
const saveBtn = document.getElementById('gorilla-media-recorder-save-recording');
GorillaRecorder.controlButtons['saveBtn'] = saveBtn;
const modeRadios = document.querySelectorAll('input[name="gorilla-media-recorder-mode"]');
const browserWarning = document.getElementById('gorilla-media-recorder-browser-warning');

// Set up callbacks
GorillaRecorder.onStatusChange = (msg) => {
    statusDiv.textContent = msg;
};

GorillaRecorder.onUndoStateChange = (canUndo) => {
    undoBtn.disabled = !canUndo;
};

GorillaRecorder.onExportButtonUpdate = (isVideo) => {
    // exportBtn.textContent = isVideo ? 'Export Video (WebM)' : 'Export Audio (MP3)';
};
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        GorillaRecorder.setRecordingMode(e.target.value);
    });
});

// Browser compatibility check
function checkBrowserSupport() {
    const testVideo = document.createElement('video');
    const canPlayWebM = testVideo.canPlayType('video/webm; codecs="vp8, opus"');

    const isOldSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
        !canPlayWebM;

    const isIE = /MSIE|Trident/.test(navigator.userAgent);

    if (isIE) {
        browserWarning.className = 'gorilla-media-recorder-error';
        browserWarning.innerHTML = '❌ <strong>Internet Explorer is not supported.</strong> Please use a modern browser like Chrome, Firefox, Edge, or Safari.';
        browserWarning.classList.remove('gorilla-media-recorder-hidden');
        document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        return false;
    }

    if (isOldSafari) {
        browserWarning.className = 'gorilla-media-recorder-warning';
        browserWarning.innerHTML = '⚠️ <strong>Limited Safari Support:</strong> Your version of Safari may not support WebM playback. Please update to macOS Big Sur (2020) or iOS 14.5+ for full compatibility, or use Chrome/Firefox.';
        browserWarning.classList.remove('gorilla-media-recorder-hidden');
        return true;
    }

    if (!canPlayWebM) {
        browserWarning.className = 'gorilla-media-recorder-warning';
        browserWarning.innerHTML = '⚠️ <strong>WebM Support Uncertain:</strong> Your browser may have limited support for WebM. Consider using Chrome, Firefox, or Edge.';
        browserWarning.classList.remove('gorilla-media-recorder-hidden');
        return true;
    }

    if (!window.MediaRecorder) {
        browserWarning.className = 'gorilla-media-recorder-error';
        browserWarning.innerHTML = '❌ <strong>Recording not supported:</strong> Your browser does not support recording. Please use a modern browser.';
        browserWarning.classList.remove('gorilla-media-recorder-hidden');
        return false;
    }

    return true;
}

checkBrowserSupport();