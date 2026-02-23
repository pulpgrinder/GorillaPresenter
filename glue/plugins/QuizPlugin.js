QuizPlugin = {

    renderHTML: async function (directive) {
        // Parse question blocks separated by blank lines
        const blocks = directive.split(/\n\s*\n/).filter(b => b.trim().length > 0);

        const questions = [];
        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 2) continue; // Need at least a question and one answer

            const questionText = lines[0];
            const answers = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('*')) {
                    answers.push({ text: line.substring(1).trim(), correct: true });
                } else {
                    answers.push({ text: line.trim(), correct: false });
                }
            }
            questions.push({ question: questionText, answers: answers });
        }

        // Shuffle questions
        QuizPlugin.shuffle(questions);

        // Build HTML using the same list format as menus/outlines
        let html = '';
        for (const q of questions) {
            html += '<ul class="gorilla-choice-list gorilla-quiz-block">\n';
            html += `<li class="gorilla-choice-item gorilla-choice-header gorilla-quiz-question">${q.question}</li>\n`;

            // Shuffle answers for this question
            QuizPlugin.shuffle(q.answers);

            for (const a of q.answers) {
                const dataValue = a.correct ? 'true' : 'false';
                html += `<li class="gorilla-choice-item gorilla-choice-multiple-choice gorilla-quiz-answer" data-value="${dataValue}">${a.text}</li>\n`;
            }
            html += '</ul>\n';
        }

        return html;
    },

    // Fisher-Yates shuffle
    shuffle: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
