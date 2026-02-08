GorillaLicenseHandler = {
    loadLicenseInfo: async function () {
        licenseData = "";
        try {
            licensefiles = await fs.readDirectory("licenses/*");
            licensefiles = licensefiles.sort();
            for (const file of licensefiles) {
                let fileData = await fs.readTextFile(file);
                licenseData += `\n\n---\n\n# License File: ${file}\n\n` + fileData;
            }
            let aboutScreen = document.getElementById("gorilla-about-screen");
            aboutScreen.innerHTML = GorillaMarkdown.mdparse.render(licenseData);
        } catch (e) {
            console.error("Error loading license files:", e);
        }
    },
};