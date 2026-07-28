const prisma = require("../config/prisma");

async function getReport(start, end) {
  const filter = {};
  if (start || end) {
    filter.Tanggal = {};
    if (start) filter.Tanggal.gte = new Date(start);
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      filter.Tanggal.lte = endDate;
    }
  }

  const invoices = await prisma.invoice.findMany({
    where: filter,
    include: { payments: true },
    orderBy: { Tanggal: "desc" },
  });

  const totalInvoice = invoices.reduce((s, inv) => s + Number(inv.Total), 0);
  const totalDibayar = invoices.reduce((s, inv) => {
    const paymentSum = inv.payments.reduce((ps, p) => ps + Number(p.Jumlah), 0);
    return s + paymentSum;
  }, 0);

  const invoiceList = invoices.map((inv) => {
    const paymentSum = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
    return {
      ID: inv.id,
      Nomor: inv.Nomor,
      Tanggal: inv.Tanggal,
      Total: inv.Total,
      Terbayar: paymentSum,
      Sisa: Math.max(inv.Total - inv.DP - paymentSum, 0),
      Status: inv.Status,
    };
  });

  return { totalInvoice, totalDibayar, invoices: invoiceList };
}

module.exports = { getReport };
