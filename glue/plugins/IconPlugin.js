IconPlugin = {
    renderHTML: async function (directive) {
        let iconBasename = directive.trim();
        let iconTitle = iconBasename.replace(/\-/g, ' ');
        const iconSpec = "ionicons/" + iconBasename + ".svg";
        let iconExists = await fs.fileExists(iconSpec);
        if (iconExists) {
            let iconData = await fs.readTextFile(iconSpec);
            iconData = iconData.replace(/<svg /, `<svg title="${iconTitle}" aria-label="${iconTitle}" `);
            return `<span class="ionicon">${iconData}</span>`;
        }
        else {
            console.warn("Icon file not found for directive: " + directive);
            return `<span class="gorilla-media-missing">[Missing icon: ${directive}]</span>`;
        }
    }
}