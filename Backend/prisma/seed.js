const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  await prisma.role.upsert({
    where: { name: "Owner" },
    update: {},
    create: { name: "Owner", description: "System Owner" },
  });

  await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin", description: "Administrator" },
  });

  await prisma.role.upsert({
    where: { name: "Staf" },
    update: {},
    create: { name: "Staf", description: "Staff" },
  });

  const existing = await prisma.user.findUnique({ where: { Username: "admin" } });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        Username: "admin",
        Nama: "Administrator",
        Email: "admin@barsolutions.id",
        Password: hashed,
        Role: "Admin",
        Status: "Aktif",
        Jabatan: "System Administrator",
        roleId: (await prisma.role.findUnique({ where: { name: "Owner" } })).id,
      },
    });
  }

  const setting = await prisma.setting.findFirst();
  if (!setting) {
    await prisma.setting.create({
      data: {
        data: {
          nama_perusahaan: "BarSolutions",
          email: "",
          telepon: "",
          website: "",
          npwp: "",
          alamat: "",
          prefix_invoice: "INV",
          prefix_penawaran: "PEN",
          pajak_persen: 11,
          mata_uang: "IDR",
          tema: "light",
          warna_utama: "#6366f1",
          format_tanggal: "DD/MM/YYYY",
          zona_waktu: "Asia/Jakarta",
          bahasa: "id",
          domain_publik: "https://barsolutions-invoice-app.vercel.app",
          login_tema: "ikuti_aplikasi",
          login_warna_aksen: "#6366f1",
          login_gaya_latar: "gradasi",
          login_warna_latar1: "#6366f1",
          login_warna_latar2: "#111827",
          login_teks_sambutan: "Masuk untuk mengelola invoice Anda",
          rekening_bank_json: JSON.stringify([]),
          ewallet_json: JSON.stringify([]),
          satuan_json: JSON.stringify([]),
        },
      },
    });
  }

  console.log("✅ Seed berhasil dijalankan");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
