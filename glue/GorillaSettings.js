let GorillaSettings = {
    loadSettings: async function() {
        settingsData = await fs.readTextFile("settings.json");
        GorillaSettings.savedSettings = settingsData;
        if(settingsData){
        try{
            const settings = JSON.parse(settingsData);
            GorillaSettings.settings = settings;
           
            let settingsFields = document.getElementsByClassName("settingsvalue");
            for (let i = 0; i < settingsFields.length; i++) {
                let field = settingsFields[i];
                let varName = field.getAttribute("variable");
                if (varName && settings[varName] !== undefined) {
                    field.value = settings[varName];
                }
            }               
        } catch(e){
            GorillaPresenter.notify("Error parsing settings.json:", e);
        }
        }
      document.querySelectorAll(".codejar").forEach((el) => { 
        el.style.fontSize = GorillaSettings.settings["editorFontSize"] + "px";
      });           
    },
    async saveSettings() {
        let settingsFields = document.getElementsByClassName("settingsvalue");
        for (let i = 0; i < settingsFields.length; i++) {
            let field = settingsFields[i];
            let varName = field.getAttribute("variable");
            if (varName) {
                GorillaSettings.settings[varName] = field.value;
            }
        }
        const settingsData = JSON.stringify(GorillaSettings.settings, null, 2);
        if(settingsData === GorillaSettings.savedSettings){
            return; // No changes
        }
        GorillaSettings.savedSettings = settingsData;
        await fs.writeTextFile("settings.json", settingsData);
        GorillaPresenter.markDirty(true);
        fs.zipModified = true;
    },

}