const authService = require("../services/auth.service");
const clientService = require("../services/client.service");
const serviceService = require("../services/service.service");
const quotationService = require("../services/quotation.service");
const invoiceService = require("../services/invoice.service");
const paymentService = require("../services/payment.service");
const settingsService = require("../services/settings.service");
const fileService = require("../services/file.service");
const reportService = require("../services/report.service");
const emailService = require("../services/email.service");
const bootstrapService = require("../services/bootstrap.service");

const handlers = {
  auth: {
    login: (body) => authService.login(body.data || body),
    list: (body, req) => authService.listUsers(),
    create: (body) => authService.createUser(body.data),
    update: (body) => authService.updateUser(body.id, body.data),
    delete: (body) => authService.deleteUser(body.id),
  },
  clients: {
    list: () => clientService.list(),
    create: (body) => clientService.create(body.data),
    update: (body) => clientService.update(body.id, body.data),
    delete: (body) => clientService.remove(body.id),
  },
  services: {
    list: () => serviceService.list(),
    create: (body) => serviceService.create(body.data),
    update: (body) => serviceService.update(body.id, body.data),
    delete: (body) => serviceService.remove(body.id),
  },
  quotations: {
    list: () => quotationService.list(),
    get: (body) => quotationService.get(body.id),
    create: (body) => quotationService.create(body.data),
    update: (body) => quotationService.update(body.id, body.data),
    delete: (body) => quotationService.remove(body.id),
    convert: (body) => quotationService.convert(body.id, body.data),
    pdfdata: (body) => quotationService.getPdfData(body.id),
    public: (body) => quotationService.getPublic(body.nomor),
    sendemail: async (body) => {
      await emailService.send({ to: body.data?.to, subjek: body.data?.subjek, isi: body.data?.isi });
      return { success: true, message: "Email terkirim" };
    },
  },
  invoices: {
    list: () => invoiceService.list(),
    get: (body) => invoiceService.get(body.id),
    create: (body) => invoiceService.create(body.data),
    update: (body) => invoiceService.update(body.id, body.data),
    delete: (body) => invoiceService.remove(body.id),
    pdfdata: (body) => invoiceService.getPdfData(body.id),
    public: (body) => invoiceService.getPublic(body.nomor),
    sendemail: async (body) => {
      await emailService.send({ to: body.data?.to, subjek: body.data?.subjek, isi: body.data?.isi });
      return { success: true, message: "Email terkirim" };
    },
  },
  payments: {
    list: () => paymentService.list(),
    create: (body) => paymentService.create(body.data),
    update: (body) => paymentService.update(body.id, body.data),
    delete: (body) => paymentService.remove(body.id),
  },
  settings: {
    list: () => settingsService.list(),
    update: (body) => settingsService.update(body.data),
    upload: (body) => settingsService.upload(body.data),
  },
  file: {
    get: (body) => fileService.getFile(body.fileId),
  },
  report: {
    get: (body) => reportService.getReport(body.start, body.end),
  },
  bootstrap: {
    get: () => bootstrapService.get(),
  },
};

async function handleApi(req, res) {
  try {
    const { resource, action } = req.body;
    if (!resource || !action) {
      return res.status(400).json({ success: false, message: "resource dan action wajib diisi" });
    }

    const resourceHandlers = handlers[resource];
    if (!resourceHandlers) {
      return res.status(404).json({ success: false, message: `Resource "${resource}" tidak ditemukan` });
    }

    const handler = resourceHandlers[action];
    if (!handler) {
      return res.status(404).json({ success: false, message: `Action "${action}" tidak ditemukan untuk resource "${resource}"` });
    }

    const result = await handler(req.body, req);
    res.json({ success: true, data: result });
  } catch (err) {
    const resource = req.body?.resource;
    const msg = err.message || "Terjadi kesalahan";
    console.error(`API Error [${resource}/${req.body?.action}]:`, msg);
    const status = resource === "auth" ? 401 : 400;
    res.status(status).json({ success: false, message: msg });
  }
}

module.exports = { handleApi };
