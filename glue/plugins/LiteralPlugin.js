LiteralPlugin = {
    preserved: {},

    reset: function () {
        this.preserved = {};
    },

    preprocess: async function (text) {
        if (!text) return text;

        // Extract literal blocks while handling nested {{{ }}}
        let result = '';
        let i = 0;

        while (i < text.length) {
            const literalStart = text.indexOf('{{{literal', i);
            if (literalStart === -1) {
                result += text.slice(i);
                break;
            }

            // Add everything before the literal block
            result += text.slice(i, literalStart);

            // Find the matching }}} by counting braces
            let braceCount = 0;
            let j = literalStart;
            let contentStart = -1;

            while (j < text.length) {
                if (text.slice(j, j + 3) === '{{{') {
                    if (braceCount === 0) {
                        contentStart = j + 10; // Skip past '{{{literal'
                    }
                    braceCount++;
                    j += 3;
                } else if (text.slice(j, j + 3) === '}}}') {
                    braceCount--;
                    if (braceCount === 0) {
                        // Found matching close
                        const content = text.slice(contentStart, j);
                        const id = GorillaUtility.uuid();
                        this.preserved[id] = content;
                        result += id;
                        i = j + 3;
                        break;
                    }
                    j += 3;
                } else {
                    j++;
                }
            }

            if (braceCount !== 0) {
                // Unmatched braces, just skip this
                i = literalStart + 10;
            }
        }

        return result;
    },

    postprocess: async function (text) {
        if (!text) return text;

        // Restore literal blocks with transformations
        for (const [id, content] of Object.entries(this.preserved)) {
            let processed = content;

            // 1. Escape HTML characters
            processed = processed
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            // 2. Replace spaces with &nbsp;
            processed = processed.replace(/ /g, '&nbsp;');

            // 3. Replace newlines with <br>\n
            processed = processed.replace(/\n/g, '<br>\n');

            text = text.replace(id, processed);
        }

        return text;
    }
}