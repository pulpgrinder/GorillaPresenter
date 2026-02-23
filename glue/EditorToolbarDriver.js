/**
 * EditorToolbarDriver.js
 * Shows/hides the fixed bottom find/replace toolbar when the editor is active.
 */

let EditorToolbarDriver = {
    _toolbar: null,

    init: function() {
        this._toolbar = document.getElementById("gorilla-editor-find-toolbar");
        if (!this._toolbar) return;

        // Cmd/Ctrl+F focuses the find input
        var self = this;
        document.addEventListener("keydown", function(e) {
            if ((e.key === "f" || e.key === "F") && (e.ctrlKey || e.metaKey)) {
                if (self._isEditorActive()) {
                    e.preventDefault();
                    e.stopPropagation();
                    var inp = document.getElementById("gorilla-find-input");
                    if (inp) inp.focus();
                }
            }
        }, true);

        // Patch show_screen to auto-show/hide toolbar
        if (typeof GorillaPresenter !== "undefined" && GorillaPresenter.show_screen) {
            var origShowScreen = GorillaPresenter.show_screen;
            GorillaPresenter.show_screen = async function(id) {
                await origShowScreen.call(GorillaPresenter, id);
                self._syncVisibility();
            };
        }

        // Initial sync
        this._syncVisibility();
    },

    _isEditorActive: function() {
        return typeof GorillaPresenter !== "undefined" &&
               GorillaPresenter.currentScreen === "gorilla-editor-screen";
    },

    _syncVisibility: function() {
        if (!this._toolbar) return;
        this._toolbar.style.display = this._isEditorActive() ? "block" : "none";
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { EditorToolbarDriver.init(); });
} else {
    EditorToolbarDriver.init();
}
