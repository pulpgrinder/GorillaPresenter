#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Use current working directory
const cwd = process.cwd();
const templatePath = path.join(cwd, 'template', 'index.template.html');
const gluePath = path.join(cwd, 'glue');
const bundlePath = path.join(cwd, 'bundle');
const outputPath = path.join(bundlePath, 'index.bundled.html');

// Step 1: Read the template file
function readTemplate() {
  if (!fs.existsSync(path.join(cwd, 'template'))) {
    console.error('Error: template subdirectory does not exist in current directory');
    process.exit(1);
  }

  if (!fs.existsSync(templatePath)) {
    console.error('Error: index.template.html file does not exist in template subdirectory');
    process.exit(1);
  }

  return fs.readFileSync(templatePath, 'utf8');
}

// Step 2: Recursively read JS and CSS files from glue directory
function readGlueFiles(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return { css: '', jsImmediate: '', jsDeferred: '' };
  }

  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      console.log('Found file:', fullPath);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.js' || ext === '.css') {
          // Check if file is in deferred subdirectory
          const relativePath = path.relative(dir, fullPath);
          const isDeferred = relativePath.startsWith('deferred' + path.sep);
          files.push({ path: fullPath, ext, isDeferred });
        }
      }
    }
  }

  traverse(dir);

  if (files.length === 0) {
    return { css: '', jsImmediate: '', jsDeferred: '' };
  }

  // Sort files for consistent output
  files.sort((a, b) => a.path.localeCompare(b.path));

  // Generate inlined code separately for CSS, immediate JS, and deferred JS
  let cssCode = '';
  let jsImmediateCode = '';
  let jsDeferredCode = '';

  for (const file of files) {
    const content = fs.readFileSync(file.path, 'utf8');

    if (file.ext === '.css') {
      cssCode += `<style>\n${content}\n</style>\n`;
    } else if (file.ext === '.js') {
      if (file.isDeferred) {
        // Add file comment and ensure proper separation
        console.log(`Adding to deferred: ${path.basename(file.path)}`);
        jsDeferredCode += `\n// ${path.basename(file.path)}\n${content}\n`;
      } else {
        // Always add immediate JS files, even if empty
        console.log(`Adding to immediate: ${path.basename(file.path)} (${content.length} bytes)`);
        jsImmediateCode += `<script>\n${content}\n</script>\n`;
      }
    }
  }

  console.log(`\nTotal immediate JS length: ${jsImmediateCode.length}`);
  console.log(`Total deferred JS length: ${jsDeferredCode.length}`);

  // Wrap deferred JS in DOMContentLoaded listener only if there's deferred code
  if (jsDeferredCode.trim()) {
    jsDeferredCode = `<script>
document.addEventListener('DOMContentLoaded', async () => {
${jsDeferredCode}});
</script>
`;
  }

  return { css: cssCode, jsImmediate: jsImmediateCode, jsDeferred: jsDeferredCode };
}

// Main execution
try {
  const templateContent = readTemplate();
  const { css, jsImmediate, jsDeferred } = readGlueFiles(gluePath);

  // Find insertion points
  const headCloseIndex = templateContent.lastIndexOf('</head>');
  const bodyCloseIndex = templateContent.lastIndexOf('</body>');

  if (headCloseIndex === -1) {
    console.error('Error: </head> tag not found in template file');
    process.exit(1);
  }

  if (bodyCloseIndex === -1) {
    console.error('Error: </body> tag not found in template file');
    process.exit(1);
  }

  // Build the bundled content
  let bundledContent = templateContent;

  // Insert CSS before </head>
  if (css) {
    bundledContent =
      bundledContent.slice(0, headCloseIndex) +
      css +
      bundledContent.slice(headCloseIndex);
  }

  // Recalculate body close index if we added CSS
  let newBodyCloseIndex = bundledContent.lastIndexOf('</body>');

  // Insert immediate JS before </body> (so it loads before DOMContentLoaded fires)
  if (jsImmediate) {
    bundledContent =
      bundledContent.slice(0, newBodyCloseIndex) +
      jsImmediate + '\n' +
      bundledContent.slice(newBodyCloseIndex);
    // Recalculate body close index after adding immediate JS
    newBodyCloseIndex = bundledContent.lastIndexOf('</body>');
  }

  // Insert deferred JS after </body>
  if (jsDeferred) {
    bundledContent =
      bundledContent.slice(0, newBodyCloseIndex + 7) + // +7 for '</body>'
      '\n' + jsDeferred +
      bundledContent.slice(newBodyCloseIndex + 7);
  }

  // Step 4: Write output file
  if (!fs.existsSync(bundlePath)) {
    fs.mkdirSync(bundlePath, { recursive: true });
  }

  fs.writeFileSync(outputPath, bundledContent, 'utf8');

  console.log(`Successfully created ${outputPath}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}