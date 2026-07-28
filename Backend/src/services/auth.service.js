const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");

async function login({ username, password }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ Username: username }, { Email: username }],
    },
  });

  if (!user) throw new Error("Username atau password salah");
  if (user.Status !== "Aktif") throw new Error("Akun tidak aktif");

  const valid = await bcrypt.compare(password, user.Password);
  if (!valid) throw new Error("Username atau password salah");

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = generateToken({ id: user.id, email: user.Email, role: user.Role });
  return {
    token,
    user: {
      ID: user.id,
      Nama: user.Nama,
      Username: user.Username,
      Email: user.Email,
      Role: user.Role,
      Status: user.Status,
      Foto: user.Foto,
      Jabatan: user.Jabatan,
      NoHp: user.NoHp,
      TandaTangan: user.TandaTangan,
    },
  };
}

async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map((u) => ({
    ID: u.id,
    Nama: u.Nama,
    Username: u.Username,
    Email: u.Email,
    Jabatan: u.Jabatan,
    NoHp: u.NoHp,
    Role: u.Role,
    Status: u.Status,
    Foto: u.Foto,
    TandaTangan: u.TandaTangan,
  }));
}

async function createUser(data) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ Username: data.Username }, { Email: data.Email || "" }] },
  });
  if (existing) throw new Error("Username atau Email sudah digunakan");

  const role = await prisma.role.findFirst({ where: { name: data.Role || "Staf" } });
  if (!role) throw new Error("Role tidak ditemukan");

  const hashed = await bcrypt.hash(data.Password, 10);
  const user = await prisma.user.create({
    data: {
      Nama: data.Nama || "",
      Username: data.Username,
      Email: data.Email || "",
      Password: hashed,
      Jabatan: data.Jabatan || "",
      NoHp: data.NoHp || "",
      Foto: data.Foto || "",
      TandaTangan: data.TandaTangan || "",
      Role: data.Role || "Staf",
      Status: data.Status || "Aktif",
      roleId: role.id,
    },
  });
  return { ID: user.id, Nama: user.Nama, Username: user.Username, Role: user.Role, Status: user.Status };
}

async function updateUser(id, data) {
  const updateData = {};
  if (data.Nama !== undefined) updateData.Nama = data.Nama;
  if (data.Jabatan !== undefined) updateData.Jabatan = data.Jabatan;
  if (data.Email !== undefined) updateData.Email = data.Email;
  if (data.NoHp !== undefined) updateData.NoHp = data.NoHp;
  if (data.Role !== undefined) updateData.Role = data.Role;
  if (data.Status !== undefined) updateData.Status = data.Status;
  if (data.Foto !== undefined) updateData.Foto = data.Foto;
  if (data.TandaTangan !== undefined) updateData.TandaTangan = data.TandaTangan;
  if (data.Username !== undefined) updateData.Username = data.Username;
  if (data.Password && data.Password.length >= 6) {
    updateData.Password = await bcrypt.hash(data.Password, 10);
  }
  await prisma.user.update({ where: { id }, data: updateData });
  return { success: true };
}

async function deleteUser(id) {
  await prisma.user.delete({ where: { id } });
  return { success: true };
}

module.exports = { login, listUsers, createUser, updateUser, deleteUser };
