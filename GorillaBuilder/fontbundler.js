baseFontStacks = `
-serif-font-stack: serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --sans-serif-font-stack: sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --monospace-font-stack: monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --cursive-font-stack: cursive, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --system-ui-font-stack: system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --transitional-font-stack: Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --old-style-font-stack: 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --humanist-font-stack: font-family: Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --geometric-humanist-font-stack: Avenir, Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --classical-humanist-font-stack: Optima, Candara, 'Noto Sans', source-sans-pro, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --neo-grotesque-font-stack: Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Nimbus Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --monospace-slab-serif-font-stack: 'Nimbus Mono PS', 'Courier New', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --monospace-code-font-stack: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --industrial-font-stack: Bahnschrift, 'DIN Alternate', 'Franklin Gothic Medium', 'Nimbus Sans Narrow', sans-serif-condensed, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --rounded-sans-font-stack: ui-rounded, 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, 'Arial Rounded MT', 'Arial Rounded MT Bold', Calibri, source-sans-pro, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --slab-serif-font-stack: Rockwell, 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small', serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --antique-font-stack: Superclarendon, 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', Georgia, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --didone-font-stack: Didot, 'Bodoni MT', 'Noto Serif Display', 'URW Palladio L', P052, Sylfaen, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --handwritten-font-stack: 'Segoe Print', Chilanka, TSCu_Comic, casual, cursive, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    `;
baseFontStackOptions = {
    "Antique": "--antique-font-stack",
    "Didone": "--didone-font-stack",
    "Generic Cursive": "--cursive-font-stack",
    "Generic Serif": "--serif-font-stack",
    "Generic Sans Serif": "--sans-serif-font-stack",
    "Generic Monospace": "--monospace-font-stack",
    "Handwritten": "--handwritten-font-stack",
    "Humanist": "--humanist-font-stack",
    "Humanist (classical)": "--classical-humanist-font-stack",
    "Humanist (geometric)": "--geometric-humanist-font-stack",
    "Industrial": "--industrial-font-stack",
    "Medieval Sharp": "--medieval-sharp-font-stack",
    "Monospace Code": "--monospace-code-font-stack",
    "Monospace Slab Serif": "--monospace-slab-serif-font-stack",
    "Neo-Grotesque": "--neo-grotesque-font-stack",
    "Old Style": "--old-style-font-stack",
    "Rounded Sans": "--rounded-sans-font-stack",
    "System UI": "--system-ui-font-stack",
    "Transitional": "--transitional-font-stack",
};
const fs = require('fs');
const path = require('path');
fontCss = '';
// Use current working directory
const cwd = process.cwd();
const fontPath = path.join(cwd, 'fonts');
const outputPath = path.join(cwd, 'glue', 'bundled-fonts.css');
const fontStackCSSPath = path.join(cwd, '/glue/fontstacks.css');
console.log('fontStackCSSPath', fontStackCSSPath);
const fontStackJSPath = path.join(cwd, '/glue/fontStackOptions.js');
console.log('fontStackJSPath', fontStackJSPath);
const entries = fs.readdirSync(fontPath, { withFileTypes: true });
for (const entry of entries) {
    console.log('Found font file:', entry.name);
    baseFontStacks += `--${path.parse(entry.name).name.toLowerCase().replace(/\s+/g, '-')}-font-stack: '${path.parse(entry.name).name}';\n`;
    nameWithoutExtension = path.basename(entry.name, path.extname(entry.name));
    console.log('nameWithoutExtension' + nameWithoutExtension);
    baseFontStackOptions[nameWithoutExtension] = `--${path.parse(entry.name).name.toLowerCase().replace(/\s+/g, '-')}-font-stack`;
    const fullPath = path.join(cwd + "/fonts", entry.name);
    console.log('Full path', fullPath);
    const fileData = fs.readFileSync(fullPath, 'base64');
    const mimeType = 'font/ttf'; // Adjust based on file type
    const dataUri = `data:${mimeType};base64,${fileData}`;
    fontCss += `@font-face {
    font-family: '${path.parse(entry.name).name}';
    src: url('${dataUri}') format('truetype');
    font-weight: normal;
    font-style: normal;
}\n`;
}
fs.writeFileSync(outputPath, fontCss);
fs.writeFileSync(fontStackCSSPath, ":root{\n" + baseFontStacks + "\n}\n");
fs.writeFileSync(fontStackJSPath, 'fontStackOptions = ' + JSON.stringify(baseFontStackOptions) + ';');
console.log('Bundled fonts written to', outputPath);

