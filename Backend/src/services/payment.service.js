const prisma = require("../config/prisma");

async function list() {
  const items = await prisma.payment.findMany({
    include: { invoice: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((p) => ({
    ID: p.id,
    InvoiceID: p.InvoiceID,
    NomorInvoice: p.invoice?.Nomor || p.NomorInvoice || "",
    Tanggal: p.Tanggal,
    Jumlah: p.Jumlah,
    Metode: p.Metode,
    Referensi: p.Referensi,
    Catatan: p.Catatan,
    PaymentByID: p.PaymentByID,
    PaymentByNama: p.PaymentByNama,
    UpdatedByID: p.UpdatedByID,
    UpdatedByNama: p.UpdatedByNama,
  }));
}

async function create(data) {
  const p = await prisma.payment.create({
    data: {
      InvoiceID: data.InvoiceID,
      NomorInvoice: data.NomorInvoice || "",
      Tanggal: data.Tanggal ? new Date(data.Tanggal) : new Date(),
      Jumlah: Number(data.Jumlah) || 0,
      Metode: data.Metode || "Transfer Bank",
      Referensi: data.Referensi || "",
      Catatan: data.Catatan || "",
      PaymentByID: data.PaymentByID || "",
      PaymentByNama: data.PaymentByNama || "",
    },
  });

  await updateInvoiceStatus(data.InvoiceID);
  return { ID: p.id };
}

async function update(id, data) {
  const updateData = {};
  if (data.InvoiceID !== undefined) updateData.InvoiceID = data.InvoiceID;
  if (data.Tanggal !== undefined) updateData.Tanggal = new Date(data.Tanggal);
  if (data.Jumlah !== undefined) updateData.Jumlah = Number(data.Jumlah);
  if (data.Metode !== undefined) updateData.Metode = data.Metode;
  if (data.Referensi !== undefined) updateData.Referensi = data.Referensi;
  if (data.Catatan !== undefined) updateData.Catatan = data.Catatan;
  if (data.UpdatedByID !== undefined) updateData.UpdatedByID = data.UpdatedByID;
  if (data.UpdatedByNama !== undefined) updateData.UpdatedByNama = data.UpdatedByNama;

  const old = await prisma.payment.findUnique({ where: { id } });
  await prisma.payment.update({ where: { id }, data: updateData });

  if (old) await updateInvoiceStatus(old.InvoiceID);
  if (data.InvoiceID && data.InvoiceID !== old?.InvoiceID) await updateInvoiceStatus(data.InvoiceID);

  return { success: true };
}

async function remove(id) {
  const p = await prisma.payment.findUnique({ where: { id } });
  await prisma.payment.delete({ where: { id } });
  if (p) await updateInvoiceStatus(p.InvoiceID);
  return { success: true };
}

async function updateInvoiceStatus(invoiceId) {
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!inv) return;

  const totalPayment = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
  const total = Number(inv.Total);
  const dp = Number(inv.DP);
  const sisa = Math.max(total - dp - totalPayment, 0);

  let status;
  if (sisa <= 0) status = "Lunas";
  else if (totalPayment + dp > 0) status = "Dibayar Sebagian";
  else if (inv.JatuhTempo && new Date(inv.JatuhTempo) < new Date()) status = "Jatuh Tempo";
  else status = "Belum Dibayar";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { Sisa: sisa, Terbayar: totalPayment, Status: status },
  });
}

module.exports = { list, create, update, remove };
