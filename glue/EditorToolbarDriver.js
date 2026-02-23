/**
 * EditorToolbarDriver.js
 * Manages the editor find/replace dialog (Cmd/Ctrl+F).
 */

let EditorToolbarDriver = {
    _findToolbar: null,
    _findOriginalParent: null,
    _findOriginalNext: null,
    _dialog: null,
    _dragging: false,
    _dragOffsetX: 0,
    _dragOffsetY: 0,
    _dragHandlersAttached: false,

    /**
     * Initialize the editor find dialog driver
     */
    init: function() {
        const findToolbar = document.getElementById("gorilla-editor-find-toolbar");
        if (!findToolbar) {
            console.error("EditorToolbarDriver: gorilla-editor-find-toolbar element not found");
            return;
        }

        this._findToolbar = findToolbar;

        const self = this;
        document.addEventListener("keydown", function(event) {
            const isFind = (event.key === "f" || event.key === "F") && (event.ctrlKey || event.metaKey);
            if (!isFind) return;
            if (!self._isEditorActive()) return;

            event.preventDefault();
            event.stopPropagation();
            self.showFindDialog();
        }, true);
    },

    _isEditorActive: function() {
        const editorScreen = document.getElementById("gorilla-editor-screen");
        if (!editorScreen) return false;

        if (typeof GorillaPresenter !== "undefined" && GorillaPresenter.currentScreen) {
            return GorillaPresenter.currentScreen === "gorilla-editor-screen";
        }

        return editorScreen.offsetParent !== null;
    },

    /**
     * Show the find/replace dialog
     */
    showFindDialog: function() {
        if (this._dialog && this._dialog.open) {
            return;
        }

        if (!this._dialog) {
            this._dialog = document.createElement("dialog");
            this._dialog.className = "gorilla-find-dialog";
            document.body.appendChild(this._dialog);

            const self = this;
            this._dialog.addEventListener("click", function(event) {
                if (event.target === self._dialog) {
                    self.hideFindDialog();
                }
            });
        }

        this._dialog.innerHTML = "";

        const dragHandle = document.createElement("div");
        dragHandle.className = "gorilla-find-dialog-handle";
        dragHandle.textContent = "Find and Replace";
        this._dialog.appendChild(dragHandle);
        this._attachDragHandlers(dragHandle);

        this._findOriginalParent = this._findToolbar.parentNode;
        this._findOriginalNext = this._findToolbar.nextSibling;
        this._dialog.appendChild(this._findToolbar);
        this._findToolbar.style.display = "block";

        this._dialog.showModal();

        const findInput = document.getElementById("gorilla-find-input");
        if (findInput) {
            requestAnimationFrame(() => findInput.focus());
        }
    },

    /**
     * Hide the find/replace dialog
     */
    hideFindDialog: function() {
        if (!this._dialog) return;

        if (this._dialog.open) {
            this._dialog.close();
        }

        if (this._findOriginalParent) {
            if (this._findOriginalNext) {
                this._findOriginalParent.insertBefore(this._findToolbar, this._findOriginalNext);
            } else {
                this._findOriginalParent.appendChild(this._findToolbar);
            }
        }

        if (this._findToolbar) {
            this._findToolbar.style.display = "none";
        }

        this._findOriginalParent = null;
        this._findOriginalNext = null;
    },

    _attachDragHandlers: function(handle) {
        if (!handle || this._dragHandlersAttached) return;

        const self = this;
        handle.addEventListener("mousedown", function(event) {
            event.preventDefault();
            const rect = self._dialog.getBoundingClientRect();
            self._dragOffsetX = event.clientX - rect.left;
            self._dragOffsetY = event.clientY - rect.top;
            self._dialog.style.position = "fixed";
            self._dialog.style.margin = "0";
            self._dialog.style.left = rect.left + "px";
            self._dialog.style.top = rect.top + "px";
            self._dragging = true;
        });

        document.addEventListener("mousemove", function(event) {
            if (!self._dragging) return;
            self._dialog.style.left = (event.clientX - self._dragOffsetX) + "px";
            self._dialog.style.top = (event.clientY - self._dragOffsetY) + "px";
        });

        document.addEventListener("mouseup", function() {
            self._dragging = false;
        });

        this._dragHandlersAttached = true;
    }
};

// Initialize when the document is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        EditorToolbarDriver.init();
    });
} else {
    EditorToolbarDriver.init();
}
