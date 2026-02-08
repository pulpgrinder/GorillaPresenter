// GorillaFS - Self-contained browser filesystem using base64 ZIP encoding
// Assumes zip-fs.min.js (zip.fs from @zip.js/zip.js) is already loaded

window.fs = {
  constructor() {
    this.zipReader = null;
    this.zipEntries = null;
    this.zipModified = false;
  },

  async unpackZipData() {
    try {
      // Find the ZIP data element in the DOM (script or div)
      const zipDataElement = document.getElementById('gorilla-zip-data');

      if (!zipDataElement) {
        throw new Error('Could not find gorilla-zip-data element');
      }

      const base64String = (zipDataElement.textContent || '').trim();

      if (!base64String) {
        throw new Error('ZIP data div is empty');
      }

      // Decode base64 to binary
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create ZIP blob
      const zipBlob = new Blob([bytes], { type: 'application/zip' });

      // Create ZIP reader
      this.zipReader = new zip.ZipReader(new zip.BlobReader(zipBlob));
      this.zipEntries = await this.zipReader.getEntries();
      this.zipModified = false;
      return true;
    } catch (error) {
      console.error('Error unpacking ZIP data:', error);
      throw error;
    }
  },

  async packZipData() {
    try {
      if (!this.zipReader) {
        throw new Error('No ZIP data loaded. Call unpackZipData() first.');
      }

      // Create a new ZIP file with all current entries
      const zipBlob = await this.createZipBlob();

      // Read the ZIP as binary
      const arrayBuffer = await zipBlob.arrayBuffer();
      const zipBytes = new Uint8Array(arrayBuffer);

      // Convert to base64
      let binaryString = '';
      for (let i = 0; i < zipBytes.length; i++) {
        binaryString += String.fromCharCode(zipBytes[i]);
      }
      const base64String = btoa(binaryString);

      // Update the ZIP data element in the DOM (prefer script element)
      const zipDataElement = document.getElementById('gorilla-zip-data');
      if (!zipDataElement) {
        throw new Error('Could not find gorilla-zip-data element');
      }

      zipDataElement.textContent = base64String;

      // Now get the updated HTML
      const newHtml = document.documentElement.outerHTML;

      this.zipModified = false;
      return newHtml;
    } catch (error) {
      console.error('Error packing ZIP data:', error);
      throw error;
    }
  },

  async createZipBlob() {
    this.zipEntries.map(e => ({
      name: e.filename,
      isNew: !!e._newBlob,
      isDir: e.directory
    }));

    const blobWriter = new zip.BlobWriter('application/zip');
    const zipWriter = new zip.ZipWriter(blobWriter);

    for (const entry of this.zipEntries) {
      if (!entry.directory) {
        if (entry._newBlob) {
          await zipWriter.add(entry.filename, new zip.BlobReader(entry._newBlob));
        } else {
          const data = await entry.getData(new zip.BlobWriter());
          await zipWriter.add(entry.filename, new zip.BlobReader(data));
        }
      }
    }

    await zipWriter.close();
    const blob = await blobWriter.getData();
    return blob;
  },

  async readBinaryFile(pathname) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    const entry = this.zipEntries.find(e => e.filename === pathname);
    if (!entry) {
      throw new Error(`File not found: ${pathname}`);
    }

    if (entry.directory) {
      throw new Error(`Path is a directory: ${pathname}`);
    }

    // Check if this is a new entry with stored blob
    if (entry._newBlob) {
      return entry._newBlob;
    }

    // Determine MIME type
    const ext = pathname.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'xml': 'application/xml',
      'zip': 'application/zip',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'otf': 'font/otf'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    const blob = await entry.getData(new zip.BlobWriter(mimeType));
    return blob;
  },

  async writeBinaryFile(pathname, blob) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    // Remove existing entry if present
    const existingIndex = this.zipEntries.findIndex(e => e.filename === pathname);
    if (existingIndex !== -1) {
      this.zipEntries.splice(existingIndex, 1);
    }

    // Store the blob directly
    this.zipEntries.push({
      filename: pathname,
      directory: false,
      _newBlob: blob
    });

    this.zipModified = true;
  },

  async readTextFile(pathname) {
    const blob = await this.readBinaryFile(pathname);
    return await blob.text();
  },

  async writeTextFile(pathname, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    await this.writeBinaryFile(pathname, blob);
  },

  async deleteFile(pathname) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    const existingIndex = this.zipEntries.findIndex(e => e.filename === pathname);
    if (existingIndex === -1) {
      throw new Error(`File not found: ${pathname}`);
    }
    this.zipEntries.splice(existingIndex, 1);
    this.zipModified = true;

  },

  async renameFile(oldPathname, newPathname) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    const existingIndex = this.zipEntries.findIndex(e => e.filename === oldPathname);
    if (existingIndex === -1) {
      throw new Error(`File not found: ${oldPathname}`);
    }

    // Check if new name already exists
    const conflictIndex = this.zipEntries.findIndex(e => e.filename === newPathname);
    if (conflictIndex !== -1) {
      throw new Error(`File already exists: ${newPathname}`);
    }

    // Simply update the filename
    this.zipEntries[existingIndex].filename = newPathname;
    this.zipModified = true;

  },

  async readDirectory(regex) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    let filenames = this.zipEntries
      .filter(e => !e.directory)
      .map(e => e.filename);

    if (regex) {
      const pattern = new RegExp(regex);
      filenames = filenames.filter(name => pattern.test(name));
    }

    return filenames;
  },
  async savePresentation() {
    // Try modern API first (Chrome/Edge)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'index.html',
          types: [{
            description: 'HTML Files',
            accept: { 'text/html': ['.html'] },
          }],
        });

        const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
        const writable = await handle.createWritable();
        await writable.write(html);
        await writable.close();

        GorillaAlert.show('File saved successfully!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          GorillaAlert.show('Save canceled');
          return;
        }
      }
    }

    // Fallback for Safari and other browsers
    document.body.style.cursor = "wait";

    if (this.zipModified) {
      await this.packZipData();
    }

    const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.style.cursor = "default";
      GorillaAlert.show('Download initiated - check your downloads folder');
    }, 100);
    GorillaPresenter.markDirty(false);
  },

  async openPresentation() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html";
    input.onchange = e => {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);

      // Delay to let file chooser fully close
      setTimeout(() => {
        window.location.href = url;
      }, 100);
    };
    input.click();
  },
  async fileExists(pathname) {
    if (!this.zipReader) {
      throw new Error('No ZIP data loaded. Call unpackZipData() first.');
    }

    const entry = this.zipEntries.find(e => e.filename === pathname);
    return !!entry;
  },
};
/*
console.log('GorillaFS loaded. Usage:');
console.log('const fs = new GorillaFS();');
console.log('await fs.unpackZipData();');
console.log('await fs.readTextFile(pathname);');
console.log('await fs.writeTextFile(pathname, text);');
console.log('await fs.readBinaryFile(pathname);');
console.log('await fs.writeBinaryFile(pathname, blob);');
console.log('await fs.deleteFile(pathname);');
console.log('await fs.renameFile(oldPathname, newPathname);');
console.log('await fs.readDirectory(regex);');
console.log('await fs.saveUpdatedFile();'); */