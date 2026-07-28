const prisma = require("../config/prisma");

async function list() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });
  return services.map((s) => ({
    ID: s.id,
    NamaLayanan: s.NamaLayanan,
    Kategori: s.Kategori,
    Satuan: s.Satuan,
    Harga: s.Harga,
    Deskripsi: s.Deskripsi,
    Status: s.Status,
  }));
}

async function create(data) {
  const svc = await prisma.service.create({
    data: {
      NamaLayanan: data.NamaLayanan || "",
      Kategori: data.Kategori || "",
      Satuan: data.Satuan || "",
      Harga: Number(data.Harga) || 0,
      Deskripsi: data.Deskripsi || "",
      Status: data.Status || "Aktif",
    },
  });
  return { ...svc, ID: svc.id };
}

async function update(id, data) {
  const updateData = {};
  if (data.NamaLayanan !== undefined) updateData.NamaLayanan = data.NamaLayanan;
  if (data.Kategori !== undefined) updateData.Kategori = data.Kategori;
  if (data.Satuan !== undefined) updateData.Satuan = data.Satuan;
  if (data.Harga !== undefined) updateData.Harga = Number(data.Harga);
  if (data.Deskripsi !== undefined) updateData.Deskripsi = data.Deskripsi;
  if (data.Status !== undefined) updateData.Status = data.Status;
  await prisma.service.update({ where: { id }, data: updateData });
  return { success: true };
}

async function remove(id) {
  await prisma.service.delete({ where: { id } });
  return { success: true };
}

module.exports = { list, create, update, remove };
