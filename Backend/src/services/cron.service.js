const prisma = require("../config/prisma");

async function updateOverdueInvoices() {
  const now = new Date();

  const overdue = await prisma.invoice.findMany({
    where: {
      JatuhTempo: { lt: now },
      Status: { notIn: ["Lunas", "Jatuh Tempo", "Draft"] },
    },
  });

  let updated = 0;
  for (const inv of overdue) {
    const agg = await prisma.payment.aggregate({
      where: { InvoiceID: inv.id },
      _sum: { Jumlah: true },
    });
    const terbayar = Number(agg._sum.Jumlah || 0);
    const sisa = Number(inv.Total) - Number(inv.DP) - terbayar;

    if (sisa > 0) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          Status: "Jatuh Tempo",
          Terbayar: terbayar,
          Sisa: Math.max(sisa, 0),
        },
      });
      updated++;
    }
  }

  return { checked: overdue.length, updated };
}

module.exports = { updateOverdueInvoices };
