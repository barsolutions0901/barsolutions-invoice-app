let app;
try {
  app = require("../Backend/src/app");
} catch (err) {
  console.error("Failed to load app:", err);
}

module.exports = (req, res) => {
  if (!app) {
    res.status(500).json({ success: false, message: "Server initialization failed" });
    return;
  }
  app(req, res);
};
