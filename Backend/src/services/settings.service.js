const prisma = require("../config/prisma");
const { upsertAsset } = require("./file.service");

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 60000;

const KEY_MAP = {
  logo: "logo_file_id",
  favicon: "favicon_file_id",
  ttd: "ttd_file_id",
  stempel: "stempel_file_id",
  qris: "qris_file_id",
  logo_login: "logo_login_file_id",
  login_bg: "login_bg_file_id",
};

async function list() {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;
  const setting = await prisma.setting.findFirst();
  _cache = setting?.data || {};
  _cacheTime = now;
  return _cache;
}

async function normalizeImageFields(data) {
  const out = { ...(data || {}) };
  for (const [assetKey, settingKey] of Object.entries(KEY_MAP)) {
    const v = out[settingKey];
    if (typeof v === "string" && v.startsWith("data:")) {
      const m = v.match(/^data:(.+?);base64,(.+)$/);
      if (m) {
        await upsertAsset(assetKey, m[1], m[2]);
        out[settingKey] = assetKey;
      }
    }
  }
  return out;
}

async function update(data) {
  _cache = null;
  const normalized = await normalizeImageFields(data);
  let setting = await prisma.setting.findFirst();
  if (setting) {
    const merged = { ...(setting.data || {}), ...normalized };
    await prisma.setting.update({ where: { id: setting.id }, data: { data: merged } });
  } else {
    await prisma.setting.create({ data: { data: normalized } });
  }
  return { success: true };
}

async function upload({ type, base64, fileName, mimeType }) {
  const assetKey = type;
  await upsertAsset(assetKey, mimeType, base64);

  const preview = `data:${mimeType};base64,${base64}`;
  const settingKey = KEY_MAP[type];
  if (settingKey) {
    _cache = null;
    const setting = await prisma.setting.findFirst();
    if (setting) {
      const merged = { ...(setting.data || {}), [settingKey]: assetKey };
      await prisma.setting.update({ where: { id: setting.id }, data: { data: merged } });
    } else {
      await prisma.setting.create({ data: { data: { [settingKey]: assetKey } } });
    }
  }

  return { preview, fileId: assetKey };
}

module.exports = { list, update, upload };
