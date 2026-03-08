class GorillaImageEditorClass {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.textLayer = null;
        this.canvasContainer = null;
        this.currentTool = 'draw';
        this.strokeColor = '#000000';
        this.strokeAlpha = 1.0;
        this.fillColor = '#ffffff';
        this.fillAlpha = 1.0;
        this.fillEnabled = false;
        this.brushSize = 3;
        this.fontSize = 24;
        this.fontFamily = 'sans-serif';
        this.fontBold = false;
        this.fontItalic = false;
        this.brightness = 0;
        this.contrast = 0;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndo = 50;
        this.loadedFileName = null;
        this.originalImageData = null;
        this.previewCanvas = null;
        // Crop state
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.cropEndX = 0;
        this.cropEndY = 0;
        this.isCropping = false;
        // Shape preview
        this.shapePreviewCanvas = null;
        this.shapePreviewCtx = null;
        this.zoomLevel = 100;
        this.isEditingText = false;
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    getStrokeColor() {
        return GorillaImageEditor.hexToRgba(GorillaImageEditor.strokeColor, GorillaImageEditor.strokeAlpha);
    }

    getFillColor() {
        return GorillaImageEditor.hexToRgba(GorillaImageEditor.fillColor, GorillaImageEditor.fillAlpha);
    }

    init() {
        GorillaImageEditor.canvas = document.getElementById('gorilla-image-editor-canvas');
        GorillaImageEditor.ctx = GorillaImageEditor.canvas.getContext('2d');
        GorillaImageEditor.textLayer = document.getElementById('gorilla-image-editor-text-layer');
        GorillaImageEditor.canvasContainer = document.getElementById('gorilla-image-editor-canvas-container');

        // Create an overlay canvas for shape previews
        GorillaImageEditor.shapePreviewCanvas = document.createElement('canvas');
        GorillaImageEditor.shapePreviewCanvas.id = 'gorilla-image-editor-shape-preview';
        GorillaImageEditor.shapePreviewCanvas.style.position = 'absolute';
        GorillaImageEditor.shapePreviewCanvas.style.top = '0';
        GorillaImageEditor.shapePreviewCanvas.style.left = '0';
        GorillaImageEditor.shapePreviewCanvas.style.pointerEvents = 'none';
        GorillaImageEditor.canvasContainer.appendChild(GorillaImageEditor.shapePreviewCanvas);
        GorillaImageEditor.shapePreviewCtx = GorillaImageEditor.shapePreviewCanvas.getContext('2d');

        GorillaImageEditor.setupEventListeners();
        // Default blank canvas
        GorillaImageEditor.newCanvas(800, 600);
    }

    setupEventListeners() {
        const canvas = GorillaImageEditor.canvas;

        // Tool selector
        document.getElementById('gorilla-image-editor-tool-select').addEventListener('change', (e) => {
            GorillaImageEditor.currentTool = e.target.value;
            const textGroup = document.getElementById('gorilla-image-editor-text-group');
            textGroup.style.display = (e.target.value === 'text') ? '' : 'none';
            canvas.style.cursor = GorillaImageEditor.getCursorForTool(e.target.value);
        });

        // Color pickers
        document.getElementById('gorilla-image-editor-color').addEventListener('input', (e) => {
            GorillaImageEditor.strokeColor = e.target.value;
        });
        const strokeAlphaSlider = document.getElementById('gorilla-image-editor-stroke-alpha');
        const strokeAlphaLabel = document.getElementById('gorilla-image-editor-stroke-alpha-label');
        strokeAlphaSlider.addEventListener('input', (e) => {
            GorillaImageEditor.strokeAlpha = parseInt(e.target.value) / 100;
            strokeAlphaLabel.textContent = e.target.value + '%';
        });
        document.getElementById('gorilla-image-editor-fill-color').addEventListener('input', (e) => {
            GorillaImageEditor.fillColor = e.target.value;
        });
        const fillAlphaSlider = document.getElementById('gorilla-image-editor-fill-alpha');
        const fillAlphaLabel = document.getElementById('gorilla-image-editor-fill-alpha-label');
        fillAlphaSlider.addEventListener('input', (e) => {
            GorillaImageEditor.fillAlpha = parseInt(e.target.value) / 100;
            fillAlphaLabel.textContent = e.target.value + '%';
        });
        document.getElementById('gorilla-image-editor-fill-enabled').addEventListener('change', (e) => {
            GorillaImageEditor.fillEnabled = e.target.checked;
        });

        // Brush size
        const brushSlider = document.getElementById('gorilla-image-editor-brush-size');
        const brushLabel = document.getElementById('gorilla-image-editor-brush-size-label');
        brushSlider.addEventListener('input', (e) => {
            GorillaImageEditor.brushSize = parseInt(e.target.value);
            brushLabel.textContent = e.target.value;
            GorillaImageEditor.updateCursor();
        });

        // Font controls
        document.getElementById('gorilla-image-editor-font-size').addEventListener('input', (e) => {
            GorillaImageEditor.fontSize = parseInt(e.target.value);
        });
        document.getElementById('gorilla-image-editor-font-family').addEventListener('change', (e) => {
            GorillaImageEditor.fontFamily = e.target.value;
        });
        document.getElementById('gorilla-image-editor-font-bold').addEventListener('change', (e) => {
            GorillaImageEditor.fontBold = e.target.checked;
        });
        document.getElementById('gorilla-image-editor-font-italic').addEventListener('change', (e) => {
            GorillaImageEditor.fontItalic = e.target.checked;
        });

        // Brightness/Contrast
        document.getElementById('gorilla-image-editor-brightness').addEventListener('input', (e) => {
            GorillaImageEditor.brightness = parseInt(e.target.value);
            GorillaImageEditor.applyAdjustments();
        });
        document.getElementById('gorilla-image-editor-contrast').addEventListener('input', (e) => {
            GorillaImageEditor.contrast = parseInt(e.target.value);
            GorillaImageEditor.applyAdjustments();
        });

        // Canvas mouse/touch events
        canvas.addEventListener('mousedown', GorillaImageEditor.handlePointerDown);
        canvas.addEventListener('mousemove', GorillaImageEditor.handlePointerMove);
        canvas.addEventListener('mouseup', GorillaImageEditor.handlePointerUp);
        canvas.addEventListener('mouseleave', GorillaImageEditor.handlePointerUp);

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            GorillaImageEditor.handlePointerDown(GorillaImageEditor.touchToMouse(touch));
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            GorillaImageEditor.handlePointerMove(GorillaImageEditor.touchToMouse(touch));
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            GorillaImageEditor.handlePointerUp(e);
        }, { passive: false });

        // Keyboard shortcuts: Ctrl/Cmd+Z for undo, Ctrl/Cmd+Shift+Z for redo
        document.addEventListener('keydown', (e) => {
            const screen = document.getElementById('gorilla-image-editor-screen');
            if (!screen || screen.style.display === 'none') return;
            // Don't intercept when editing text inside a text element
            if (document.activeElement && document.activeElement.contentEditable === 'true') return;
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                GorillaImageEditor.undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                GorillaImageEditor.redo();
            }
        });

        // Zoom slider
        const zoomSlider = document.getElementById('gorilla-image-editor-zoom');
        const zoomLabel = document.getElementById('gorilla-image-editor-zoom-label');
        zoomSlider.addEventListener('input', (e) => {
            GorillaImageEditor.zoomLevel = parseInt(e.target.value);
            zoomLabel.textContent = e.target.value + '%';
            GorillaImageEditor.applyZoom();
            GorillaImageEditor.updateCursor();
        });
    }

    touchToMouse(touch) {
        const rect = GorillaImageEditor.canvas.getBoundingClientRect();
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        };
    }

    getCursorForTool(tool) {
        switch (tool) {
            case 'draw':
            case 'line':
                return GorillaImageEditor.buildCircleCursor();
            case 'rect': return 'crosshair';
            case 'ellipse': return 'crosshair';
            case 'eraser': return 'cell';
            case 'text': return 'text';
            case 'crop': return 'crosshair';
            default: return 'default';
        }
    }

    buildCircleCursor() {
        const zoom = GorillaImageEditor.zoomLevel / 100;
        const diameter = Math.max(Math.round(GorillaImageEditor.brushSize * zoom), 2);
        // Canvas cursor images have a max size of 128px in most browsers
        const size = Math.min(diameter + 2, 128);
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;
        const r = Math.max((diameter - 1) / 2, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r + 0.5, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        const hot = Math.round(size / 2);
        return 'url(' + c.toDataURL() + ') ' + hot + ' ' + hot + ', crosshair';
    }

    updateCursor() {
        const tool = GorillaImageEditor.currentTool;
        GorillaImageEditor.canvas.style.cursor = GorillaImageEditor.getCursorForTool(tool);
    }

    getCanvasCoords(e) {
        const rect = GorillaImageEditor.canvas.getBoundingClientRect();
        const scaleX = GorillaImageEditor.canvas.width / rect.width;
        const scaleY = GorillaImageEditor.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handlePointerDown(e) {
        const coords = GorillaImageEditor.getCanvasCoords(e);
        GorillaImageEditor.isDrawing = true;
        GorillaImageEditor.startX = coords.x;
        GorillaImageEditor.startY = coords.y;
        GorillaImageEditor.lastX = coords.x;
        GorillaImageEditor.lastY = coords.y;

        if (GorillaImageEditor.currentTool === 'draw' || GorillaImageEditor.currentTool === 'eraser') {
            GorillaImageEditor.saveUndoState();
            // Draw freehand strokes on the preview canvas to avoid alpha stacking
            const pc = GorillaImageEditor.shapePreviewCanvas;
            const pctx = GorillaImageEditor.shapePreviewCtx;
            pc.width = GorillaImageEditor.canvas.width;
            pc.height = GorillaImageEditor.canvas.height;
            pctx.clearRect(0, 0, pc.width, pc.height);
            pctx.beginPath();
            pctx.moveTo(coords.x, coords.y);
        } else if (GorillaImageEditor.currentTool === 'text') {
            GorillaImageEditor.isDrawing = false;
            // Don't create a new text block if we just exited text editing
            if (GorillaImageEditor.isEditingText) return;
            GorillaImageEditor.addTextElement(coords.x, coords.y);
        } else if (GorillaImageEditor.currentTool === 'crop') {
            GorillaImageEditor.cropStartX = coords.x;
            GorillaImageEditor.cropStartY = coords.y;
            GorillaImageEditor.isCropping = true;
        } else {
            // Shape tools: save state before drawing
            GorillaImageEditor.saveUndoState();
        }
    }

    handlePointerMove(e) {
        if (!GorillaImageEditor.isDrawing) return;
        const coords = GorillaImageEditor.getCanvasCoords(e);
        const tool = GorillaImageEditor.currentTool;

        if (tool === 'draw') {
            const pctx = GorillaImageEditor.shapePreviewCtx;
            pctx.strokeStyle = GorillaImageEditor.strokeColor; // full opacity hex
            pctx.lineWidth = GorillaImageEditor.brushSize;
            pctx.lineCap = 'round';
            pctx.lineJoin = 'round';
            pctx.lineTo(coords.x, coords.y);
            pctx.stroke();
            // Continue the path so next segment connects
            pctx.beginPath();
            pctx.moveTo(coords.x, coords.y);
        } else if (tool === 'eraser') {
            const pctx = GorillaImageEditor.shapePreviewCtx;
            pctx.strokeStyle = '#ffffff';
            pctx.lineWidth = GorillaImageEditor.brushSize * 3;
            pctx.lineCap = 'round';
            pctx.lineJoin = 'round';
            pctx.lineTo(coords.x, coords.y);
            pctx.stroke();
            pctx.beginPath();
            pctx.moveTo(coords.x, coords.y);
        } else if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
            GorillaImageEditor.drawShapePreview(coords.x, coords.y);
        } else if (tool === 'crop' && GorillaImageEditor.isCropping) {
            GorillaImageEditor.cropEndX = coords.x;
            GorillaImageEditor.cropEndY = coords.y;
            GorillaImageEditor.drawCropPreview();
        }

        GorillaImageEditor.lastX = coords.x;
        GorillaImageEditor.lastY = coords.y;
    }

    handlePointerUp(e) {
        if (!GorillaImageEditor.isDrawing) return;
        GorillaImageEditor.isDrawing = false;
        const tool = GorillaImageEditor.currentTool;

        if (tool === 'draw' || tool === 'eraser') {
            // Composite the preview stroke onto the main canvas with alpha
            const ctx = GorillaImageEditor.ctx;
            ctx.save();
            if (tool === 'draw') {
                ctx.globalAlpha = GorillaImageEditor.strokeAlpha;
            } else {
                ctx.globalAlpha = 1.0;
            }
            ctx.drawImage(GorillaImageEditor.shapePreviewCanvas, 0, 0);
            ctx.restore();
            GorillaImageEditor.clearShapePreview();
        } else if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
            // Draw final shape onto main canvas
            let coords;
            if (e.clientX !== undefined) {
                coords = GorillaImageEditor.getCanvasCoords(e);
            } else {
                coords = { x: GorillaImageEditor.lastX, y: GorillaImageEditor.lastY };
            }
            GorillaImageEditor.drawShape(tool, GorillaImageEditor.startX, GorillaImageEditor.startY, coords.x, coords.y);
            GorillaImageEditor.clearShapePreview();
        } else if (tool === 'crop' && GorillaImageEditor.isCropping) {
            GorillaImageEditor.isCropping = false;
            GorillaImageEditor.clearShapePreview();
            GorillaImageEditor.applyCrop();
        }
    }

    drawShapePreview(endX, endY) {
        const pc = GorillaImageEditor.shapePreviewCanvas;
        const pctx = GorillaImageEditor.shapePreviewCtx;
        pc.width = GorillaImageEditor.canvas.width;
        pc.height = GorillaImageEditor.canvas.height;
        pctx.clearRect(0, 0, pc.width, pc.height);

        pctx.strokeStyle = GorillaImageEditor.getStrokeColor();
        pctx.lineWidth = GorillaImageEditor.brushSize;
        pctx.lineCap = 'round';

        const tool = GorillaImageEditor.currentTool;
        const sx = GorillaImageEditor.startX;
        const sy = GorillaImageEditor.startY;

        if (tool === 'line') {
            pctx.beginPath();
            pctx.moveTo(sx, sy);
            pctx.lineTo(endX, endY);
            pctx.stroke();
        } else if (tool === 'rect') {
            if (GorillaImageEditor.fillEnabled) {
                pctx.fillStyle = GorillaImageEditor.getFillColor();
                pctx.fillRect(sx, sy, endX - sx, endY - sy);
            }
            pctx.strokeRect(sx, sy, endX - sx, endY - sy);
        } else if (tool === 'ellipse') {
            const cx = (sx + endX) / 2;
            const cy = (sy + endY) / 2;
            const rx = Math.abs(endX - sx) / 2;
            const ry = Math.abs(endY - sy) / 2;
            pctx.beginPath();
            pctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            if (GorillaImageEditor.fillEnabled) {
                pctx.fillStyle = GorillaImageEditor.getFillColor();
                pctx.fill();
            }
            pctx.stroke();
        }
    }

    drawCropPreview() {
        const pc = GorillaImageEditor.shapePreviewCanvas;
        const pctx = GorillaImageEditor.shapePreviewCtx;
        pc.width = GorillaImageEditor.canvas.width;
        pc.height = GorillaImageEditor.canvas.height;
        pctx.clearRect(0, 0, pc.width, pc.height);

        // Dim outside crop area
        pctx.fillStyle = 'rgba(0,0,0,0.5)';
        pctx.fillRect(0, 0, pc.width, pc.height);

        const x = Math.min(GorillaImageEditor.cropStartX, GorillaImageEditor.cropEndX);
        const y = Math.min(GorillaImageEditor.cropStartY, GorillaImageEditor.cropEndY);
        const w = Math.abs(GorillaImageEditor.cropEndX - GorillaImageEditor.cropStartX);
        const h = Math.abs(GorillaImageEditor.cropEndY - GorillaImageEditor.cropStartY);

        // Clear the crop region to show through
        pctx.clearRect(x, y, w, h);
        pctx.strokeStyle = '#fff';
        pctx.lineWidth = 2;
        pctx.setLineDash([5, 5]);
        pctx.strokeRect(x, y, w, h);
        pctx.setLineDash([]);
    }

    clearShapePreview() {
        const pc = GorillaImageEditor.shapePreviewCanvas;
        const pctx = GorillaImageEditor.shapePreviewCtx;
        pctx.clearRect(0, 0, pc.width, pc.height);
    }

    drawShape(tool, sx, sy, ex, ey) {
        const ctx = GorillaImageEditor.ctx;
        ctx.strokeStyle = GorillaImageEditor.getStrokeColor();
        ctx.lineWidth = GorillaImageEditor.brushSize;
        ctx.lineCap = 'round';

        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        } else if (tool === 'rect') {
            if (GorillaImageEditor.fillEnabled) {
                ctx.fillStyle = GorillaImageEditor.getFillColor();
                ctx.fillRect(sx, sy, ex - sx, ey - sy);
            }
            ctx.strokeRect(sx, sy, ex - sx, ey - sy);
        } else if (tool === 'ellipse') {
            const cx = (sx + ex) / 2;
            const cy = (sy + ey) / 2;
            const rx = Math.abs(ex - sx) / 2;
            const ry = Math.abs(ey - sy) / 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
            if (GorillaImageEditor.fillEnabled) {
                ctx.fillStyle = GorillaImageEditor.getFillColor();
                ctx.fill();
            }
            ctx.stroke();
        }
    }

    applyCrop() {
        const x = Math.min(GorillaImageEditor.cropStartX, GorillaImageEditor.cropEndX);
        const y = Math.min(GorillaImageEditor.cropStartY, GorillaImageEditor.cropEndY);
        const w = Math.abs(GorillaImageEditor.cropEndX - GorillaImageEditor.cropStartX);
        const h = Math.abs(GorillaImageEditor.cropEndY - GorillaImageEditor.cropStartY);

        if (w < 5 || h < 5) {
            GorillaImageEditor.setStatus('Crop area too small');
            return;
        }

        GorillaImageEditor.saveUndoState();
        // Flatten text elements first
        GorillaImageEditor.flattenTextElements();

        const imageData = GorillaImageEditor.ctx.getImageData(x, y, w, h);
        GorillaImageEditor.canvas.width = w;
        GorillaImageEditor.canvas.height = h;
        GorillaImageEditor.syncPreviewCanvasSize();
        GorillaImageEditor.ctx.putImageData(imageData, 0, 0);
        GorillaImageEditor.originalImageData = GorillaImageEditor.ctx.getImageData(0, 0, w, h);
        GorillaImageEditor.zoomToFit();
        GorillaImageEditor.setStatus('Cropped to ' + Math.round(w) + 'x' + Math.round(h));
    }

    // Text elements: draggable & resizable
    addTextElement(x, y) {
        // First flatten canvas coords to CSS coords
        const rect = GorillaImageEditor.canvas.getBoundingClientRect();
        const scaleX = rect.width / GorillaImageEditor.canvas.width;
        const scaleY = rect.height / GorillaImageEditor.canvas.height;
        const cssX = x * scaleX;
        const cssY = y * scaleY;

        const el = document.createElement('div');
        el.className = 'gorilla-image-editor-text-element';
        el.contentEditable = 'false';
        el.innerText = 'Text';
        el.style.left = cssX + 'px';
        el.style.top = cssY + 'px';
        el.style.fontSize = GorillaImageEditor.fontSize + 'px';
        el.style.fontFamily = GorillaImageEditor.fontFamily;
        el.style.fontWeight = GorillaImageEditor.fontBold ? 'bold' : 'normal';
        el.style.fontStyle = GorillaImageEditor.fontItalic ? 'italic' : 'normal';
        el.style.color = GorillaImageEditor.getStrokeColor();

        // Resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'gorilla-image-editor-text-resize-handle';
        el.appendChild(resizeHandle);

        // Delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'gorilla-image-editor-text-delete';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            el.remove();
        });
        el.appendChild(deleteBtn);

        // Make draggable
        GorillaImageEditor.makeDraggable(el);
        GorillaImageEditor.makeResizable(el, resizeHandle);

        GorillaImageEditor.textLayer.appendChild(el);

        // Enter edit mode immediately for new text (defer to next frame so DOM is settled)
        requestAnimationFrame(() => {
            GorillaImageEditor.enterTextEditMode(el);
        });
    }

    enterTextEditMode(el) {
        el.contentEditable = 'true';
        el.classList.add('gorilla-image-editor-text-editing');
        GorillaImageEditor.isEditingText = true;
        el.focus();
        // Select all text for easy replacement
        const range = document.createRange();
        if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
            range.selectNodeContents(el.firstChild);
        } else {
            range.selectNodeContents(el);
        }
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const exitEdit = () => {
            el.contentEditable = 'false';
            el.classList.remove('gorilla-image-editor-text-editing');
            window.getSelection().removeAllRanges();
            GorillaImageEditor.isEditingText = false;
            el.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onClickOutside, true);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                el.blur();
            }
        };

        const onClickOutside = (e) => {
            if (!el.contains(e.target)) {
                e.stopPropagation();
                el.blur();
            }
        };

        el.addEventListener('keydown', onKeyDown);
        // Use capture phase so we catch clicks before other handlers
        document.addEventListener('mousedown', onClickOutside, true);
        el.addEventListener('blur', exitEdit, { once: true });
    }

    makeDraggable(el) {
        let isDrag = false;
        let offsetX, offsetY;

        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('gorilla-image-editor-text-resize-handle') ||
                e.target.classList.contains('gorilla-image-editor-text-delete')) return;
            // If currently in edit mode, don't start drag
            if (el.contentEditable === 'true') return;
            isDrag = true;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            el.style.zIndex = 1000;
            e.preventDefault();
        });

        // Double-click to enter edit mode
        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            GorillaImageEditor.enterTextEditMode(el);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDrag) return;
            const parentRect = GorillaImageEditor.textLayer.getBoundingClientRect();
            el.style.left = (e.clientX - parentRect.left - offsetX) + 'px';
            el.style.top = (e.clientY - parentRect.top - offsetY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDrag = false;
            el.style.zIndex = '';
        });

        // Touch support
        el.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('gorilla-image-editor-text-resize-handle') ||
                e.target.classList.contains('gorilla-image-editor-text-delete')) return;
            // If currently in edit mode, don't start drag
            if (el.contentEditable === 'true') return;
            isDrag = true;
            const touch = e.touches[0];
            const rect = el.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            el.style.zIndex = 1000;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDrag) return;
            const touch = e.touches[0];
            const parentRect = GorillaImageEditor.textLayer.getBoundingClientRect();
            el.style.left = (touch.clientX - parentRect.left - offsetX) + 'px';
            el.style.top = (touch.clientY - parentRect.top - offsetY) + 'px';
        }, { passive: true });

        document.addEventListener('touchend', () => {
            isDrag = false;
            el.style.zIndex = '';
        });
    }

    makeResizable(el, handle) {
        let isResizing = false;
        let startFontSize;
        let startY;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startFontSize = parseFloat(window.getComputedStyle(el).fontSize);
            startY = e.clientY;
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const delta = e.clientY - startY;
            const newSize = Math.max(8, startFontSize + delta * 0.5);
            el.style.fontSize = newSize + 'px';
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    flattenTextElements() {
        const elements = GorillaImageEditor.textLayer.querySelectorAll('.gorilla-image-editor-text-element');
        if (elements.length === 0) return;

        const rect = GorillaImageEditor.canvas.getBoundingClientRect();
        const scaleX = GorillaImageEditor.canvas.width / rect.width;
        const scaleY = GorillaImageEditor.canvas.height / rect.height;
        const ctx = GorillaImageEditor.ctx;

        elements.forEach(el => {
            const elRect = el.getBoundingClientRect();
            const canvasRect = GorillaImageEditor.canvas.getBoundingClientRect();

            const x = (elRect.left - canvasRect.left) * scaleX;
            const y = (elRect.top - canvasRect.top) * scaleY;

            const fontSize = parseFloat(window.getComputedStyle(el).fontSize) * scaleX;
            const fontFamily = window.getComputedStyle(el).fontFamily;
            const fontWeight = window.getComputedStyle(el).fontWeight;
            const fontStyle = window.getComputedStyle(el).fontStyle;
            const color = window.getComputedStyle(el).color;

            // Get just the text content (excluding delete button text)
            let textContent = '';
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    textContent += node.textContent;
                }
            });
            textContent = textContent.trim();

            ctx.save();
            ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + 'px ' + fontFamily;
            ctx.fillStyle = color;
            ctx.textBaseline = 'top';

            // Handle multi-line text
            const lines = textContent.split('\n');
            const lineHeight = fontSize * 1.2;
            lines.forEach((line, i) => {
                ctx.fillText(line, x, y + i * lineHeight);
            });
            ctx.restore();

            el.remove();
        });
    }

    // State management
    saveUndoState() {
        const state = GorillaImageEditor.canvas.toDataURL();
        GorillaImageEditor.undoStack.push(state);
        if (GorillaImageEditor.undoStack.length > GorillaImageEditor.maxUndo) {
            GorillaImageEditor.undoStack.shift();
        }
        GorillaImageEditor.redoStack = [];
    }

    undo() {
        if (GorillaImageEditor.undoStack.length === 0) {
            GorillaImageEditor.setStatus('Nothing to undo');
            return;
        }
        // Save current state for redo
        GorillaImageEditor.redoStack.push(GorillaImageEditor.canvas.toDataURL());
        const state = GorillaImageEditor.undoStack.pop();
        GorillaImageEditor.restoreState(state);
        GorillaImageEditor.setStatus('Undo');
    }

    redo() {
        if (GorillaImageEditor.redoStack.length === 0) {
            GorillaImageEditor.setStatus('Nothing to redo');
            return;
        }
        GorillaImageEditor.undoStack.push(GorillaImageEditor.canvas.toDataURL());
        const state = GorillaImageEditor.redoStack.pop();
        GorillaImageEditor.restoreState(state);
        GorillaImageEditor.setStatus('Redo');
    }

    restoreState(dataUrl) {
        const img = new Image();
        img.onload = () => {
            GorillaImageEditor.canvas.width = img.width;
            GorillaImageEditor.canvas.height = img.height;
            GorillaImageEditor.syncPreviewCanvasSize();
            GorillaImageEditor.ctx.drawImage(img, 0, 0);
            GorillaImageEditor.originalImageData = GorillaImageEditor.ctx.getImageData(0, 0, img.width, img.height);
            // Re-apply brightness/contrast if non-zero
            if (GorillaImageEditor.brightness !== 0 || GorillaImageEditor.contrast !== 0) {
                GorillaImageEditor.applyAdjustments();
            }
        };
        img.src = dataUrl;
    }

    syncPreviewCanvasSize() {
        GorillaImageEditor.shapePreviewCanvas.width = GorillaImageEditor.canvas.width;
        GorillaImageEditor.shapePreviewCanvas.height = GorillaImageEditor.canvas.height;
    }

    applyZoom() {
        const scale = GorillaImageEditor.zoomLevel / 100;
        const cw = GorillaImageEditor.canvas.width;
        const ch = GorillaImageEditor.canvas.height;
        const displayW = Math.round(cw * scale);
        const displayH = Math.round(ch * scale);
        // Set CSS display size (does not affect canvas internal resolution)
        GorillaImageEditor.canvas.style.width = displayW + 'px';
        GorillaImageEditor.canvas.style.height = displayH + 'px';
        // The container is inline-block and shrink-wraps to the canvas,
        // so the shape preview and text layer (100%x100%) follow automatically.
    }

    resetZoom() {
        GorillaImageEditor.zoomLevel = 100;
        const slider = document.getElementById('gorilla-image-editor-zoom');
        const label = document.getElementById('gorilla-image-editor-zoom-label');
        if (slider) slider.value = 100;
        if (label) label.textContent = '100%';
        GorillaImageEditor.applyZoom();
    }

    zoomToFit() {
        const workspace = document.getElementById('gorilla-image-editor-workspace');
        if (!workspace) { GorillaImageEditor.resetZoom(); return; }
        const cw = GorillaImageEditor.canvas.width;
        const ch = GorillaImageEditor.canvas.height;
        if (!cw || !ch) { GorillaImageEditor.resetZoom(); return; }
        // Account for workspace border/padding
        const style = getComputedStyle(workspace);
        const availW = workspace.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const availH = workspace.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        if (availW <= 0 || availH <= 0) { GorillaImageEditor.resetZoom(); return; }
        const scaleW = availW / cw;
        const scaleH = availH / ch;
        let zoom = Math.min(scaleW, scaleH) * 100;
        zoom = Math.min(zoom, 400); // clamp to slider max
        zoom = Math.max(zoom, 10);  // clamp to slider min
        zoom = Math.round(zoom);
        GorillaImageEditor.zoomLevel = zoom;
        const slider = document.getElementById('gorilla-image-editor-zoom');
        const label = document.getElementById('gorilla-image-editor-zoom-label');
        if (slider) slider.value = zoom;
        if (label) label.textContent = zoom + '%';
        GorillaImageEditor.applyZoom();
    }

    // Brightness / Contrast adjustments
    applyAdjustments() {
        if (!GorillaImageEditor.originalImageData) return;
        const src = GorillaImageEditor.originalImageData;
        const data = new Uint8ClampedArray(src.data);
        const brightness = GorillaImageEditor.brightness;
        const contrast = GorillaImageEditor.contrast;

        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] = data[i] + brightness;
            data[i + 1] = data[i + 1] + brightness;
            data[i + 2] = data[i + 2] + brightness;
            // Apply contrast
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }

        const imageData = new ImageData(data, src.width, src.height);
        GorillaImageEditor.ctx.putImageData(imageData, 0, 0);
    }

    // Canvas operations
    newCanvas(width, height) {
        GorillaImageEditor.canvas.width = width;
        GorillaImageEditor.canvas.height = height;
        GorillaImageEditor.syncPreviewCanvasSize();
        GorillaImageEditor.ctx.fillStyle = '#ffffff';
        GorillaImageEditor.ctx.fillRect(0, 0, width, height);
        GorillaImageEditor.originalImageData = GorillaImageEditor.ctx.getImageData(0, 0, width, height);
        GorillaImageEditor.undoStack = [];
        GorillaImageEditor.redoStack = [];
        GorillaImageEditor.loadedFileName = null;
        GorillaImageEditor.brightness = 0;
        GorillaImageEditor.contrast = 0;
        document.getElementById('gorilla-image-editor-brightness').value = 0;
        document.getElementById('gorilla-image-editor-contrast').value = 0;
        GorillaImageEditor.clearTextElements();
        GorillaImageEditor.zoomToFit();
        GorillaImageEditor.setStatus('New canvas ' + width + 'x' + height);
    }

    clearTextElements() {
        GorillaImageEditor.textLayer.innerHTML = '';
    }

    async newCanvasPrompt() {
        const sizeStr = await GorillaPrompt.prompt('Canvas size (width x height):', '800x600');
        if (!sizeStr) return;
        const match = sizeStr.match(/(\d+)\s*[xX×]\s*(\d+)/);
        if (!match) {
            GorillaAlert.show('Invalid size format. Use WIDTHxHEIGHT (e.g., 800x600).');
            return;
        }
        const w = parseInt(match[1]);
        const h = parseInt(match[2]);
        if (w < 10 || h < 10 || w > 8000 || h > 8000) {
            GorillaAlert.show('Size must be between 10 and 8000 pixels.');
            return;
        }
        GorillaImageEditor.newCanvas(w, h);
    }

    async uploadAndLoad() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                // Write to media library (same as media screen upload)
                const filePath = GorillaMedia.getFolderLocation(file.name);
                await fs.writeBinaryFile(filePath, file);
                await GorillaMedia.loadMediaScreens();
                fs.zipModified = true;
                GorillaPresenter.markDirty(true);
                // Load into editor
                await GorillaImageEditor.loadFileByPath(filePath);
            } catch (err) {
                console.error('Upload error:', err);
                GorillaAlert.show('Error uploading image: ' + err.message);
            }
        });
        input.click();
    }

    async loadFromLibrary() {
        try {
            const files = await fs.readDirectory("media/");
            const imageFiles = files.filter(f => {
                const lower = f.toLowerCase();
                return lower.endsWith('.png') || lower.endsWith('.jpg') ||
                       lower.endsWith('.jpeg') || lower.endsWith('.gif') ||
                       lower.endsWith('.bmp') || lower.endsWith('.webp') ||
                       lower.endsWith('.svg');
            });
            if (imageFiles.length === 0) {
                GorillaAlert.show('No image files found in the media library.');
                return;
            }
            const result = await new Promise(resolve => {
                const dialog = document.createElement('dialog');
                const listItems = imageFiles.map(f => {
                    const displayName = f.replace(/^media\//, '');
                    return `<li class="gorilla-file-chooser-item" data-path="${f}" style="cursor:pointer; padding:0.4em 0.6em; border-bottom:1px solid rgba(128,128,128,0.3);">${displayName}</li>`;
                }).join('');
                dialog.innerHTML = `
                    <form method="dialog">
                        <div><label>Select an image to load:</label></div>
                        <div style="max-height:60vh; overflow-y:auto; margin:0.5em 0;">
                            <ul style="list-style:none; padding:0; margin:0;">${listItems}</ul>
                        </div>
                        <div><button type="submit" value="cancel">Cancel</button></div>
                    </form>
                `;
                document.body.appendChild(dialog);
                dialog.querySelectorAll('.gorilla-file-chooser-item').forEach(item => {
                    item.addEventListener('click', () => {
                        dialog.close(item.getAttribute('data-path'));
                    });
                });
                dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close('cancel'); });
                dialog.onclose = () => {
                    const val = dialog.returnValue;
                    dialog.remove();
                    resolve(val && val !== 'cancel' ? val : null);
                };
                dialog.showModal();
            });
            if (!result) return;
            await GorillaImageEditor.loadFileByPath(result);
        } catch (e) {
            console.error('Error loading from library:', e);
            GorillaAlert.show('Error loading file: ' + e.message);
        }
    }

    async loadFileByPath(filePath) {
        try {
            const data = await fs.readBinaryFile(filePath);
            let mimeType = 'image/png';
            const lower = filePath.toLowerCase();
            if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
            else if (lower.endsWith('.gif')) mimeType = 'image/gif';
            else if (lower.endsWith('.bmp')) mimeType = 'image/bmp';
            else if (lower.endsWith('.webp')) mimeType = 'image/webp';
            else if (lower.endsWith('.svg')) mimeType = 'image/svg+xml';

            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                GorillaImageEditor.canvas.width = img.width;
                GorillaImageEditor.canvas.height = img.height;
                GorillaImageEditor.syncPreviewCanvasSize();
                GorillaImageEditor.ctx.drawImage(img, 0, 0);
                GorillaImageEditor.originalImageData = GorillaImageEditor.ctx.getImageData(0, 0, img.width, img.height);
                GorillaImageEditor.undoStack = [];
                GorillaImageEditor.redoStack = [];
                GorillaImageEditor.brightness = 0;
                GorillaImageEditor.contrast = 0;
                document.getElementById('gorilla-image-editor-brightness').value = 0;
                document.getElementById('gorilla-image-editor-contrast').value = 0;
                GorillaImageEditor.clearTextElements();
                GorillaImageEditor.zoomToFit();
                GorillaImageEditor.loadedFileName = filePath.replace(/^media\//, '');
                GorillaImageEditor.setStatus('Loaded: ' + filePath);
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                GorillaAlert.show('Failed to load image: ' + filePath);
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (e) {
            console.error('Error loading image:', e);
            GorillaAlert.show('Error loading image: ' + e.message);
        }
    }

    async saveImage() {
        // Flatten any text elements onto the canvas first
        GorillaImageEditor.flattenTextElements();

        let title;
        if (GorillaImageEditor.loadedFileName) {
            title = GorillaImageEditor.loadedFileName;
        } else {
            let headerEl = document.getElementById("gorilla-slide-header-" + GorillaPresenter.currentSlideNumber);
            title = (GorillaPresenter.currentSlideNumber + 1) + ") " + (headerEl ? headerEl.innerText.trim() : "Image");
        }

        let saveNameInfo = await GorillaMediaFilePrompt.prompt('Enter title for the image:', title, true);
        if (!saveNameInfo) return;

        let rawName = saveNameInfo.value.trim();
        let saveName = "media/" + rawName;
        let isFromLibrary = !!GorillaImageEditor.loadedFileName;

        if (isFromLibrary && /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(saveName)) {
            rawName = rawName.replace(/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i, '');
        } else {
            if (!saveName.toLowerCase().endsWith('.png')) {
                saveName += '.png';
            }
        }

        // Export canvas as blob
        const blob = await new Promise(resolve => {
            GorillaImageEditor.canvas.toBlob(resolve, 'image/png');
        });

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
            GorillaEditor.setCursorPosition(0, 0);
        }

        await fs.writeBinaryFile(saveName, blob);
        await GorillaPresenter.updateSlideData();
        fs.zipModified = true;
        GorillaPresenter.markDirty(true);
        GorillaImageEditor.setStatus('Image saved as ' + saveName);
    }

    setStatus(message) {
        const el = document.getElementById('gorilla-image-editor-status');
        if (el) el.textContent = message;
    }
}

const GorillaImageEditor = new GorillaImageEditorClass();
GorillaImageEditor.init();
