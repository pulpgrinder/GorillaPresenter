GorillaSlideRenderer = {

    currentText: "",
    slideData: null,
    slideShow: null,
    cursorStart: 0,
    cursorPosition: 0,
    slides: [],
    plugins: {},

    processText: async function (input) {
        //MediaPlugin.reset();
        StetPlugin.reset();
        LiteralPlugin.reset()
        input = await StetPlugin.preprocess(input);
        input = await LiteralPlugin.preprocess(input);
        for (let plugin in GorillaSlideRenderer.plugins) {
            if (GorillaSlideRenderer.plugins[plugin].reset !== undefined) {
                await GorillaSlideRenderer.plugins[plugin].reset();
            }
            if (GorillaSlideRenderer.plugins[plugin].preprocess !== undefined) {
                input = await GorillaSlideRenderer.plugins[plugin].preprocess(input);
            }
        }
        GorillaSlideRenderer.cursorPosition = GorillaEditor.getCursorPosition();
        if (GorillaSlideRenderer.cursorPosition) {
            GorillaSlideRenderer.cursorStart = GorillaSlideRenderer.cursorPosition.start;
        }
        else {
            GorillaSlideRenderer.cursorStart = 0;
        }
        GorillaSlideRenderer.slides = GorillaScript.preprocess(input);
        const renderedArray = GorillaSlideRenderer.render(GorillaSlideRenderer.slides);

        // Run postprocess and plugin HTML-transforming postprocess (those that accept an argument)
        for (let i = 0; i < renderedArray.length; i++) {
            let html = await GorillaSlideRenderer.postprocess(renderedArray[i]);
            for (let plugin in GorillaSlideRenderer.plugins) {
                const p = GorillaSlideRenderer.plugins[plugin];
                if (p.postprocess !== undefined && p.postprocess.length > 0) {
                    try {
                        const result = await p.postprocess(html);
                        if (typeof result === 'string') html = result;
                    } catch (e) {
                        console.error('Plugin postprocess (html) failed for', plugin, e);
                    }
                }
            }
            html = await StetPlugin.postprocess(html);
            html = await LiteralPlugin.postprocess(html);
            GorillaSlideRenderer.slides[i].html = html; // store processed HTML for lazy insertion
        }

    },

    render: function (slides) {
        GorillaSlideRenderer.slides = slides; // Store slides for later use
        let slideChooserContent = '';
        const renderedSlides = [];
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            GorillaMarkdown.currentClassString = "";
            // Parse title and body through markdown
            if (slide.title.trim() === '#') {
                slide.title = '';
            }
            const parsedTitle = GorillaMarkdown.mdparse.render(slide.title);
            slideChooserContent += `<option class = 'gorilla-slide-chooser-option' value="${i}">` + parsedTitle + `</option>\n`;
            const parsedBody = GorillaMarkdown.mdparse.render(slide.body);

            // Build the HTML string for this slide (not inserted into DOM yet)
            const slideHtml = `<div class="gorilla-slide-class" id="gorilla-slide-${i}">
    <div class="gorilla-slide-header-class" id="gorilla-slide-header-${i}">
        ${parsedTitle}
    </div>
    <div class="gorilla-slide-body-class" id="gorilla-slide-body-${i}">
        ${parsedBody}
    </div>
</div>`;
            renderedSlides.push(slideHtml);
        }
        let slidechooser = document.getElementById("slidechooser");
        slidechooser.innerHTML = slideChooserContent;

        return renderedSlides;
    },


    async postprocess(html) {
        const regex = /\{\{\{([\s\S]*?)\}\}\}/gm;
        const matches = [...html.matchAll(regex)];

        // Process all directives in parallel
        const replacements = await Promise.all(
            matches.map(match => {
                // Strip HTML tags and convert to plain text
                let content = match[1];
                // Replace </p> with newline
                content = content.replace(/<\/p>/gi, '\n');
                // Remove all other HTML tags
                content = content.replace(/<[^>]*>/g, '');
                // Decode HTML entities
                const textarea = document.createElement('textarea');
                textarea.innerHTML = content;
                content = textarea.value;
                // Clean up extra whitespace/newlines
                content = content.trim();
                return GorillaSlideRenderer.processSpecialDirective(content);
            })
        );

        // Replace using index counter
        let i = 0;
        html = html.replace(/\{\{\{([\s\S]*?)\}\}\}/g, () => replacements[i++]);

        return html;
    },


    async processSpecialDirective(directive) {
        let parsedDirective = directive.split(/\s+/);
        if (parsedDirective.length === 0) {
            console.error("Empty directive encountered.");
            return "(Empty directive encountered.)";
        }

        let command = parsedDirective[0].toLowerCase().trim();

        let args = directive.substring(command.length).trim();
        if (GorillaSlideRenderer.plugins[command] === undefined) {
            // If directive looks like a simple class directive (e.g. "red" or "center"),
            // treat it as a class marker and remove it quietly rather than erroring.
            // Allow letters, numbers, hyphen, underscore and spaces (multiple classes).
            if (/^[A-Za-z0-9_\- ]+$/.test(directive) && args === '') {
                // Special-case `clear`: ensure persistent class state is reset
                if (command === 'clear' && typeof GorillaMarkdown !== 'undefined') {
                    GorillaMarkdown.currentClassString = '';
                }
                return '';
            }
            // Otherwise, log an error for truly unknown special directives.
            let directiveError = `Unknown directive encountered: ${command}`;
            console.error(directiveError);
            return directiveError;
        }
        if (GorillaSlideRenderer.plugins[command].renderHTML !== undefined) {
            return await GorillaSlideRenderer.plugins[command].renderHTML(args);
        }
        else {
            return args;
        }
    },
    findSlideNumber(target) {
        for (let i = 0; i < GorillaSlideRenderer.slides.length; i++) {
            let slide = GorillaSlideRenderer.slides[i];
            if (slide.title.trim().toLowerCase().match(target.trim().toLowerCase())) {
                return i;
            }
        }
        GorillaAlert.show("Choice processor: Slide not found: " + target);
        return 0;
    },
    registerPlugin: function (name, object) {
        GorillaSlideRenderer.plugins[name.toLowerCase()] = object;
    }
}

