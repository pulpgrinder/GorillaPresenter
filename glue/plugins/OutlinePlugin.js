OutlinePlugin = {
    renderHTML: async function (directive) {
        return MenuPlugin.renderDirective(directive, true);
    },
}