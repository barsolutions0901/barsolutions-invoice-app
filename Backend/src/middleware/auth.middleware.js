const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const USER_CACHE_TTL = 30000;
const userCache = new Map();

async function getActiveUser(id) {
  const cached = userCache.get(id);
  if (cached && Date.now() - cached.t < USER_CACHE_TTL) return cached.u;
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) userCache.set(id, { u: user, t: Date.now() });
  else userCache.delete(id);
  return user;
}

async function authMiddleware(req, res, next) {
  const token = req.body.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getActiveUser(decoded.id);
    if (!user || user.Status !== "Aktif") {
      return res.status(401).json({ success: false, message: "User tidak aktif" });
    }
    req.user = {
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
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token tidak valid" });
  }
}

module.exports = authMiddleware;
