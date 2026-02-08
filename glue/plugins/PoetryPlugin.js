PoetryPlugin = {
    preprocess: async function (text) {
        const preserved = [];

        // Extract and preserve fenced code blocks
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            const index = preserved.length;
            preserved.push(match);
            return `\x00PRESERVED${index}\x00`;
        });

        // Extract and preserve inline code
        text = text.replace(/`[^`\n]+`/g, (match) => {
            const index = preserved.length;
            preserved.push(match);
            return `\x00PRESERVED${index}\x00`
        });

        // Changed \s+ to just \s (single whitespace character)
        text = text.replace(/\{\{\{poetry\s(.*?)\}\}\}/gs, (match, poem) => {
            let lines = poem.split('\n');
            if (lines.length === 0) {
                return "";
            }
            const firstLine = lines.shift().trim();
            const title = firstLine === "" ? "" : GorillaMarkdown.mdparse.render(firstLine);
            const poemBody = GorillaMarkdown.mdparse.render(
                lines.join('\n').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>')
            );
            return "<div class='poetry'><div>&nbsp;</div><div><div class='poem-title'>" +
                title + "</div><div class='poem-body'>" + poemBody +
                "</div></div><div>&nbsp;</div></div>";
        });

        // Restore preserved blocks
        text = text.replace(/\x00PRESERVED(\d+)\x00/g, (match, index) => {
            return preserved[parseInt(index)];
        });

        return text;
    }
}