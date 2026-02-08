GorillaUtility = {
  readZipFileAsDataURI: async function (filePath) {

    let fileData = await fs.readBinaryFile(filePath);
    let mediaData = await GorillaUtility.blobToDataURI(fileData);
    return mediaData;
  },

  blobToDataURI: function (blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);  // Full data URI string
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(blob);
    });
  },

  // Generate a quasi-UUID, not a great one, but good enough for our purposes. Don't rely on uniqueness across sessions, or for anything critical (cryptography, etc).

  uuid: function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

}