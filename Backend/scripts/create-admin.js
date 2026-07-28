require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function main() {
  const username = "admin";
  const password = "admin123";

  let role = await prisma.role.findUnique({ where: { name: "Owner" } });
  if (!role) {
    role = await prisma.role.create({ data: { name: "Owner", description: "System Owner" } });
  }

  const existing = await prisma.user.findUnique({ where: { Username: username } });
  if (existing) {
    console.log("⚠️  User admin sudah ada");
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      Nama: "Administrator",
      Username: username,
      Email: "admin@barsolutions.id",
      Password: hashed,
      Role: "Admin",
      Status: "Aktif",
      Jabatan: "System Administrator",
      roleId: role.id,
    },
  });

  console.log("==================================");
  console.log("✅ Admin berhasil dibuat");
  console.log("Username :", username);
  console.log("Password :", password);
  console.log("==================================");
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
