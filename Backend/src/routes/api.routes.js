const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { handleApi } = require("../controllers/api.controller");

const router = express.Router();

router.post("/", (req, res, next) => {
  const { resource, action } = req.body;

  if (resource === "auth" && action === "login") {
    return handleApi(req, res);
  }

  if (resource === "invoices" && action === "public") {
    return handleApi(req, res);
  }

  if (resource === "quotations" && action === "public") {
    return handleApi(req, res);
  }

  if (resource === "settings" && action === "list") {
    return handleApi(req, res);
  }

  if (resource === "bootstrap" && action === "get") {
    return handleApi(req, res);
  }

  authMiddleware(req, res, () => handleApi(req, res));
});

module.exports = router;
