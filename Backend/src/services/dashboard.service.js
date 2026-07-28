const prisma = require("../config/prisma");

async function get() {
  const [totalKlien, totalInvoice, totalPenawaran, invoices, payments, aktivitasTerbaru] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.count(),
    prisma.quotation.count(),
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { invoice: true },
    }),
  ]);

  const totalPendapatan = payments.reduce((s, p) => s + Number(p.Jumlah), 0);

  const statusInvoice = { Draft: 0, "Belum Dibayar": 0, "Dibayar Sebagian": 0, Lunas: 0, "Jatuh Tempo": 0 };
  invoices.forEach((inv) => {
    const totalPayment = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
    const total = Number(inv.Total);
    const dp = Number(inv.DP);
    const sisa = Math.max(total - dp - totalPayment, 0);
    let status;
    if (sisa <= 0) status = "Lunas";
    else if (totalPayment + dp > 0) status = "Dibayar Sebagian";
    else if (inv.JatuhTempo && new Date(inv.JatuhTempo) < new Date()) status = "Jatuh Tempo";
    else status = "Belum Dibayar";
    statusInvoice[status] = (statusInvoice[status] || 0) + 1;
  });

  const aktivitas = aktivitasTerbaru.map((p) => ({
    Aksi: "Pembayaran dicatat",
    Deskripsi: `Invoice ${p.invoice?.Nomor || p.NomorInvoice || ""} - ${p.Metode} ${p.Jumlah}`,
    Waktu: p.createdAt,
  }));

  return {
    totalKlien,
    totalInvoice,
    totalPenawaran,
    totalPendapatan,
    statusInvoice,
    aktivitasTerbaru: aktivitas,
  };
}

module.exports = { get };
