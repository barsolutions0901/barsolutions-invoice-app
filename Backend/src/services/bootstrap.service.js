const prisma = require("../config/prisma");
const { computeInvoiceStatus } = require("../utils/helpers");

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 15000;

async function get() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;
  _cache = null;
  const [setting, clients, services, invoices, quotations, payments] = await Promise.all([
    prisma.setting.findFirst(),
    prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ include: { client: true, payments: true }, orderBy: { createdAt: "desc" } }),
    prisma.quotation.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const settings = setting?.data || {};

  const invoiceList = invoices.map((inv) => {
    const totalPayment = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
    const status = inv.Status === "Lunas" ? "Lunas" : computeInvoiceStatus({ ...inv, Terbayar: totalPayment });
    return {
      ID: inv.id, Nomor: inv.Nomor, ClientID: inv.ClientID,
      NamaKlien: inv.client?.Nama || "", PerusahaanKlien: inv.client?.Perusahaan || "",
      Tanggal: inv.Tanggal, JatuhTempo: inv.JatuhTempo, Catatan: inv.Catatan,
      Subtotal: inv.Subtotal, DiskonNilai: inv.DiskonNilai, DiskonPersen: inv.DiskonPersen,
      DiskonTipe: inv.DiskonTipe, Diskon: inv.Diskon, PajakPersen: inv.PajakPersen,
      Pajak: inv.Pajak, Total: inv.Total, DP: inv.DP,
      Sisa: Math.max(inv.Total - inv.DP - totalPayment, 0), Terbayar: totalPayment,
      Status: status, CreatedByID: inv.CreatedByID, CreatedByNama: inv.CreatedByNama,
      CreatedByJabatan: inv.CreatedByJabatan, CreatedByTtd: inv.CreatedByTtd,
      UpdatedByID: inv.UpdatedByID, UpdatedByNama: inv.UpdatedByNama,
      ConvertedByID: inv.ConvertedByID, ConvertedByNama: inv.ConvertedByNama,
    };
  });

  const quotationList = quotations.map((q) => ({
    ID: q.id, Nomor: q.Nomor, ClientID: q.ClientID,
    NamaKlien: q.client?.Nama || "", PerusahaanKlien: q.client?.Perusahaan || "",
    Tanggal: q.Tanggal, TanggalBerlaku: q.TanggalBerlaku, Catatan: q.Catatan,
    Subtotal: q.Subtotal, DiskonNilai: q.DiskonNilai, DiskonPersen: q.DiskonPersen,
    DiskonTipe: q.DiskonTipe, Diskon: q.Diskon, PajakPersen: q.PajakPersen,
    Pajak: q.Pajak, Total: q.Total, Status: q.Status,
    CreatedByID: q.CreatedByID, CreatedByNama: q.CreatedByNama,
    CreatedByJabatan: q.CreatedByJabatan, CreatedByTtd: q.CreatedByTtd,
    UpdatedByID: q.UpdatedByID, UpdatedByNama: q.UpdatedByNama,
  }));

  const paymentList = payments.map((p) => ({
    ID: p.id, InvoiceID: p.InvoiceID, NomorInvoice: p.NomorInvoice || "",
    Tanggal: p.Tanggal, Jumlah: p.Jumlah, Metode: p.Metode,
    Referensi: p.Referensi, Catatan: p.Catatan,
    PaymentByID: p.PaymentByID, PaymentByNama: p.PaymentByNama,
  }));

  const clientList = clients.map((c) => ({
    ID: c.id, Nama: c.Nama, Perusahaan: c.Perusahaan, Email: c.Email,
    Telepon: c.Telepon, Alamat: c.Alamat, NPWP: c.NPWP, Catatan: c.Catatan,
  }));

  const serviceList = services.map((s) => ({
    ID: s.id, NamaLayanan: s.NamaLayanan, Kategori: s.Kategori,
    Satuan: s.Satuan, Harga: s.Harga, Deskripsi: s.Deskripsi, Status: s.Status,
  }));

  const totalPendapatan = paymentList.reduce((s, p) => s + Number(p.Jumlah), 0);

  const statusInvoice = { Draft: 0, "Belum Dibayar": 0, "Dibayar Sebagian": 0, Lunas: 0, "Jatuh Tempo": 0 };
  invoiceList.forEach((inv) => {
    const s = inv.Status;
    statusInvoice[s] = (statusInvoice[s] || 0) + 1;
  });

  const result = {
    settings,
    dashboard: {
      totalKlien: clients.length,
      totalInvoice: invoices.length,
      totalPenawaran: quotations.length,
      totalPendapatan,
      statusInvoice,
    },
    invoices: invoiceList,
    quotations: quotationList,
    payments: paymentList,
    clients: clientList,
    services: serviceList,
  };
  _cache = result;
  _cacheTime = now;
  return result;
}

module.exports = { get };
