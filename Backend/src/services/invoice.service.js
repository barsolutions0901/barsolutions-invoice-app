const prisma = require("../config/prisma");
const { generateNomor, computeInvoiceStatus, sanitizeSettings } = require("../utils/helpers");

async function list() {
  const items = await prisma.invoice.findMany({
    include: { client: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((inv) => {
    const totalPayment = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
    const status = inv.Status === "Lunas" ? "Lunas" : computeInvoiceStatus({ ...inv, Terbayar: totalPayment });
    return {
      ID: inv.id,
      Nomor: inv.Nomor,
      ClientID: inv.ClientID,
      NamaKlien: inv.client?.Nama || "",
      PerusahaanKlien: inv.client?.Perusahaan || "",
      Tanggal: inv.Tanggal,
      JatuhTempo: inv.JatuhTempo,
      Catatan: inv.Catatan,
      Subtotal: inv.Subtotal,
      DiskonNilai: inv.DiskonNilai,
      DiskonPersen: inv.DiskonPersen,
      DiskonTipe: inv.DiskonTipe,
      Diskon: inv.Diskon,
      PajakPersen: inv.PajakPersen,
      Pajak: inv.Pajak,
      Total: inv.Total,
      DP: inv.DP,
      Sisa: Math.max(inv.Total - inv.DP - totalPayment, 0),
      Terbayar: totalPayment,
      Status: status,
      CreatedByID: inv.CreatedByID,
      CreatedByNama: inv.CreatedByNama,
      CreatedByJabatan: inv.CreatedByJabatan,
      CreatedByTtd: inv.CreatedByTtd,
      UpdatedByID: inv.UpdatedByID,
      UpdatedByNama: inv.UpdatedByNama,
      ConvertedByID: inv.ConvertedByID,
      ConvertedByNama: inv.ConvertedByNama,
    };
  });
}

async function get(id) {
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true, payments: true },
  });
  if (!inv) throw new Error("Invoice tidak ditemukan");
  const totalPayment = inv.payments.reduce((s, p) => s + Number(p.Jumlah), 0);
  return {
    ID: inv.id,
    Nomor: inv.Nomor,
    ClientID: inv.ClientID,
    client: inv.client ? { Nama: inv.client.Nama, Perusahaan: inv.client.Perusahaan, Alamat: inv.client.Alamat, Email: inv.client.Email, Telepon: inv.client.Telepon } : null,
    NamaKlien: inv.client?.Nama || "",
    PerusahaanKlien: inv.client?.Perusahaan || "",
    Tanggal: inv.Tanggal,
    JatuhTempo: inv.JatuhTempo,
    Catatan: inv.Catatan,
    Subtotal: inv.Subtotal,
    DiskonNilai: inv.DiskonNilai,
    DiskonPersen: inv.DiskonPersen,
    DiskonTipe: inv.DiskonTipe,
    Diskon: inv.Diskon,
    PajakPersen: inv.PajakPersen,
    Pajak: inv.Pajak,
    Total: inv.Total,
    DP: inv.DP,
    Sisa: Math.max(inv.Total - inv.DP - totalPayment, 0),
    Terbayar: totalPayment,
    Status: computeInvoiceStatus({ ...inv, Terbayar: totalPayment }),
    items: inv.items.map((it) => ({
      ID: it.id,
      ServiceID: it.ServiceID,
      Deskripsi: it.Deskripsi,
      Qty: it.Qty,
      Satuan: it.Satuan,
      Harga: it.Harga,
      Subtotal: it.Subtotal,
    })),
  };
}

async function create(data) {
  const nomor = await generateNomor("INV", "invoice", "Tanggal");
  const inv = await prisma.invoice.create({
    data: {
      Nomor: nomor,
      ClientID: data.ClientID,
      Tanggal: data.Tanggal ? new Date(data.Tanggal) : new Date(),
      JatuhTempo: data.JatuhTempo ? new Date(data.JatuhTempo) : null,
      Catatan: data.Catatan || "",
      Subtotal: Number(data.Subtotal) || 0,
      DiskonNilai: Number(data.DiskonNilai) || 0,
      DiskonPersen: Number(data.DiskonPersen) || 0,
      DiskonTipe: data.DiskonTipe || "persen",
      Diskon: Number(data.Diskon) || 0,
      PajakPersen: Number(data.PajakPersen) || 0,
      Pajak: Number(data.Pajak) || 0,
      Total: Number(data.Total) || 0,
      DP: Number(data.DP) || 0,
      Sisa: Number(data.Sisa) || 0,
      Terbayar: 0,
      Status: data.Status || "Belum Dibayar",
      CreatedByID: data.CreatedByID || "",
      CreatedByNama: data.CreatedByNama || "",
      CreatedByJabatan: data.CreatedByJabatan || "",
      CreatedByTtd: data.CreatedByTtd || "",
    },
  });

  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      await prisma.invoiceItem.create({
        data: {
          InvoiceID: inv.id,
          ServiceID: item.ServiceID || null,
          Deskripsi: item.Deskripsi || "",
          Qty: Number(item.Qty) || 0,
          Satuan: item.Satuan || "",
          Harga: Number(item.Harga) || 0,
          Subtotal: Number(item.Subtotal) || 0,
        },
      });
    }
  }

  return { ID: inv.id, Nomor: inv.Nomor };
}

async function update(id, data) {
  const updateData = {};
  if (data.ClientID !== undefined) updateData.ClientID = data.ClientID;
  if (data.Tanggal !== undefined) updateData.Tanggal = new Date(data.Tanggal);
  if (data.JatuhTempo !== undefined) updateData.JatuhTempo = data.JatuhTempo ? new Date(data.JatuhTempo) : null;
  if (data.Catatan !== undefined) updateData.Catatan = data.Catatan;
  if (data.Subtotal !== undefined) updateData.Subtotal = Number(data.Subtotal);
  if (data.DiskonNilai !== undefined) updateData.DiskonNilai = Number(data.DiskonNilai);
  if (data.DiskonPersen !== undefined) updateData.DiskonPersen = Number(data.DiskonPersen);
  if (data.DiskonTipe !== undefined) updateData.DiskonTipe = data.DiskonTipe;
  if (data.Diskon !== undefined) updateData.Diskon = Number(data.Diskon);
  if (data.PajakPersen !== undefined) updateData.PajakPersen = Number(data.PajakPersen);
  if (data.Pajak !== undefined) updateData.Pajak = Number(data.Pajak);
  if (data.Total !== undefined) updateData.Total = Number(data.Total);
  if (data.DP !== undefined) updateData.DP = Number(data.DP);
  if (data.Sisa !== undefined) updateData.Sisa = Number(data.Sisa);
  if (data.Status !== undefined) updateData.Status = data.Status;
  if (data.UpdatedByID !== undefined) updateData.UpdatedByID = data.UpdatedByID;
  if (data.UpdatedByNama !== undefined) updateData.UpdatedByNama = data.UpdatedByNama;

  await prisma.invoice.update({ where: { id }, data: updateData });

  if (data.items && Array.isArray(data.items)) {
    await prisma.invoiceItem.deleteMany({ where: { InvoiceID: id } });
    for (const item of data.items) {
      await prisma.invoiceItem.create({
        data: {
          InvoiceID: id,
          ServiceID: item.ServiceID || null,
          Deskripsi: item.Deskripsi || "",
          Qty: Number(item.Qty) || 0,
          Satuan: item.Satuan || "",
          Harga: Number(item.Harga) || 0,
          Subtotal: Number(item.Subtotal) || 0,
        },
      });
    }
  }

  return { success: true };
}

async function remove(id) {
  await prisma.invoiceItem.deleteMany({ where: { InvoiceID: id } });
  await prisma.payment.deleteMany({ where: { InvoiceID: id } });
  await prisma.invoice.delete({ where: { id } });
  return { success: true };
}

async function getPdfData(id) {
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true, payments: true },
  });
  if (!inv) throw new Error("Invoice tidak ditemukan");

  const setting = await prisma.setting.findFirst();
  const s = setting?.data || {};
  const a = {};
  if (s.logo_file_id) a.logo_file_id = s.logo_file_id;
  if (s.ttd_file_id) a.ttd_file_id = s.ttd_file_id;
  if (s.stempel_file_id) a.stempel_file_id = s.stempel_file_id;
  if (s.qris_file_id) a.qris_file_id = s.qris_file_id;

  const totalPayment = inv.payments.reduce((sum, p) => sum + Number(p.Jumlah), 0);
  const base = (s.domain_publik || "https://barsolutions-invoice-app.vercel.app").replace(/\/$/, "");
  const link = base + "/?invoice=" + encodeURIComponent(inv.Nomor);

  return {
    invoice: {
      ID: inv.id,
      Nomor: inv.Nomor,
      client: inv.client ? { Nama: inv.client.Nama, Perusahaan: inv.client.Perusahaan, Alamat: inv.client.Alamat, Email: inv.client.Email, Telepon: inv.client.Telepon } : null,
      Tanggal: inv.Tanggal,
      JatuhTempo: inv.JatuhTempo,
      Catatan: inv.Catatan,
      Subtotal: inv.Subtotal,
      Diskon: inv.Diskon,
      DiskonNilai: inv.DiskonNilai,
      DiskonPersen: inv.DiskonPersen,
      DiskonTipe: inv.DiskonTipe,
      PajakPersen: inv.PajakPersen,
      Pajak: inv.Pajak,
      Total: inv.Total,
      DP: inv.DP,
      Sisa: Math.max(inv.Total - inv.DP - totalPayment, 0),
      Terbayar: totalPayment,
      Status: computeInvoiceStatus({ ...inv, Terbayar: totalPayment }),
      CreatedByNama: inv.CreatedByNama,
      CreatedByJabatan: inv.CreatedByJabatan,
      CreatedByTtd: inv.CreatedByTtd,
      items: inv.items.map((it) => ({
        Deskripsi: it.Deskripsi, Qty: it.Qty, Satuan: it.Satuan, Harga: it.Harga, Subtotal: it.Subtotal,
      })),
    },
    settings: sanitizeSettings(s),
    assets: a,
    link,
  };
}

async function getPublic(nomor) {
  const inv = await prisma.invoice.findUnique({
    where: { Nomor: nomor },
    include: { client: true, items: true, payments: true },
  });
  if (!inv) throw new Error("Invoice tidak ditemukan");

  const setting = await prisma.setting.findFirst();
  const s = setting?.data || {};
  const a = {};
  if (s.logo_file_id) a.logo_file_id = s.logo_file_id;
  if (s.ttd_file_id) a.ttd_file_id = s.ttd_file_id;
  if (s.stempel_file_id) a.stempel_file_id = s.stempel_file_id;
  if (s.qris_file_id) a.qris_file_id = s.qris_file_id;

  const base = (s.domain_publik || "https://barsolutions-invoice-app.vercel.app").replace(/\/$/, "");
  const link = base + "/?invoice=" + encodeURIComponent(inv.Nomor);
  const totalPayment = inv.payments.reduce((sum, p) => sum + Number(p.Jumlah), 0);

  return {
    invoice: {
      ID: inv.id,
      Nomor: inv.Nomor,
      client: inv.client ? { Nama: inv.client.Nama, Perusahaan: inv.client.Perusahaan, Alamat: inv.client.Alamat } : null,
      Tanggal: inv.Tanggal,
      JatuhTempo: inv.JatuhTempo,
      Catatan: inv.Catatan,
      Subtotal: inv.Subtotal,
      Diskon: inv.Diskon,
      DiskonNilai: inv.DiskonNilai,
      DiskonPersen: inv.DiskonPersen,
      DiskonTipe: inv.DiskonTipe,
      PajakPersen: inv.PajakPersen,
      Pajak: inv.Pajak,
      Total: inv.Total,
      DP: inv.DP,
      Sisa: Math.max(inv.Total - inv.DP - totalPayment, 0),
      Terbayar: totalPayment,
      Status: computeInvoiceStatus({ ...inv, Terbayar: totalPayment }),
      CreatedByNama: inv.CreatedByNama,
      CreatedByJabatan: inv.CreatedByJabatan,
      CreatedByTtd: inv.CreatedByTtd,
      items: inv.items.map((it) => ({
        Deskripsi: it.Deskripsi, Qty: it.Qty, Satuan: it.Satuan, Harga: it.Harga, Subtotal: it.Subtotal,
      })),
    },
    settings: sanitizeSettings(s),
    assets: a,
    link,
    payments: inv.payments.map((p) => ({
      ID: p.id,
      Tanggal: p.Tanggal,
      Jumlah: p.Jumlah,
      Metode: p.Metode,
      Referensi: p.Referensi,
    })),
  };
}

module.exports = { list, get, create, update, remove, getPdfData, getPublic };
