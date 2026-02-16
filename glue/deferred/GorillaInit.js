
document.body.style.cursor = "default";

GorillaSlideRenderer.registerPlugin('test', TestPlugin);
GorillaSlideRenderer.registerPlugin('autoplay', AutoplayPlugin);
GorillaSlideRenderer.registerPlugin('book', BookPlugin);
GorillaSlideRenderer.registerPlugin('media', MediaPlugin);
GorillaSlideRenderer.registerPlugin('menu', MenuPlugin);
GorillaSlideRenderer.registerPlugin('outline', OutlinePlugin);
GorillaSlideRenderer.registerPlugin('icon', IconPlugin);
GorillaSlideRenderer.registerPlugin('wikipedia', WikipediaPlugin);
GorillaSlideRenderer.registerPlugin('map', MapPlugin);
GorillaSlideRenderer.registerPlugin('branch', BranchPlugin);
GorillaSlideRenderer.registerPlugin('poetry', PoetryPlugin);

await window.fs.unpackZipData();
//let cursorData = await fs.readBinaryFile("GorillaCursor.png");
//let url = URL.createObjectURL(cursorData);
//document.body.style.cursor = `url(${url}) 16 16, auto`;  
GorillaMarkdown.init();
await GorillaMedia.init();
await MainMenuDriver.init();
await GorillaEditor.init();
await GorillaIconLoader.loadIcons();
await GorillaSettings.loadSettings();
await GorillaLicenseHandler.loadLicenseInfo();
await GorillaFontLoader.loadFonts();

HammerDriver.init();
await GorillaMedia.loadMediaScreens();
await GorillaThemeHandler.init();

// Apply the saved theme
GorillaThemeHandler.setTheme();
await GorillaPresenter.init();
GorillaPresenter.markDirty(false);
// Set up event listeners for theme and font stack selectors

GorillaThemeHandler.codeFontStack = GorillaSettings.settings["code-font-stack-selector"] || "--monospace-code-font-stack";
GorillaThemeHandler.bodyFontStack = GorillaSettings.settings["body-font-stack-selector"] || "--serif-font-stack";
GorillaThemeHandler.headingFontStack = GorillaSettings.settings["heading-font-stack-selector"] || "--didone-font-stack";

// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) { }

// Use our detect's results. passive applied if supported, capture will be false either way.
//elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false); 

document.getElementById("theme-selector").addEventListener("change", function (evt) { GorillaThemeHandler.themeSelected() });
document.getElementById("heading-font-stack-selector").addEventListener("change", function (evt) { GorillaThemeHandler.themeSelected() });
document.getElementById("body-font-stack-selector").addEventListener("change", function (evt) { GorillaThemeHandler.themeSelected() });
document.getElementById("code-font-stack-selector").addEventListener("change", function (evt) { GorillaThemeHandler.themeSelected() });
document.getElementById("gorilla-editor-theme-selector").addEventListener("change", function (evt) { GorillaThemeHandler.editorThemeSelected() });
document.getElementById("gorilla-editor-font-size").addEventListener("change", async function (evt) {
  console.log("Editor font size changed.");
  let fontSize = document.getElementById("gorilla-editor-font-size").value;
  GorillaSettings.settings["editorFontSize"] = fontSize;
  await GorillaSettings.saveSettings();
  document.querySelectorAll(".codejar").forEach((el) => {
    el.style.fontSize = GorillaSettings.settings["editorFontSize"] + "px";
  });
});
document.body.style.display = "grid";
//document.body.style.display = "block";
const hashNumber = parseInt(window.location.hash.substring(1));
if (hashNumber !== GorillaPresenter.currentSlideNumber + 1) {

  if (!isNaN(hashNumber) && hashNumber >= 1 && hashNumber <= GorillaSlideRenderer.slides.length) {
    GorillaPresenter.currentSlideNumber = hashNumber - 1; // Convert from 1-based hash to 0-based index
  } else {
    // Otherwise show the first slide
    GorillaPresenter.currentSlideNumber = 0;
  }

}

await GorillaCSSLoader.loadCustomCSS();

/* Rethink this... as written it causes too much distraction
const overlay = document.getElementById('nav-overlay');
const HIDE_DELAY = 500; // milliseconds to wait before hiding
let hideTimeout = null;

document.addEventListener('mousemove', function () {
  // Show the overlay
  overlay.classList.add('visible');

  // Clear any existing timeout
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }

  // Set a new timeout to hide the overlay
  hideTimeout = setTimeout(function () {
    overlay.classList.remove('visible');
  }, HIDE_DELAY);
});
*/



let slidechooser = document.getElementById("slidechooser");
slidechooser.addEventListener("change", async function (e) {
  await GorillaPresenter.showSlide(parseInt(slidechooser.value), "cutIn");
});
//document.body.style.display="none";
await GorillaPresenter.show_screen("gorilla-slide-show");
//document.body.style.display="grid";




