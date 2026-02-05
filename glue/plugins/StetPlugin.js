StetPlugin = {
    preserved: {},
    index:0,
    reset: function() {
        this.preserved = {};
        this.index = 0;
    },
    uuid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    preprocess: async function(text) {
        // Extract stet blocks while handling nested {{{ }}}
        let result = '';
        let i = 0;
        
        while (i < text.length) {
            const stetStart = text.indexOf('{{{stet', i);
            if (stetStart === -1) {
                result += text.slice(i);
                break;
            }
            
            // Add everything before the stet block
            result += text.slice(i, stetStart);
            
            // Find the matching }}} by counting braces
            let braceCount = 0;
            let j = stetStart;
            let contentStart = -1;
            
            while (j < text.length) {
                if (text.slice(j, j + 3) === '{{{') {
                    if (braceCount === 0) {
                        contentStart = j + 7; // Skip past '{{{stet'
                    }
                    braceCount++;
                    j += 3;
                } else if (text.slice(j, j + 3) === '}}}') {
                    braceCount--;
                    if (braceCount === 0) {
                        // Found matching close
                        const content = text.slice(contentStart, j);
                        const index = this.index++;
                        let stetCode = `${this.uuid()}`
                        this.preserved[stetCode] = content;
                        result += stetCode;
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
                i = stetStart + 7;
            }
        }
        
        return result;
    },
    
    postprocess: async function(text) {
        // Restore stet blocks
        for (let key in this.preserved) {
            let value = this.preserved[key];
            text = text.replace(key, value);
        };
        
        return text;
    }
}