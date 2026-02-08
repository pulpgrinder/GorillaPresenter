TestPlugin = {
  renderHTML: async function (html) {
    // Example: Wrap all content in a div with a special class
    return `<div class="test-plugin-wrapper">test plugin</div>`;
  }
};