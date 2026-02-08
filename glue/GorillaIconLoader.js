GorillaIconLoader = {
    loadIcons: async function () {
        let iconelements = document.querySelectorAll('.ionicon');

        iconelements.forEach(async (el) => {
            let iconName = el.innerHTML.trim();

            // Check if already contains SVG (more flexible check)
            if (iconName.startsWith('<svg') || iconName.includes('<svg')) {
                // Already SVG content
                return;
            }

            if (!iconName) {
                console.warn("Empty icon name, skipping element:", el);
                return;
            }

            let iconFileName = "ionicons/" + iconName + ".svg";
            iconData = await fs.readTextFile(iconFileName);
            if (iconData) {
                el.innerHTML = iconData;
            } else {
                console.warn("Icon file not found:", iconFileName);
            }
        });
    },
}