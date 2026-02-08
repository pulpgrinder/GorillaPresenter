const fs = require('fs');
const path = require('path');

// Get the current working directory
const cwd = process.cwd();

// Define paths
const bundleFile = path.join(cwd, 'bundle', 'index.bundled.html');
const zipFile = path.join(cwd, 'zipped', 'sourcezip.zip');
const distDir = path.join(cwd, 'dist');
const outputFile = path.join(distDir, 'index.html');

try {
  // Step 1: Check if files exist
  if (!fs.existsSync(bundleFile)) {
    console.error(`Error: Bundle file not found: ${bundleFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(zipFile)) {
    console.error(`Error: ZIP file not found: ${zipFile}`);
    process.exit(1);
  }

  // Step 2: Read the HTML template
  let htmlContent = fs.readFileSync(bundleFile, 'utf8');

  // Step 3: Check for the gorilla-zip-data placeholder (div or script)
  const placeholderPattern = /<(?:div|script) id="gorilla-zip-data"(?: type="[^"]+")?>\s*<\/(?:div|script)>/;
  if (!placeholderPattern.test(htmlContent)) {
    console.error('Error: HTML template does not contain a gorilla-zip-data placeholder (expected <div id="gorilla-zip-data"></div> or <script id="gorilla-zip-data" type="application/octet-stream"></script>)');
    process.exit(1);
  }

  // Step 4: Read the ZIP file as binary data
  const zipData = fs.readFileSync(zipFile);

  // Step 5: Convert ZIP data to base64
  const base64ZipData = zipData.toString('base64');

  console.log(`ZIP file size: ${zipData.length} bytes`);
  console.log(`Base64 encoded size: ${base64ZipData.length} characters`);

  // Step 6: Insert base64 data into the div
  // Replace either an empty div or an empty script placeholder with a script containing the base64 data.
  const resultHtml = htmlContent.replace(
    /<(?:div|script) id="gorilla-zip-data"(?: type="[^"]+")?>\s*<\/(?:div|script)>/,
    `<script id="gorilla-zip-data" type="application/octet-stream">${base64ZipData}</script>`
  );

  // Step 7: Create dist directory
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`Created directory: ${distDir}`);
  }

  // Step 8: Write output file as UTF-8
  fs.writeFileSync(outputFile, resultHtml, 'utf8');

  console.log(`\n✓ Successfully bundled ZIP into HTML using base64 encoding`);
  console.log(`  Input HTML: ${bundleFile}`);
  console.log(`  Input ZIP: ${zipFile} (${zipData.length} bytes)`);
  console.log(`  Output: ${outputFile} (${resultHtml.length} characters, UTF-8 encoded)`);
  console.log(`  Base64 data length: ${base64ZipData.length} characters`);

} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}