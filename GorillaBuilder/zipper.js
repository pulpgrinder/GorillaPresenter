const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class ZipWriter {
  constructor() {
    this.files = [];
    this.centralDirectory = [];
    this.offset = 0;
  }

  addFile(filePath, zipPath) {
    const content = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const mtime = this.dosDateTime(stats.mtime);

    // Calculate CRC32
    const crc32 = this.crc32(content);

    // Compress with deflate
    const compressed = zlib.deflateRawSync(content);

    // Local file header
    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]), // Local file header signature
      Buffer.from([0x14, 0x00]), // Version needed to extract (2.0)
      Buffer.from([0x00, 0x00]), // General purpose bit flag
      Buffer.from([0x08, 0x00]), // Compression method (deflate)
      this.uint16(mtime.time), // Last mod file time
      this.uint16(mtime.date), // Last mod file date
      this.uint32(crc32), // CRC-32
      this.uint32(compressed.length), // Compressed size
      this.uint32(content.length), // Uncompressed size
      this.uint16(zipPath.length), // File name length
      this.uint16(0), // Extra field length
      Buffer.from(zipPath, 'utf8') // File name
    ]);

    this.files.push({
      header: localHeader,
      data: compressed,
      zipPath: zipPath,
      crc32: crc32,
      compressedSize: compressed.length,
      uncompressedSize: content.length,
      mtime: mtime,
      offset: this.offset
    });

    this.offset += localHeader.length + compressed.length;
  }

  dosDateTime(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2);

    return {
      date: ((year - 1980) << 9) | (month << 5) | day,
      time: (hours << 11) | (minutes << 5) | seconds
    };
  }

  uint16(value) {
    const buf = Buffer.alloc(2);
    buf.writeUInt16LE(value, 0);
    return buf;
  }

  uint32(value) {
    const buf = Buffer.alloc(4);
    buf.writeUInt32LE(value, 0);
    return buf;
  }

  crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0; // >>> 0 converts to unsigned 32-bit integer
  }

  writeZip(outputPath) {
    const centralDirStart = this.offset;
    const centralDirBuffers = [];

    // Build central directory
    for (const file of this.files) {
      const centralHeader = Buffer.concat([
        Buffer.from([0x50, 0x4b, 0x01, 0x02]), // Central directory header signature
        Buffer.from([0x14, 0x00]), // Version made by
        Buffer.from([0x14, 0x00]), // Version needed to extract
        Buffer.from([0x00, 0x00]), // General purpose bit flag
        Buffer.from([0x08, 0x00]), // Compression method
        this.uint16(file.mtime.time), // Last mod file time
        this.uint16(file.mtime.date), // Last mod file date
        this.uint32(file.crc32), // CRC-32
        this.uint32(file.compressedSize), // Compressed size
        this.uint32(file.uncompressedSize), // Uncompressed size
        this.uint16(file.zipPath.length), // File name length
        this.uint16(0), // Extra field length
        this.uint16(0), // File comment length
        this.uint16(0), // Disk number start
        this.uint16(0), // Internal file attributes
        this.uint32(0), // External file attributes
        this.uint32(file.offset), // Relative offset of local header
        Buffer.from(file.zipPath, 'utf8') // File name
      ]);
      centralDirBuffers.push(centralHeader);
    }

    const centralDir = Buffer.concat(centralDirBuffers);
    const centralDirSize = centralDir.length;

    // End of central directory record
    const endOfCentralDir = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x05, 0x06]), // End of central dir signature
      this.uint16(0), // Number of this disk
      this.uint16(0), // Disk where central directory starts
      this.uint16(this.files.length), // Number of central directory records on this disk
      this.uint16(this.files.length), // Total number of central directory records
      this.uint32(centralDirSize), // Size of central directory
      this.uint32(centralDirStart), // Offset of start of central directory
      this.uint16(0) // ZIP file comment length
    ]);

    // Write everything to file
    const writeStream = fs.createWriteStream(outputPath);

    // Write local file headers and data
    for (const file of this.files) {
      writeStream.write(file.header);
      writeStream.write(file.data);
    }

    // Write central directory
    writeStream.write(centralDir);

    // Write end of central directory
    writeStream.write(endOfCentralDir);

    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }
}

function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    // Skip .DS_Store files
    if (item === '.DS_Store') {
      continue;
    }

    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

async function createZip() {
  try {
    // Define paths relative to current working directory
    const cwd = process.cwd();
    //const templateFile = path.join(cwd, 'template', 'index.template.html');
    const filesystemDir = path.join(cwd, 'filesystem');
    const zippedDir = path.join(cwd, 'zipped');
    const outputZip = path.join(zippedDir, 'sourcezip.zip');

    // Check if template file exists
    /*  if (!fs.existsSync(templateFile)) {
        throw new Error(`Template file not found: ${templateFile}`);
      }*/

    // Check if filesystem directory exists
    if (!fs.existsSync(filesystemDir)) {
      throw new Error(`Filesystem directory not found: ${filesystemDir}`);
    }

    // Create zipped directory if it doesn't exist
    if (!fs.existsSync(zippedDir)) {
      fs.mkdirSync(zippedDir, { recursive: true });
      console.log(`Created directory: ${zippedDir}`);
    }

    // Create zip writer
    const zip = new ZipWriter();

    // Add template file (with the 'template/' prefix)

    //zip.addFile(templateFile, 'template/index.template.html');
    //console.log('Added: template/index.template.html');

    // Add all files from filesystem directory recursively
    const filesystemFiles = getAllFiles(filesystemDir);
    for (const file of filesystemFiles) {
      // Use relative path without the 'filesystem/' prefix
      const zipPath = file.relativePath.replace(/\\/g, '/');
      zip.addFile(file.fullPath, zipPath);
      console.log(`Added: ${zipPath}`);
    }

    // Write the zip file
    await zip.writeZip(outputZip);

    console.log(`✓ Zip file created successfully: ${outputZip}`);

  } catch (error) {
    console.error('Error creating zip file:', error.message);
    process.exit(1);
  }
}

// Run the script
createZip();