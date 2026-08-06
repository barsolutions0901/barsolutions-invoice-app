const prisma = require("../config/prisma");
const { generateNomor, sanitizeSettings } = require("../utils/helpers");

async function list() {
  const items = await prisma.quotation.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((q) => ({
    ID: q.id,
    Nomor: q.Nomor,
    ClientID: q.ClientID,
    NamaKlien: q.client?.Nama || "",
    PerusahaanKlien: q.client?.Perusahaan || "",
    Tanggal: q.Tanggal,
    TanggalBerlaku: q.TanggalBerlaku,
    Catatan: q.Catatan,
    Subtotal: q.Subtotal,
    DiskonNilai: q.DiskonNilai,
    DiskonPersen: q.DiskonPersen,
    DiskonTipe: q.DiskonTipe,
    Diskon: q.Diskon,
    PajakPersen: q.PajakPersen,
    Pajak: q.Pajak,
    Total: q.Total,
    Status: q.Status,
    CreatedByID: q.CreatedByID,
    CreatedByNama: q.CreatedByNama,
    CreatedByJabatan: q.CreatedByJabatan,
    CreatedByTtd: q.CreatedByTtd,
    UpdatedByID: q.UpdatedByID,
    UpdatedByNama: q.UpdatedByNama,
  }));
}

async function get(id) {
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: { client: true, items: true },
  });
  if (!q) throw new Error("Penawaran tidak ditemukan");
  return {
    ID: q.id,
    Nomor: q.Nomor,
    ClientID: q.ClientID,
    NamaKlien: q.client?.Nama || "",
    PerusahaanKlien: q.client?.Perusahaan || "",
    Tanggal: q.Tanggal,
    TanggalBerlaku: q.TanggalBerlaku,
    Catatan: q.Catatan,
    Subtotal: q.Subtotal,
    DiskonNilai: q.DiskonNilai,
    DiskonPersen: q.DiskonPersen,
    DiskonTipe: q.DiskonTipe,
    Diskon: q.Diskon,
    PajakPersen: q.PajakPersen,
    Pajak: q.Pajak,
    Total: q.Total,
    Status: q.Status,
    CreatedByID: q.CreatedByID,
    CreatedByNama: q.CreatedByNama,
    CreatedByJabatan: q.CreatedByJabatan,
    CreatedByTtd: q.CreatedByTtd,
    items: q.items.map((it) => ({
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
  const nomor = await generateNomor("PEN", "quotation", "Tanggal");
  const q = await prisma.quotation.create({
    data: {
      Nomor: nomor,
      ClientID: data.ClientID,
      Tanggal: data.Tanggal ? new Date(data.Tanggal) : new Date(),
      TanggalBerlaku: data.TanggalBerlaku ? new Date(data.TanggalBerlaku) : null,
      Catatan: data.Catatan || "",
      Subtotal: Number(data.Subtotal) || 0,
      DiskonNilai: Number(data.DiskonNilai) || 0,
      DiskonPersen: Number(data.DiskonPersen) || 0,
      DiskonTipe: data.DiskonTipe || "persen",
      Diskon: Number(data.Diskon) || 0,
      PajakPersen: Number(data.PajakPersen) || 0,
      Pajak: Number(data.Pajak) || 0,
      Total: Number(data.Total) || 0,
      Status: data.Status || "Draft",
      CreatedByID: data.CreatedByID || "",
      CreatedByNama: data.CreatedByNama || "",
      CreatedByJabatan: data.CreatedByJabatan || "",
      CreatedByTtd: data.CreatedByTtd || "",
    },
  });

  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      await prisma.quotationItem.create({
        data: {
          QuotationID: q.id,
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

  return { ID: q.id, Nomor: q.Nomor };
}

async function update(id, data) {
  const updateData = {};
  if (data.ClientID !== undefined) updateData.ClientID = data.ClientID;
  if (data.Tanggal !== undefined) updateData.Tanggal = new Date(data.Tanggal);
  if (data.TanggalBerlaku !== undefined) updateData.TanggalBerlaku = data.TanggalBerlaku ? new Date(data.TanggalBerlaku) : null;
  if (data.Catatan !== undefined) updateData.Catatan = data.Catatan;
  if (data.Subtotal !== undefined) updateData.Subtotal = Number(data.Subtotal);
  if (data.DiskonNilai !== undefined) updateData.DiskonNilai = Number(data.DiskonNilai);
  if (data.DiskonPersen !== undefined) updateData.DiskonPersen = Number(data.DiskonPersen);
  if (data.DiskonTipe !== undefined) updateData.DiskonTipe = data.DiskonTipe;
  if (data.Diskon !== undefined) updateData.Diskon = Number(data.Diskon);
  if (data.PajakPersen !== undefined) updateData.PajakPersen = Number(data.PajakPersen);
  if (data.Pajak !== undefined) updateData.Pajak = Number(data.Pajak);
  if (data.Total !== undefined) updateData.Total = Number(data.Total);
  if (data.Status !== undefined) updateData.Status = data.Status;
  if (data.UpdatedByID !== undefined) updateData.UpdatedByID = data.UpdatedByID;
  if (data.UpdatedByNama !== undefined) updateData.UpdatedByNama = data.UpdatedByNama;

  await prisma.quotation.update({ where: { id }, data: updateData });

  if (data.items && Array.isArray(data.items)) {
    await prisma.quotationItem.deleteMany({ where: { QuotationID: id } });
    for (const item of data.items) {
      await prisma.quotationItem.create({
        data: {
          QuotationID: id,
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
  await prisma.quotationItem.deleteMany({ where: { QuotationID: id } });
  await prisma.quotation.delete({ where: { id } });
  return { success: true };
}

async function convert(id, data) {
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true, client: true },
  });
  if (!q) throw new Error("Penawaran tidak ditemukan");

  const nomor = await generateNomor("INV", "invoice", "Tanggal");
  const inv = await prisma.invoice.create({
    data: {
      Nomor: nomor,
      ClientID: q.ClientID,
      Tanggal: new Date(),
      JatuhTempo: null,
      Catatan: q.Catatan,
      Subtotal: q.Subtotal,
      DiskonNilai: q.DiskonNilai,
      DiskonPersen: q.DiskonPersen,
      DiskonTipe: q.DiskonTipe,
      Diskon: q.Diskon,
      PajakPersen: q.PajakPersen,
      Pajak: q.Pajak,
      Total: q.Total,
      DP: 0,
      Sisa: q.Total,
      Terbayar: 0,
      Status: "Belum Dibayar",
      CreatedByID: q.CreatedByID || "",
      CreatedByNama: q.CreatedByNama || "",
      CreatedByJabatan: q.CreatedByJabatan || "",
      CreatedByTtd: q.CreatedByTtd || "",
      ConvertedByID: data?.ConvertedByID || "",
      ConvertedByNama: data?.ConvertedByNama || "",
    },
  });

  for (const item of q.items) {
    await prisma.invoiceItem.create({
      data: {
        InvoiceID: inv.id,
        ServiceID: item.ServiceID,
        Deskripsi: item.Deskripsi,
        Qty: item.Qty,
        Satuan: item.Satuan,
        Harga: item.Harga,
        Subtotal: item.Subtotal,
      },
    });
  }

  await prisma.quotation.update({ where: { id }, data: { Status: "Dikonversi" } });

  return { ID: inv.id, Nomor: inv.Nomor };
}

async function getPdfData(id) {
  const q = await prisma.quotation.findUnique({
    where: { id },
    include: { client: true, items: true },
  });
  if (!q) throw new Error("Penawaran tidak ditemukan");

  const setting = await prisma.setting.findFirst();
  const s = setting?.data || {};
  const a = {};

  const logoFileId = s.logo_file_id;
  const ttdFileId = s.ttd_file_id;
  const stempelFileId = s.stempel_file_id;
  const qrisFileId = s.qris_file_id;

  if (logoFileId) a.logo_file_id = logoFileId;
  if (ttdFileId) a.ttd_file_id = ttdFileId;
  if (stempelFileId) a.stempel_file_id = stempelFileId;
  if (qrisFileId) a.qris_file_id = qrisFileId;

  return {
    quotation: {
      ID: q.id,
      Nomor: q.Nomor,
      ClientID: q.ClientID,
      client: q.client ? { Nama: q.client.Nama, Perusahaan: q.client.Perusahaan, Alamat: q.client.Alamat, Email: q.client.Email, Telepon: q.client.Telepon } : null,
      Tanggal: q.Tanggal,
      TanggalBerlaku: q.TanggalBerlaku,
      Catatan: q.Catatan,
      Subtotal: q.Subtotal,
      DiskonNilai: q.DiskonNilai,
      DiskonPersen: q.DiskonPersen,
      DiskonTipe: q.DiskonTipe,
      Diskon: q.Diskon,
      PajakPersen: q.PajakPersen,
      Pajak: q.Pajak,
      Total: q.Total,
      Status: q.Status,
      CreatedByNama: q.CreatedByNama,
      CreatedByJabatan: q.CreatedByJabatan,
      CreatedByTtd: q.CreatedByTtd,
      items: q.items.map((it) => ({
        Deskripsi: it.Deskripsi, Qty: it.Qty, Satuan: it.Satuan, Harga: it.Harga, Subtotal: it.Subtotal,
      })),
    },
    settings: sanitizeSettings(s),
    assets: a,
  };
}

async function getPublic(nomor) {
  const q = await prisma.quotation.findUnique({
    where: { Nomor: nomor },
    include: { client: true, items: true },
  });
  if (!q) throw new Error("Penawaran tidak ditemukan");

  const setting = await prisma.setting.findFirst();
  const s = setting?.data || {};
  const a = {};
  if (s.logo_file_id) a.logo_file_id = s.logo_file_id;
  if (s.ttd_file_id) a.ttd_file_id = s.ttd_file_id;
  if (s.stempel_file_id) a.stempel_file_id = s.stempel_file_id;
  if (s.qris_file_id) a.qris_file_id = s.qris_file_id;

  const base = (s.domain_publik || "https://barsolutions-invoice-app.vercel.app").replace(/\/$/, "");
  const link = base + "/?quotation=" + encodeURIComponent(q.Nomor);

  return {
    quotation: {
      ID: q.id,
      Nomor: q.Nomor,
      client: q.client ? { Nama: q.client.Nama, Perusahaan: q.client.Perusahaan, Alamat: q.client.Alamat } : null,
      Tanggal: q.Tanggal,
      TanggalBerlaku: q.TanggalBerlaku,
      Catatan: q.Catatan,
      Subtotal: q.Subtotal,
      Diskon: q.Diskon,
      DiskonNilai: q.DiskonNilai,
      DiskonPersen: q.DiskonPersen,
      DiskonTipe: q.DiskonTipe,
      PajakPersen: q.PajakPersen,
      Pajak: q.Pajak,
      Total: q.Total,
      Status: q.Status,
      CreatedByNama: q.CreatedByNama,
      CreatedByJabatan: q.CreatedByJabatan,
      CreatedByTtd: q.CreatedByTtd,
      items: q.items.map((it) => ({
        Deskripsi: it.Deskripsi, Qty: it.Qty, Satuan: it.Satuan, Harga: it.Harga, Subtotal: it.Subtotal,
      })),
    },
    settings: sanitizeSettings(s),
    assets: a,
    link,
  };
}

module.exports = { list, get, create, update, remove, convert, getPdfData, getPublic };
