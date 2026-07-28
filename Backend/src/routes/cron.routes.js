const express = require("express");
const { updateOverdueInvoices } = require("../services/cron.service");

const router = express.Router();

router.get("/daily", async (req, res) => {
  try {
    const result = await updateOverdueInvoices();
    res.json({ success: true, message: `Cron selesai: ${result.updated} invoice ditandai Jatuh Tempo`, data: result });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
