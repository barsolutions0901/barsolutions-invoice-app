const prisma = require("../config/prisma");

async function list() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return clients.map((c) => ({
    ID: c.id,
    Nama: c.Nama,
    Perusahaan: c.Perusahaan,
    Email: c.Email,
    Telepon: c.Telepon,
    Alamat: c.Alamat,
    NPWP: c.NPWP,
    Catatan: c.Catatan,
  }));
}

async function create(data) {
  const client = await prisma.client.create({
    data: {
      Nama: data.Nama || "",
      Perusahaan: data.Perusahaan || "",
      Email: data.Email || "",
      Telepon: data.Telepon || "",
      Alamat: data.Alamat || "",
      NPWP: data.NPWP || "",
      Catatan: data.Catatan || "",
    },
  });
  return { ...client, ID: client.id };
}

async function update(id, data) {
  await prisma.client.update({ where: { id }, data });
  return { success: true };
}

async function remove(id) {
  await prisma.client.delete({ where: { id } });
  return { success: true };
}

module.exports = { list, create, update, remove };
