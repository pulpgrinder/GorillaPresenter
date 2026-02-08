let GorillaEditor = {
    editor: null,
    jar: null,
    sampleEditor: null,
    sampleJar: null,
    undoStack: [],
    redoStack: [],
    defaultLanguage: 'markdown',
    init: async function () {
        // Extend Prism's markdown language to recognize triple-brace blocks {{{ ... }}}
        Prism.languages.insertBefore('markdown', 'prolog', {
            'important': {
                pattern: /\{\{\{[\s\S]*?\}\}\}/,
                greedy: true
            }
        });
        GorillaEditor.editor = document.querySelector('#gorilla-slide-editor');

        GorillaEditor.jar = CodeJar(GorillaEditor.editor, GorillaEditor.highlightElement, {
            history: true,
            tab: ' '.repeat(4), // default is '\t'
            indentOn: /[(\[]$/, // default is /{$/
            autoclose: {
                open: `([{*"`, // default is `([{'"`
                close: `)]}*"` // default is `)]}'"`
            }
        });
        GorillaEditor.setCursorPosition(0, 0);
        GorillaEditor.sampleEditor = document.querySelector('#gorilla-sample-code-editor');
        GorillaEditor.sampleJar = CodeJar(GorillaEditor.sampleEditor, GorillaEditor.highlightElement, { tab: "\t" });
        let presentationData = await fs.readTextFile("presentation.md");
        if (!presentationData) {
            presentationData = "# Welcome to Gorilla Presenter\n\nThis is your first slide. Edit the text in the script editor to create your presentation.\n\n- Use **Markdown** syntax for formatting.\n- Add special directives for advanced features.\n\nEnjoy presenting!";
        }
        GorillaEditor.updateCode(presentationData);
        GorillaEditor.setCursorPosition(0, 0);
    },
    updateCode: function (newCode) {
        GorillaEditor.jar.updateCode(newCode);
    },
    getCode: function () {
        return GorillaEditor.jar.toString();
    },
    highlightElement: function (element) {
        Prism.highlightElement(element, false);
    },

    getCursorPosition: function () {
        return GorillaEditor.jar.save();
    },
    setCursorPosition: function (start, end = null, skipFocus = false) {
        if (end === null) {
            end = start;
        }
        GorillaEditor.jar.restore({ start: start, end: end, dir: "->" });

        setTimeout(() => {
            if (!skipFocus) {
                GorillaEditor.editor.focus();
            }

            // Scroll cursor into view
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const tempSpan = document.createElement('span');
                range.insertNode(tempSpan);
                tempSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                tempSpan.remove();
            }
        }, 0);
    },
    getSelectedText: function () {
        let code = GorillaEditor.getCode();
        let cursor = GorillaEditor.getCursorPosition();
        cursor = this.expandCursorToFullLines(code, cursor);
        GorillaEditor.setCursorPosition(cursor.start, cursor.end);
        return code.substring(cursor.start, cursor.end);
    },
    expandCursorToFullLines: function (code, cursor) {
        // If no selection, return as is
        if (cursor.start === cursor.end) {
            return cursor;
        }

        let selectedText = code.substring(cursor.start, cursor.end);

        // Single partial line: no newlines in selection - return as is
        if (selectedText.indexOf('\n') < 0) {
            return cursor;
        }

        // Multiple lines: check if already at full line boundaries
        let isStartAtLineBegin = cursor.start === 0 || code[cursor.start - 1] === '\n';
        let isEndAtLineEnd = cursor.end === code.length || code[cursor.end] === '\n';

        if (isStartAtLineBegin && isEndAtLineEnd) {
            // Already full lines, return as is
            return cursor;
        }

        // Need to expand to full lines
        let newStart = cursor.start;
        let newEnd = cursor.end;

        if (!isStartAtLineBegin) {
            // Move start back to beginning of line
            let lastNewline = code.lastIndexOf('\n', cursor.start - 1);
            newStart = lastNewline === -1 ? 0 : lastNewline + 1;
        }

        if (!isEndAtLineEnd) {
            // Move end forward to the newline (inclusive)
            let nextNewline = code.indexOf('\n', cursor.end);
            newEnd = nextNewline === -1 ? code.length : nextNewline + 1;
        }

        return { start: newStart, end: newEnd };
    },
    replaceSelectedText: function (newText) {
        GorillaEditor.editor.focus();
        GorillaEditor.jar.recordHistory();

        const pos = GorillaEditor.jar.save();
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create a text node directly for plain text
        const textNode = document.createTextNode(newText);
        range.insertNode(textNode);

        const newCursorPos = pos.start + newText.length;

        GorillaEditor.highlightElement(GorillaEditor.editor);
        GorillaEditor.jar.recordHistory();
        GorillaEditor.editor.focus();
        GorillaEditor.jar.restore({
            start: newCursorPos,
            end: newCursorPos,
            dir: '->'
        });
    },

    wrapSelectedText: function (prefix, suffix) {
        const selectedText = GorillaEditor.getSelectedText();
        const newText = prefix + selectedText + suffix;
        GorillaEditor.replaceSelectedText(newText);
    },
    fenceSelectedLines: function (prefix, suffix) {
        selectedText = GorillaEditor.getSelectedText();
        selectedLines = selectedText.split('\n');
        for (let i = 0; i < selectedLines.length; i++) {
            selectedLines[i] = prefix + selectedLines[i] + suffix;
        }
        newText = selectedLines.join('\n');
        GorillaEditor.replaceSelectedText(newText);
    },

    bold: function () {
        GorillaEditor.wrapSelectedText('**', '**');
    },
    italic: function () {
        GorillaEditor.wrapSelectedText('*', '*');
    },
    superscript: function () {
        GorillaEditor.wrapSelectedText('^', '^');
    },
    subscript: function () {
        GorillaEditor.wrapSelectedText('~', '~');
    },
    codeInline: function () {
        GorillaEditor.wrapSelectedText('`', '`');
    },
    codeBlock: function () {
        GorillaEditor.wrapSelectedText('```' + GorillaEditor.defaultLanguage + '\n', '\n```\n');
    },
    code: function () {
        let text = GorillaEditor.getSelectedText();
        if (text.includes('\n')) {
            GorillaEditor.codeBlock();
        } else {
            GorillaEditor.codeInline();
        }
    },
    ul: function () {
        GorillaEditor.fenceSelectedLines('- ', '');
    },
    ol: function () {
        GorillaEditor.fenceSelectedLines('1. ', '');
    },
    blockQuote: function () {
        GorillaEditor.fenceSelectedLines('> ', '');
    },
    comment: function () {
        GorillaEditor.fenceSelectedLines('; ', '');
    },
    strikethrough: function () {
        GorillaEditor.wrapSelectedText('~~', '~~');
    },
    insertMedia: function () {
        GorillaEditor.wrapSelectedText("{{{media ", " }}}");
    },
    latex: function () {
        GorillaEditor.wrapSelectedText('$$', '$$');
    },
    footnote: function () {
        GorillaEditor.wrapSelectedText('^[', ']');
    }
}


GorillaFindReplace = {
    currentMatches: [],
    currentIndex: -1,
    lastSearchText: null,
    lastSearchedCode: null, // NEW: Track the code we last searched
    lastFindCursorPosition: null,

    find(force = false) {
        const findText = document.getElementById('gorilla-find-input').value;
        if (!findText) return;
        const cursorPos = GorillaEditor.getCursorPosition().start;
        if (GorillaFindReplace.lastFindCursorPosition !== cursorPos) {
            force = true;
            GorillaFindReplace.lastFindCursorPosition = cursorPos;
        }
        const code = GorillaEditor.getCode();

        if (force === false) {
            if (findText === GorillaFindReplace.lastSearchText &&
                code === GorillaFindReplace.lastSearchedCode) {
                return;
            }
        }
        GorillaFindReplace.lastSearchText = findText;
        GorillaFindReplace.lastSearchedCode = code;
        const caseSensitive = document.getElementById('gorilla-find-case-sensitive').checked;

        GorillaFindReplace.currentMatches = [];

        try {
            const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = new RegExp(escaped, caseSensitive ? 'g' : 'gi');

            let match;
            while ((match = pattern.exec(code)) !== null) {
                GorillaFindReplace.currentMatches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0]
                });
            }

            if (GorillaFindReplace.currentMatches.length > 0) {

                let foundIndex = GorillaFindReplace.currentMatches.findIndex(match => match.start > cursorPos);

                if (foundIndex === -1) {
                    foundIndex = 0;
                }

                GorillaFindReplace.currentIndex = foundIndex;
                GorillaFindReplace.highlightMatches(pattern);
                GorillaFindReplace.scrollToMatch(GorillaFindReplace.currentIndex);
                GorillaFindReplace.updateStatus();
            } else {
                GorillaFindReplace.updateStatus('No matches found');
            }
        } catch (e) {
            GorillaFindReplace.updateStatus('Invalid regex: ' + e.message);
        }
    },
    hasStateChanged() {
        if (!GorillaFindReplace.lastSearchedCode) return false;
        if (GorillaEditor.getCode() !== GorillaFindReplace.lastSearchedCode)
            return true;
        cursorPos = GorillaEditor.getCursorPosition().start;
        if (cursorPos !== GorillaFindReplace.lastFindCursorPosition)
            return true;
        return false;

    },

    findNext() {
        let searchText = document.getElementById('gorilla-find-input').value;
        if (searchText === "") {
            GorillaFindReplace.clearHighlights();
            GorillaFindReplace.currentMatches = [];
            GorillaFindReplace.currentIndex = -1;
            GorillaFindReplace.updateStatus();
            return;
        }
        // Check if we need to re-run find due to code changes
        if (GorillaFindReplace.currentMatches.length === 0 ||
            searchText !== GorillaFindReplace.lastSearchText ||
            GorillaFindReplace.hasStateChanged()) {

            // Get current cursor position before re-running find
            const cursorPos = GorillaEditor.jar.save().start;

            GorillaFindReplace.find(true);

            if (GorillaFindReplace.currentMatches.length === 0) return;

            // Find first match AFTER current cursor position
            let foundIndex = GorillaFindReplace.currentMatches.findIndex(match => match.start > cursorPos);

            if (foundIndex === -1) {
                // No matches after cursor, wrap to beginning
                foundIndex = 0;
            }

            GorillaFindReplace.currentIndex = foundIndex;
            GorillaFindReplace.scrollToMatch(GorillaFindReplace.currentIndex);
            GorillaFindReplace.updateStatus();
            return;
        }

        GorillaFindReplace.currentIndex = (GorillaFindReplace.currentIndex + 1) % GorillaFindReplace.currentMatches.length;
        GorillaFindReplace.scrollToMatch(GorillaFindReplace.currentIndex);
        GorillaFindReplace.updateStatus();
    },

    findPrevious() {
        let searchText = document.getElementById('gorilla-find-input').value;
        if (searchText === "") {
            GorillaFindReplace.clearHighlights();
            GorillaFindReplace.currentMatches = [];
            GorillaFindReplace.currentIndex = -1;
            GorillaFindReplace.updateStatus();
            return;
        }
        // Check if we need to re-run find due to code changes
        if (GorillaFindReplace.currentMatches.length === 0 ||
            GorillaFindReplace.hasStateChanged()) {

            // Get current cursor position before re-running find
            const cursorPos = GorillaEditor.jar.save().start;

            GorillaFindReplace.find(true);

            if (GorillaFindReplace.currentMatches.length === 0) return;

            // Find last match BEFORE current cursor position
            let foundIndex = -1;
            for (let i = GorillaFindReplace.currentMatches.length - 1; i >= 0; i--) {
                if (GorillaFindReplace.currentMatches[i].start < cursorPos) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex === -1) {
                // No matches before cursor, wrap to end
                foundIndex = GorillaFindReplace.currentMatches.length - 1;
            }

            GorillaFindReplace.currentIndex = foundIndex;
            GorillaFindReplace.scrollToMatch(GorillaFindReplace.currentIndex);
            GorillaFindReplace.updateStatus();
            return;
        }

        GorillaFindReplace.currentIndex = (GorillaFindReplace.currentIndex - 1 + GorillaFindReplace.currentMatches.length) % GorillaFindReplace.currentMatches.length;
        GorillaFindReplace.scrollToMatch(GorillaFindReplace.currentIndex);
        GorillaFindReplace.updateStatus();
    },

    replaceCurrent() {
        if (GorillaFindReplace.currentMatches.length === 0 || GorillaFindReplace.currentIndex === -1) return;

        const replaceText = document.getElementById('gorilla-replace-input').value;
        const match = GorillaFindReplace.currentMatches[GorillaFindReplace.currentIndex];

        // Set cursor to select the match
        GorillaEditor.jar.restore({ start: match.start, end: match.end, dir: "->" });
        GorillaEditor.editor.focus();

        // Record history before change
        GorillaEditor.jar.recordHistory();

        // Replace using native selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(replaceText);
        range.insertNode(textNode);

        // Update highlighting
        GorillaEditor.highlightElement(GorillaEditor.editor);

        // Record history after change
        GorillaEditor.jar.recordHistory();

        // Refresh matches
        GorillaFindReplace.find();
    },
    replaceAll() {
        if (GorillaFindReplace.currentMatches.length === 0) return;

        const replaceText = document.getElementById('gorilla-replace-input').value;
        const count = GorillaFindReplace.currentMatches.length;

        // Record initial state
        GorillaEditor.jar.recordHistory();

        // Replace from end to start to maintain indices
        for (let i = GorillaFindReplace.currentMatches.length - 1; i >= 0; i--) {
            const match = GorillaFindReplace.currentMatches[i];

            // Select the match
            GorillaEditor.jar.restore({ start: match.start, end: match.end, dir: "->" });

            // Replace using native selection
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const textNode = document.createTextNode(replaceText);
                range.insertNode(textNode);
            }
        }

        // Update highlighting
        GorillaEditor.highlightElement(GorillaEditor.editor);

        // Record final state
        GorillaEditor.jar.recordHistory();

        GorillaFindReplace.currentMatches = [];
        GorillaFindReplace.updateStatus(`Replaced ${count} occurrence(s)`);
    },

    highlightMatches(pattern) {
        // Get a clean copy of the language without highlight
        const { highlight, ...cleanMarkdown } = Prism.languages.markdown;

        // Rebuild with new highlight first
        Prism.languages.markdown = {
            'highlight': {
                pattern: pattern,
                greedy: true
            },
            ...cleanMarkdown
        };

        GorillaEditor.highlightElement(GorillaEditor.editor);
    },
    clearHighlights() {
        const { highlight, ...cleanMarkdown } = Prism.languages.markdown;
        Prism.languages.markdown = cleanMarkdown;
        GorillaEditor.highlightElement(GorillaEditor.editor);
    },
    scrollToMatch(index) {
        const match = GorillaFindReplace.currentMatches[index];
        GorillaEditor.setCursorPosition(match.start, match.end);

    },
    updateStatus(message) {
        const status = document.getElementById('gorilla-find-status');
        if (message) {
            status.textContent = message;
        } else if (GorillaFindReplace.currentMatches.length > 0) {
            status.textContent = `Match ${GorillaFindReplace.currentIndex + 1} of ${GorillaFindReplace.currentMatches.length}`;
        } else {
            status.textContent = '';
        }
    },

    init() {

        document.getElementById('gorilla-find-next').onclick = (e) => {
            e.preventDefault();
            setTimeout(() => {

                GorillaEditor.editor.focus();
                GorillaFindReplace.findNext();
            }, 25);
        };

        document.getElementById('gorilla-find-previous').onclick = (e) => {
            setTimeout(() => {
                e.preventDefault();

                GorillaEditor.editor.focus();
                GorillaFindReplace.findPrevious();
            }, 25);
        };

        document.getElementById('gorilla-replace-current').onclick = (e) => {
            setTimeout(() => {
                e.preventDefault();

                GorillaEditor.editor.focus();
                GorillaFindReplace.replaceCurrent();
            }
                , 25);
        };

        document.getElementById('gorilla-replace-all').onclick = (e) => {
            setTimeout(() => {
                e.preventDefault();
                GorillaEditor.editor.focus();
                GorillaFindReplace.replaceAll();
            }, 25);
        };

        // Enter key in find field triggers search
        document.getElementById('gorilla-find-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                setTimeout(() => {
                    GorillaEditor.editor.focus();
                    GorillaFindReplace.find(true);
                }, 25);
            }
        });
        // Checkboxes trigger new search
        document.getElementById('gorilla-find-case-sensitive').onchange = () =>
            setTimeout(() => {
                GorillaEditor.editor.focus();
                GorillaFindReplace.find(true);
            }, 25);

        // Took out regex option for now to simplify - can add back later if needed
        /*    document.getElementById('gorilla-find-regex').onchange = () => GorillaFindReplace.find(true); */

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('gorilla-find-input').focus();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                document.getElementById('gorilla-replace-input').focus();
            }

        });
    }
};

// Initialize when ready
GorillaFindReplace.init();