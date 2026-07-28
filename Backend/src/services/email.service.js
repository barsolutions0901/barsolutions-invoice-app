const nodemailer = require("nodemailer");
const prisma = require("../config/prisma");

async function getSmtpConfig() {
  const setting = await prisma.setting.findFirst();
  const d = setting?.data || {};
  return {
    host: d.smtp_host || process.env.SMTP_HOST,
    port: parseInt(d.smtp_port || process.env.SMTP_PORT || "587"),
    user: d.smtp_user || process.env.SMTP_USER,
    pass: d.smtp_pass || process.env.SMTP_PASS,
    from: d.smtp_from || process.env.SMTP_FROM || d.smtp_user,
    fromName: d.smtp_from_name || process.env.SMTP_FROM_NAME || "BarSolutions",
  };
}

async function send({ to, subjek, isi }) {
  const cfg = await getSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error("Konfigurasi SMTP belum lengkap. Isi SMTP Host, Username, dan Password di Pengaturan.");
  }
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  await transporter.sendMail({
    from: `"${cfg.fromName}" <${cfg.from}>`,
    to,
    subject: subjek,
    html: isi.replace(/\n/g, "<br>"),
  });
  return { success: true };
}

module.exports = { send };
