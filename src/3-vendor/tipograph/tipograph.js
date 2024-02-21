/**
 * tipograph v0.7.2 | Copyright (c) 2020 Petr Nevyhoštěný
 */

var tipograph = (function () {
    'use strict';

    /// #### html
    ///
    /// HTML tags are kept as they are. Moreover, it also preserves whole contents of the following tags: pre, code, style,
    /// script.

    function html () {
        return function (input) {
            var result = null;
            var last = 0;
            var output = [];

            while ((result = findTag(input, last)) !== null) {
                output.push({ transform: true, content: input.slice(last, result[0]) });
                output.push({ transform: false, content: input.slice(result[0], result[1]) });
                last = result[1];
            }

            output.push({ transform: true, content: input.slice(last) });

            return output;
        };
    }

    function findTag(input, last) {
        // global flag needed for setting `lastIndex` property when doing `exec`
        var pattern = /<[/!]?[a-z][a-z0-9-_]*|<!--/gi;
        pattern.lastIndex = last;

        var tagEnd;
        var result = null;
        if ((result = pattern.exec(input)) !== null) {
            var tag = result[0].toLowerCase();
            var start = result.index;
            if (tag === '<!--') {
                var commentEnd = findCommentEnd(input, pattern.lastIndex);
                return [start, commentEnd];
            } else if (['<pre', '<code', '<style', '<script'].indexOf(tag) != -1) {
                var closeTag = new RegExp(tag[0] + '/' + tag.slice(1), 'gi');
                closeTag.lastIndex = pattern.lastIndex;
                if ((result = closeTag.exec(input)) !== null) {
                    tagEnd = findTagEnd(input, closeTag.lastIndex);
                    return [start, tagEnd];
                } else {
                    // not closed special tag
                    return [start, input.length];
                }
            } else {
                tagEnd = findTagEnd(input, pattern.lastIndex);
                return [start, tagEnd];
            }
        } else {
            return null;
        }
    }

    function findTagEnd(input, last) {
        var state = 'initial';
        var escape = false;

        for (var i = last; i < input.length; i++) {
            if (state === 'initial') {
                if (input[i] === '>') {
                    return i + 1;
                } else if (input[i] === '"') {
                    state = 'double';
                } else if (input[i] === '\'') {
                    state = 'single';
                }
            } else if (state === 'double') {
                if (input[i] === '"' && !escape) {
                    state = 'initial';
                } else if (input[i] === '\\') {
                    escape = true;
                } else {
                    escape = false;
                }
            } else if (state === 'single') {
                if (input[i] === '\'' && !escape) {
                    state = 'initial';
                } else if (input[i] === '\\') {
                    escape = true;
                } else {
                    escape = false;
                }
            }
        }

        return input.length;
    }

    function findCommentEnd(input, last) {
        var pattern = /-->/g;
        pattern.lastIndex = last;

        var result = null;
        if ((result = pattern.exec(input)) !== null) {
            return result.index + 3;
        } else {
            return input.length;
        }
    }

    /// #### plain
    ///
    /// Input content is preserved as it is.

    function plain () {
        return function (input) {
            return [{ transform: true, content: input }];
        };
    }

    var formats = /*#__PURE__*/Object.freeze({
        __proto__: null,
        html: html,
        plain: plain
    });

    var DOUBLE_OPEN_UP = '\u201C';
    var DOUBLE_CLOSE_UP = '\u201D';
    var SINGLE_OPEN_UP = '\u2018';
    var SINGLE_CLOSE_UP = '\u2019';
    var DOUBLE_OPEN_DOWN = '\u201E';
    var SINGLE_OPEN_DOWN = '\u201A';
    var DOUBLE_LEFT = '\u00AB';
    var SINGLE_LEFT = '\u2039';
    var DOUBLE_RIGHT = '\u00BB';
    var SINGLE_RIGHT = '\u203A';
    var DOUBLE_LEFT_SPACE = '\u00AB\u00A0';
    var SINGLE_LEFT_SPACE = '\u2039\u00A0';
    var DOUBLE_SPACE_RIGHT = '\u00A0\u00BB';
    var SINGLE_SPACE_RIGHT = '\u00A0\u203A';
    var DOUBLE_TOP_CORNER = '\u300C';
    var SINGLE_TOP_CORNER = '\u300E';
    var DOUBLE_BOTTOM_CORNER = '\u300D';
    var SINGLE_BOTTOM_CORNER = '\u300F';

    var quotes = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DOUBLE_OPEN_UP: DOUBLE_OPEN_UP,
        DOUBLE_CLOSE_UP: DOUBLE_CLOSE_UP,
        SINGLE_OPEN_UP: SINGLE_OPEN_UP,
        SINGLE_CLOSE_UP: SINGLE_CLOSE_UP,
        DOUBLE_OPEN_DOWN: DOUBLE_OPEN_DOWN,
        SINGLE_OPEN_DOWN: SINGLE_OPEN_DOWN,
        DOUBLE_LEFT: DOUBLE_LEFT,
        SINGLE_LEFT: SINGLE_LEFT,
        DOUBLE_RIGHT: DOUBLE_RIGHT,
        SINGLE_RIGHT: SINGLE_RIGHT,
        DOUBLE_LEFT_SPACE: DOUBLE_LEFT_SPACE,
        SINGLE_LEFT_SPACE: SINGLE_LEFT_SPACE,
        DOUBLE_SPACE_RIGHT: DOUBLE_SPACE_RIGHT,
        SINGLE_SPACE_RIGHT: SINGLE_SPACE_RIGHT,
        DOUBLE_TOP_CORNER: DOUBLE_TOP_CORNER,
        SINGLE_TOP_CORNER: SINGLE_TOP_CORNER,
        DOUBLE_BOTTOM_CORNER: DOUBLE_BOTTOM_CORNER,
        SINGLE_BOTTOM_CORNER: SINGLE_BOTTOM_CORNER
    });

    /// #### chinese

    var chinese = {
        quotes: [
            [DOUBLE_TOP_CORNER, DOUBLE_BOTTOM_CORNER],
            [SINGLE_TOP_CORNER, SINGLE_BOTTOM_CORNER]
        ],
        dash: 'en',
        rules: []
    };

    /// #### czech

    var czech = {
        quotes: [[DOUBLE_OPEN_DOWN, DOUBLE_OPEN_UP], [SINGLE_OPEN_DOWN, SINGLE_OPEN_UP]],
        dash: 'en',
        rules: [
            // non-breaking space after one-letter prepositions and conjuctions
            [/(\s|^)([KkSsVvZzOoUuAI])(?:\s+)(\S)/g, '$1$2\u00A0$3']
        ]
    };

    /// #### danish

    var danish = {
        quotes: [[DOUBLE_RIGHT, DOUBLE_LEFT], [DOUBLE_OPEN_DOWN, DOUBLE_OPEN_UP]],
        dash: 'en',
        rules: []
    };

    /// #### english

    var english = {
        quotes: [[DOUBLE_OPEN_UP, DOUBLE_CLOSE_UP], [SINGLE_OPEN_UP, SINGLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### finnish

    var finnish = {
        quotes: [[DOUBLE_CLOSE_UP, DOUBLE_CLOSE_UP], [SINGLE_CLOSE_UP, SINGLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### french

    var french = {
        quotes: [[DOUBLE_LEFT_SPACE, DOUBLE_SPACE_RIGHT], [DOUBLE_OPEN_UP, DOUBLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### german

    var german = {
        quotes: [[DOUBLE_OPEN_DOWN, DOUBLE_OPEN_UP], [SINGLE_OPEN_DOWN, SINGLE_OPEN_UP]],
        dash: 'en',
        rules: []
    };

    /// #### italian

    var italian = {
        quotes: [[DOUBLE_LEFT, DOUBLE_RIGHT], [DOUBLE_OPEN_UP, DOUBLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### japanese

    var japanese = {
        quotes: [
            [DOUBLE_TOP_CORNER, DOUBLE_BOTTOM_CORNER],
            [SINGLE_TOP_CORNER, SINGLE_BOTTOM_CORNER]
        ],
        dash: 'en',
        rules: []
    };

    /// #### japanese

    var norwegian = {
        quotes: [[DOUBLE_LEFT, DOUBLE_RIGHT], [SINGLE_CLOSE_UP, SINGLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### polish

    var polish = {
        quotes: [[DOUBLE_OPEN_DOWN, DOUBLE_CLOSE_UP], [DOUBLE_LEFT, DOUBLE_RIGHT]],
        dash: 'en',
        rules: []
    };

    /// #### portuguese

    var portuguese = {
        quotes: [[DOUBLE_OPEN_UP, DOUBLE_CLOSE_UP], [SINGLE_OPEN_UP, SINGLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### russian

    var russian = {
        quotes: [[DOUBLE_LEFT, DOUBLE_RIGHT], [DOUBLE_OPEN_DOWN, DOUBLE_OPEN_UP]],
        dash: 'en',
        rules: []
    };

    /// #### spanish

    var spanish = {
        quotes: [[DOUBLE_LEFT, DOUBLE_RIGHT], [DOUBLE_OPEN_UP, DOUBLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### swedish

    var swedish = {
        quotes: [[DOUBLE_CLOSE_UP, DOUBLE_CLOSE_UP], [SINGLE_CLOSE_UP, SINGLE_CLOSE_UP]],
        dash: 'en',
        rules: []
    };

    /// #### swiss

    var swiss = {
        quotes: [[DOUBLE_LEFT, DOUBLE_RIGHT], [SINGLE_LEFT, SINGLE_RIGHT]],
        dash: 'en',
        rules: []
    };

    var languages = /*#__PURE__*/Object.freeze({
        __proto__: null,
        chinese: chinese,
        czech: czech,
        danish: danish,
        english: english,
        finnish: finnish,
        french: french,
        german: german,
        italian: italian,
        japanese: japanese,
        norwegian: norwegian,
        polish: polish,
        portuguese: portuguese,
        russian: russian,
        spanish: spanish,
        swedish: swedish,
        swiss: swiss
    });

    /// #### hyphens
    ///
    /// Hyphens are present on our keyboards and are used mostly to separate multipart words ("cost-effective") or
    /// multiword phrases which need to be together ("high-school grades"). Dashes come in two sizes: en dash and em dash.
    /// En dash is used instead of hyphen in number ranges ("1-5"), or when two consecutive hyphens are found. Em dash is
    /// use when three consecutive hyphens are found. Both can be used as a break in a sentence ("tipograph - even if it's
    /// just a set of simple rules - can improve typography in your content"). Whether en dash or em dash will be used for
    /// this case depends on the setting of the language or it can be overridden by `dash: 'en' | 'em'` in tipograph
    /// options.

    function hyphens (language, options) {
        var enRule = [/\u0020+-\u0020+/g, '\u0020\u2013\u0020'];
        var emRule = [/\u0020+-\u0020+/g, '\u200a\u2014\u200a'];

        var dash = options.dash || language.dash;

        var dashRule = enRule;
        switch (dash) {
            case 'en':
                dashRule = enRule;
                break;
            case 'em':
                dashRule = emRule;
                break;
            default:
                console.warn('invalid option `dash: ' + dash + '`');
                break;
        }

        // NOTE: consecutive hyphens (2 or 3) are always transformed, because it's a user's choice, even if it is bad in the
        //       context
        return [
            // em dash
            [/\u0020*---(\r?\n|$)/g, '\u200a\u2014$1'],
            [/\u0020*---\u0020*/g, '\u200a\u2014\u200a'],
            // en dash
            [/--/g, '\u2013'],
            // number range
            [/(\d)-(\d)/g, '$1\u2013$2'],
            // default dash
            dashRule
        ];
    }

    /// #### language
    ///
    /// This preset only applies language specific rules defined in language given at tipograph instance initialization.

    function language (language) {
        return language.rules;
    }

    /// #### math
    ///
    /// Unfortunately, majority of nice mathematical symbols is not present on our keyboard. Where it make sense,
    /// *tipograph* tries to put them instead of their poor substitues. For example, minus sign (that's right, even minus
    /// sign has its special character) instead of hyphen, multiplication sign instead of the letter "x", etc. Imagine how
    /// you would write this formula just by hand: 2 * 3 != 5.

    function math () {
        return [
            // subtraction
            [/(\d\s)-(\s\d)/g, '$1\u2212$2'],
            // plusminus
            [/\+-/g, '\u00B1'],
            // negative
            [/-(\d)/g, '\u2212$1'],
            // multiplication
            [/(\d\s)[x*](\s\d)/g, '$1\u00D7$2'],
            // division
            [/(\d\s)\/(\s\d)/g, '$1\u00F7$2'],
            // inequality
            [/!=/g, '\u2260']
        ];
    }

    /// #### quotes
    ///
    /// Nice quotes are probably the most visible feature of correct typography. On our keyboards, we have just these
    /// straight one which are pretty ugly. However, *tipograph* tries to replace them with their correct counterparts - and
    /// it even takes language habits into account. Moreover, it attempts to handle apostrophes, inch and foot units
    /// symbols, or fix some writers' bad habbits (such as two consecutive commas in order to imitate bottom 99-shaped
    /// quotes).

    function quotes$1 (language) {
        var doubleOpen = language.quotes[0][0];
        var doubleClose = language.quotes[0][1];
        var singleOpen = language.quotes[1][0];
        var singleClose = language.quotes[1][1];

        // HACK: \u200B is used internally by tipograph to separate input format (e.g., html) tag placeholders from the
        //       other content.

        return [
            // two commas into double open down
            [/(\s|\(|^|\u200B),,([^"']*)(\S)(?:"|'')/g, '$1\u201E$2$3' + doubleClose],
            // one comma into single open down in certain cases
            [/(\s|\(|^|\u200B),(?!\s)([^']*)(\S)'/g, '$1\u201A$2$3' + singleClose],
            // apostrophe
            [/([a-z])'([a-z])/gi, '$1\u2019$2'],
            // decades
            [/(\s|\u200B)'(\d{2})/g, '$1\u2019$2'],
            // double curly quotes
            [/(\s|\(|^|\u200B)"(?!\s)([^"]*)(\S)"/g, '$1' + doubleOpen + '$2$3' + doubleClose],
            [/(\s|\(|^|\u200B)&quot;(?!\s)((?!&quot;).*)(\S)&quot;/g, '$1' + doubleOpen + '$2$3' + doubleClose],
            // single curly quotes
            [/(\s|\(|^|\u200B)'(?!\s)([^']*)(\S)'/g, '$1' + singleOpen + '$2$3' + singleClose],
            // inches
            [/(\d)"/g, '$1\u2033'],
            // feet
            [/(\d)'/g, '$1\u2032']
        ];
    }

    /// #### spaces
    ///
    /// Even that they are not visible, spaces play important role in typography. Only one word space should be used at a
    /// time. Also, in some cases, there should be non-breaking space instead of normal one (for example after some special
    /// symbols).

    function spaces () {
        return [
            // multiple spaces
            [/ {2,}/g, ' '],
            // special symbols: (paragraph, section, copyright, trademark, registered trademark)
            [/(\u00B6|\u00A7|\u00A9|\u2122|\u00AE) /g, '$1\u00A0']
        ];
    }

    /// #### symbols
    ///
    /// There are a lot of special symbols which we don't know how to write and that makes us sad. Instead, we tend to use
    /// some substitues for them. And *tipograph* replaces these substitues with their actual characters, for example
    /// copyright or trademark symbols. It also changes "??", "?!" and "!?" into ligature counterparts. Also, multiple
    /// question marks (more than two) or exclamation points (more than one) are squashed.

    function symbols () {
        return [
            // copyright (\s before (?:c|C) not to match e.g. "12(c)")
            [/(\s|^)\((?:c|C)\)\s?/g, '$1\u00A9\u00A0'],
            // trademark
            [/\((?:tm|TM)\)\s?/g, '\u2122\u00A0'],
            // registered trademark
            [/\((?:r|R)\)\s?/g, '\u00AE\u00A0'],
            // ellipsis
            [/([^.]|^)\.\.\.([^.]|$)/g, '$1\u2026$2'],
            // arrows
            [/<-/g, '\u2190'],
            [/&lt;-/g, '\u2190'],
            [/->/g, '\u2192'],
            [/-&gt;/g, '\u2192'],
            // question/exclamation marks
            [/\?!+/g, '\u2048'],
            [/!\?+/g, '\u2049'],
            [/\?{2,}/g, '\u2047'],
            [/!{2,}/g, '!'],
        ];
    }

    var presets = /*#__PURE__*/Object.freeze({
        __proto__: null,
        hyphens: hyphens,
        language: language,
        math: math,
        quotes: quotes$1,
        spaces: spaces,
        symbols: symbols
    });

    /// #### html
    ///
    /// Special characters are replaced with corresponding HTML entities (in form &entity;).

    var html$1 = {
        '\u00A0': '&nbsp;',
        '\u00A7': '&sect;',
        '\u00A9': '&copy;',
        '\u00AE': '&reg;',
        '\u00B1': '&plusmn;',
        '\u00B6': '&para;',
        '\u2122': '&trade;',
        '\u2013': '&ndash;',
        '\u2014': '&mdash;',
        '\u2026': '&hellip;',
        '\u2190': '&larr;',
        '\u2192': '&rarr;',
        '\u2212': '&minus;',
        '\u00D7': '&times;',
        '\u2260': '&ne;',
        '\u00AB': '&laquo;',
        '\u00BB': '&raquo;',
        '\u2018': '&lsquo;',
        '\u2019': '&rsquo;',
        '\u201A': '&sbquo;',
        '\u2032': '&prime;',
        '\u2033': '&Prime;',
        '\u201C': '&ldquo;',
        '\u201D': '&rdquo;',
        '\u201E': '&bdquo;'
    };

    /// #### latex
    ///
    /// Special characters are replaced with corresponding LaTeX macros, sometimes wrapped in inline math block.

    var latex = {
        '\u00A0': '~',
        '\u00B1': '\\(\\pm\\)',
        '\u2013': '--',
        '\u2014': '---',
        '\u2026': '\\textellipsis',
        '\u2190': '\\(\\leftarrow\\)',
        '\u2192': '\\(\\rightarrow\\)',
        '\u2212': '\\(-\\)',
        '\u00D7': '\\(\\times\\)',
        '\u2260': '\\(\\neq\\)',
        '\u00AB': '\\guillemotleft',
        '\u00BB': '\\guillemotright',
        '\u2018': '`',
        '\u2019': '\'',
        '\u2032': '\\(\'\\)',
        '\u2033': '\\(\'\'\\)',
        '\u201C': '``',
        '\u201D': '\'\'',
    };

    var post = /*#__PURE__*/Object.freeze({
        __proto__: null,
        html: html$1,
        latex: latex
    });

    function matrix(n, m) {
        var mat = new Array(n);
        for (var i = 0; i < n; i++) {
            mat[i] = new Array(m);
        }
        return mat;
    }

    function argmin(vals) {
        var min = 0;
        for (var i = 1; i < vals.length; i++) {
            if (vals[i] < vals[min]) {
                min = i;
            }
        }
        return min;
    }

    function align(fst, snd) {
        var n = fst.length;
        var m = snd.length;

        // edit distance matrix
        var dist = matrix(n + 1, m + 1);
        // indices to strings where the chars are equal
        var equal = [];

        // NOTE: these weights must be set in a way that they build such tables which lead to alignments
        //       corresponding to actual rules transformations performed by tipograph
        var ins = 3;
        var del = 1;
        var sub = 3;

        // set the "trivial" cells
        dist[0][0] = 0;

        for (var k = 0; k < m; k++) {
            dist[0][k + 1] = dist[0][k] + ins;
        }

        for (var l = 0; l < n; l++) {
            dist[l + 1][0] = dist[l][0] + del;
        }

        // build the table
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < m; j++) {
                if (fst[i] === snd[j]) {
                    dist[i + 1][j + 1] = dist[i][j];
                    equal.push([i, j]);
                } else {
                    // d_del, d_sub, d_ins
                    var dists = [dist[i][j + 1] + del, dist[i][j] + sub, dist[i + 1][j] + ins];
                    var min = argmin(dists);
                    dist[i + 1][j + 1] = dists[min];
                }
            }
        }

        if (equal.length === 0) {
            // no characters are equal
            return null;
        } else {
            // find the indices whose characters have the minimal distance
            var out = argmin(equal.map(function (coords) {
                return dist[coords[0] + 1][coords[1] + 1];
            }));

            return equal[out];
        }
    }

    function find(original, converted) {
        // add sentinel chars which always match each other
        original += '\0';
        converted += '\0';

        var changes = [];
        var i = 0;
        var j = 0;
        while (i < original.length && j < converted.length) {
            if (original[i] == converted[j]) {
                i++;
                j++;
            } else {
                var alignment;
                // NOTE: this bound must be large enough to cover the longest rule transformation
                var bound = 10;

                // NOTE: this loop is guaranteed to terminate because of '\0's at the ends
                do {
                    alignment = align(original.slice(i, i + bound), converted.slice(j, j + bound));
                    bound *= 2;
                } while (alignment === null);

                changes.push([[i, i + alignment[0]], [j, j + alignment[1]]]);
                i += alignment[0] + 1;
                j += alignment[1] + 1;
            }
        }

        return changes;
    }

    var defaultOptions = {
        format: 'plain',
        language: 'english',
        presets: Object.keys(presets),
        options: {},
    };

    function getFormat(option) {
        if (typeof option === 'string') {
            if (typeof formats[option] !== 'undefined') {
                return formats[option]();
            } else {
                throw new Error(
                    'Unsupported format: ' + option + '. Choose one from ' +
                    Object.keys(formats).join(', ') + ' or pass a function.'
                );
            }
        } else if (typeof option === 'function') {
            return option();
        } else {
            throw new Error('Format option must be either string or function.');
        }
    }

    function getLanguage(option) {
        if (typeof option === 'string') {
            if (typeof languages[option] !== 'undefined') {
                return languages[option];
            } else {
                throw new Error(
                    'Unsupported language: ' + option + '. Choose one from ' +
                    Object.keys(languages).join(', ') + ' or pass a object.'
                );
            }
        } else if (typeof option === 'object') {
            if (typeof option.quotes === 'undefined') {
                option.quotes = english.quotes;
            }

            if (typeof option.dash === 'undefined') {
                option.dash = english.dash;
            }

            if (typeof option.rules === 'undefined') {
                option.rules = english.rules;
            }

            // TODO: check correct option interface

            return option;
        } else {
            throw new Error('Language option must be either string or object.');
        }
    }

    function getPresets(option, language, options) {
        if (Array.isArray(option)) {
            return option.map(function (preset) {
                if (typeof preset === 'string' && typeof presets[preset] === 'undefined') {
                    throw new Error(
                        'Unsupported preset: ' + preset + '. Choose one from ' + Object.keys(presets).join(', ') + '.'
                    );
                } else if (typeof preset === 'function') {
                    return preset(language, options);
                } else {
                    return presets[preset](language, options);
                }
            });
        } else {
            throw new Error('Presets option must be either array containing a preset name or preset definition.');
        }
    }

    function getPost(option) {
        if (typeof post[option] !== 'undefined') {
            return post[option];
        } else if (typeof option === 'undefined') {
            return null;
        } else if (typeof option === 'string') {
            throw new Error(
                'Unsupported postprocessing format: ' + option + '. Choose one from ' +
                Object.keys(post).join(', ') + ' or pass a object.'
            );
        } else {
            throw new Error('Post option must be string corresponding to an available postprocessing format.');
        }
    }

    function tipograph(options) {
        options = Object.assign({}, defaultOptions, options);

        var format = getFormat(options.format);
        var language = getLanguage(options.language);
        var pipeline = getPresets(options.presets, language, options.options);
        var postMap = getPost(options.post);

        return function (input, callback) {
            if (typeof input !== 'string') {
                throw new Error('Only strings are supported as input.');
            }

            // preprocess input
            var processed = format(input);

            var tokens = [];
            var content = '';

            // concatenate tokens but replace each formatting token with a placeholder
            for (var i = 0; i < processed.length; i++) {
                if (processed[i].transform) {
                    content += processed[i].content;
                } else {
                    content += '\u200B<tipograph[' + tokens.length + ']>\u200B';
                    tokens.push(processed[i].content);
                }
            }

            // apply transformations
            for (var p = 0; p < pipeline.length; p++) {
                for (var r = 0; r < pipeline[p].length; r++) {
                    var rule = pipeline[p][r];

                    content = content.replace(rule[0], rule[1]);
                }
            }

            // replace placeholders with their original content
            content = content.replace(/\u200B<tipograph\[(\d+)\]>\u200B/g, function (match, index) {
                return tokens[index];
            });

            if (postMap !== null) {
                var postprocessed = '';
                for (var j = 0; j < content.length; j++) {
                    if (typeof postMap[content[j]] === 'string') {
                        postprocessed += postMap[content[j]];
                    } else {
                        postprocessed += content[j];
                    }
                }
                content = postprocessed;
            }

            if (typeof callback === 'function') {
                var changes = find(input, content);
                return callback(content, changes);
            } else {
                return content;
            }
        };
    }

    tipograph.extend = function (extensions) {
        var names = Object.keys(presets);

        if (Array.isArray(extensions)) {
            return names.concat(extensions);
        } else if (typeof extensions !== 'undefined') {
            throw new Error('Presets can be extended only with an array of custom presets');
        } else {
            return names;
        }
    };

    // deprecated
    tipograph.presets = tipograph.extend;

    // export some internals
    tipograph.quotes = quotes;
    tipograph.languages = languages;

    return tipograph;

}());
