const prisma = require("../config/prisma");

async function getFile(fileId) {
  if (!fileId || !fileId.startsWith("data:")) {
    throw new Error("File tidak ditemukan");
  }

  const matches = fileId.match(/^data:(.+?);base64,(.+)$/);
  if (!matches) throw new Error("Format file tidak valid");

  return {
    mimeType: matches[1],
    base64: matches[2],
  };
}

module.exports = { getFile };
