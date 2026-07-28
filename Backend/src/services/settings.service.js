const prisma = require("../config/prisma");

async function list() {
  const setting = await prisma.setting.findFirst();
  return setting?.data || {};
}

async function update(data) {
  let setting = await prisma.setting.findFirst();
  if (setting) {
    const merged = { ...(setting.data || {}), ...data };
    await prisma.setting.update({ where: { id: setting.id }, data: { data: merged } });
  } else {
    await prisma.setting.create({ data: { data } });
  }
  return { success: true };
}

async function upload({ type, base64, fileName, mimeType }) {
  const fileId = `file_${type}_${Date.now()}`;
  const preview = `data:${mimeType};base64,${base64}`;

  const setting = await prisma.setting.findFirst();
  const keyMap = {
    logo: "logo_file_id",
    favicon: "favicon_file_id",
    ttd: "ttd_file_id",
    stempel: "stempel_file_id",
    qris: "qris_file_id",
    logo_login: "logo_login_file_id",
    login_bg: "login_bg_file_id",
  };
  const key = keyMap[type];
  if (key && setting) {
    const merged = { ...(setting.data || {}), [key]: preview };
    await prisma.setting.update({ where: { id: setting.id }, data: { data: merged } });
  }

  return { preview, fileId };
}

module.exports = { list, update, upload };
