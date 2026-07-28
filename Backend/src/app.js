require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes/api.routes");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));

app.use(express.static(path.join(__dirname, "../../")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../index.html"));
});

app.get("/api/ping", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRoutes);

module.exports = app;
