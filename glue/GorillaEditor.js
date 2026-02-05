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
    setCursorPosition: function (start, end = null) {
        if (end === null) {
            end = start;
        }
       // console.log("Setting cursor position: start =", start, ", end =", end);
        GorillaEditor.jar.restore({ start: start, end: end, dir: "->" });

        setTimeout(() => {
            GorillaEditor.editor.focus();

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
        console.log("Selected text to wrap:", selectedText);
        const newText = prefix + selectedText + suffix;
        console.log("New text after wrapping:", newText);
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

        console.log("Inserting code block with language:", GorillaEditor.defaultLanguage);
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
    footnote:function () {
        GorillaEditor.wrapSelectedText('^[', ']');
    }
}

