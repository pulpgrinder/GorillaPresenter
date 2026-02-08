AutoplayPlugin = {
    renderHTML: async function (arg) {
        let nextSlide = "";
        let args = arg.split(/\s+/);
        let delaySeconds = parseInt(args[0].trim());
        if (isNaN(delaySeconds) || delaySeconds < 0) {
            delaySeconds = 0;
        }
        if (args.length > 1) {
            nextSlide = args[1].trim();
        }
        return `<span class="gorilla-timer" data-next-slide="${nextSlide}" data-duration="${delaySeconds}"></span>`;
    }
};