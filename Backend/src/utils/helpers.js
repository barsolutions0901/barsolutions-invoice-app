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

module.exports = { generateNomor, computeInvoiceStatus };
