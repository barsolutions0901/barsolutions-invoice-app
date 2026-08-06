const prisma = require("../config/prisma");

async function generateNomor(prefix, model, dateField) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const startOfMonth = new Date(year, now.getMonth(), 1);
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);

  const lastDoc = await prisma[model].findFirst({
    where: {
      [dateField]: { gte: startOfMonth, lte: endOfMonth },
      Nomor: { startsWith: `${prefix}-${year}${month}` },
    },
    orderBy: { createdAt: "desc" },
  });

  let seq = 1;
  if (lastDoc) {
    const parts = lastDoc.Nomor.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `${prefix}-${year}${month}-${String(seq).padStart(4, "0")}`;
}

function computeInvoiceStatus(invoice) {
  const total = Number(invoice.Total) || 0;
  const dp = Number(invoice.DP) || 0;
  const terbayar = Number(invoice.Terbayar) || 0;
  const sisa = total - dp - terbayar;

  if (sisa <= 0) return "Lunas";
  if (terbayar + dp > 0) return "Dibayar Sebagian";
  if (invoice.JatuhTempo && new Date(invoice.JatuhTempo) < new Date()) return "Jatuh Tempo";
  return "Belum Dibayar";
}

const ASSET_SETTING_KEYS = [
  "logo_file_id",
  "favicon_file_id",
  "ttd_file_id",
  "stempel_file_id",
  "qris_file_id",
  "logo_login_file_id",
  "login_bg_file_id",
];

function sanitizeSettings(data) {
  const out = { ...(data || {}) };
  ASSET_SETTING_KEYS.forEach((k) => delete out[k]);
  return out;
}

module.exports = { generateNomor, computeInvoiceStatus, sanitizeSettings, ASSET_SETTING_KEYS };
