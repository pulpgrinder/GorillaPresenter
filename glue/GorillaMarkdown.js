let GorillaMarkdown = {
  currentClassString: "",

  init: function () {
    this.mdparse = window.markdownit({
      html: true,
      linkify: true,
      typographer: true
    });

    const self = this;

    // ————————————————————
    // Escape directives in inline code
    // ————————————————————
    this.mdparse.renderer.rules.code_inline = function (tokens, idx, options, env, slf) {
      const token = tokens[idx];
      // First escape HTML, then replace braces with entities
      const escaped = self.mdparse.utils.escapeHtml(token.content)
        .replace(/{{{/g, '&#123;&#123;&#123;')
        .replace(/}}}/g, '&#125;&#125;&#125;');
      return '<code' + slf.renderAttrs(token) + '>' + escaped + '</code>';
    };

    // ————————————————————
    // Escape directives in fenced code blocks
    // ————————————————————
    this.mdparse.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      const token = tokens[idx];
      const info = token.info ? self.mdparse.utils.unescapeAll(token.info).trim() : '';
      const langName = info ? info.split(/\s+/g)[0] : '';
      const langClass = langName ? ' class="language-' + self.mdparse.utils.escapeHtml(langName) + '"' : '';

      // First escape HTML, then replace braces with entities
      const escaped = self.mdparse.utils.escapeHtml(token.content)
        .replace(/{{{/g, '&#123;&#123;&#123;')
        .replace(/}}}/g, '&#125;&#125;&#125;');

      return '<pre><code' + langClass + '>' + escaped + '</code></pre>\n';
    };

    // ————————————————————
    // CORE RULER: Process inline classes BEFORE rendering
    // ————————————————————
    this.mdparse.core.ruler.after('inline', 'apply_inline_classes', function (state) {
      state.tokens.forEach(blockToken => {
        if (blockToken.type !== 'inline' || !blockToken.children) return;

        const children = blockToken.children;
        let activeClasses = [];

        for (let i = 0; i < children.length; i++) {
          const token = children[i];

          // Skip if this is the first text token and starts with a directive
          // (let block-level rules handle it)
          if (i === 0 && token.type === 'text' && token.content.match(/^[\s\n]*{{{/)) {
            continue;
          }

          // Process text tokens for directives
          if (token.type === 'text' && token.content.includes('{{{')) {
            const regex = /{{{([^}]*)}}}/g;
            let match;

            regex.lastIndex = 0;
            while ((match = regex.exec(token.content)) !== null) {
              const directive = match[1].trim();
              const cmd = directive.split(/\s+/)[0]?.toLowerCase() || '';

              // Check if it's a special directive - if so, keep it
              if (GorillaSlideRenderer.plugins[cmd] !== undefined) {
                continue; // Don't process or remove special directives
              }

              if (!directive || directive.toLowerCase() === 'clear') {
                activeClasses = [];
              } else {
                activeClasses = directive.split(/\s+/).filter(Boolean);
              }
            }

            // Remove non-special directives from text
            token.content = token.content.replace(/{{{([^}]*)}}}/g, (match, content) => {
              const cmd = content.trim().split(/\s+/)[0]?.toLowerCase() || '';
              if (GorillaSlideRenderer.plugins[cmd] !== undefined) {
                return match; // Keep special directives
              }
              return ''; // Remove class directives
            });
          }

          // Apply active classes to opening tags
          if (token.type.endsWith('_open') && activeClasses.length > 0) {
            activeClasses.forEach(cls => {
              token.attrPush(['class', cls]);
            });
          }
        }
      });
    });

    // ————————————————————
    // BLOCK LEVEL (paragraphs, headings, etc.)
    // ————————————————————
    const blockTypes = [
      'paragraph_open', 'heading_open', 'blockquote_open',
      'list_item_open', 'bullet_list_open', 'ordered_list_open',
      'table_open', 'tr_open', 'th_open', 'td_open', 'fence_open'
    ];

    blockTypes.forEach(type => {
      const orig = this.mdparse.renderer.rules[type] ||
        ((t, i, o, e, s) => s.renderToken(t, i, o));

      this.mdparse.renderer.rules[type] = function (tokens, idx, options, env, slf) {
        const token = tokens[idx];

        // Check for directive at very start of block
        const content = tokens[idx + 1];
        if (content && content.children && content.children[0]?.type === 'text') {
          const first = content.children[0];
          const match = first.content.match(/^[\s\n]*{{{\s*(.*?)\s*}}}/);
          if (match) {
            const cmd = match[1].trim().split(/\s+/)[0]?.toLowerCase() || '';
            if (GorillaSlideRenderer.plugins[cmd] === undefined) {
              // Set persistent class AND apply to current block
              self.currentClassString = cmd || "";
              if (self.currentClassString) {
                token.attrPush(['class', self.currentClassString]);
              }

              // Only remove non-special directives from content
              first.content = first.content.slice(match[0].length).trimStart();
              if (first.content === '') {
                content.children.shift();
              }
            }
          } else {
            // No directive at start - apply persistent class if set
            if (self.currentClassString) {
              token.attrPush(['class', self.currentClassString]);
            }
          }
        } else {
          // No content - apply persistent class if set
          if (self.currentClassString) {
            token.attrPush(['class', self.currentClassString]);
          }
        }

        return orig(tokens, idx, options, env, slf);
      };
    });

    this.mdparse.inline.ruler.after('emphasis', 'sub', subscript);
    this.mdparse.inline.ruler.after('emphasis', 'sup', superscript);
    footnote_plugin(this.mdparse);
  },

  render: function (text) {
    this.currentClassString = ""; // reset per render
    return this.mdparse.render(text);
  }
};