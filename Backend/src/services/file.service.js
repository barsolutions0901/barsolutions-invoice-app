const prisma = require("../config/prisma");

function parseDataUrl(value) {
  const matches = value.match(/^data:(.+?);base64,(.+)$/);
  if (!matches) throw new Error("Format file tidak valid");
  return { mimeType: matches[1], base64: matches[2] };
}

async function getFile(fileId) {
  if (!fileId) throw new Error("File tidak ditemukan");

  if (String(fileId).startsWith("data:")) {
    return parseDataUrl(String(fileId));
  }

  const asset = await prisma.asset.findUnique({ where: { key: String(fileId) } });
  if (!asset) throw new Error("File tidak ditemukan");
  return { mimeType: asset.mimeType, base64: asset.base64 };
}

async function sendFile(key, res) {
  const asset = await prisma.asset.findUnique({ where: { key } });
  if (!asset) {
    return res.status(404).json({ success: false, message: "File tidak ditemukan" });
  }
  res.set("Content-Type", asset.mimeType);
  res.set("Cache-Control", "public, max-age=86400");
  res.send(Buffer.from(asset.base64, "base64"));
}

async function upsertAsset(key, mimeType, base64) {
  await prisma.asset.upsert({
    where: { key },
    update: { mimeType, base64 },
    create: { key, mimeType, base64 },
  });
}

module.exports = { getFile, sendFile, upsertAsset };
