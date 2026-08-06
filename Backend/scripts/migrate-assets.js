const prisma = require("../src/config/prisma");

const SETTING_TO_ASSET = {
  logo_file_id: "logo",
  favicon_file_id: "favicon",
  ttd_file_id: "ttd",
  stempel_file_id: "stempel",
  qris_file_id: "qris",
  logo_login_file_id: "logo_login",
  login_bg_file_id: "login_bg",
};

async function run() {
  const setting = await prisma.setting.findFirst();
  if (!setting) return;
  const data = setting.data || {};
  let changed = false;

  for (const [settingKey, assetKey] of Object.entries(SETTING_TO_ASSET)) {
    const val = data[settingKey];
    if (typeof val !== "string" || !val.startsWith("data:")) continue;
    const m = val.match(/^data:(.+?);base64,(.+)$/);
    if (!m) continue;
    await prisma.asset.upsert({
      where: { key: assetKey },
      update: { mimeType: m[1], base64: m[2] },
      create: { key: assetKey, mimeType: m[1], base64: m[2] },
    });
    data[settingKey] = assetKey;
    changed = true;
  }

  if (changed) {
    await prisma.setting.update({ where: { id: setting.id }, data: { data } });
  }
}

if (require.main === module) {
  run()
    .then(() => {
      console.log("migrate-assets: OK");
      process.exit(0);
    })
    .catch((e) => {
      console.error("migrate-assets failed:", e.message);
      process.exit(1);
    });
}

module.exports = { run };
