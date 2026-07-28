const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const PORT = process.env.PORT || 3000;

let app;
try {
  app = require("./app");
} catch (err) {
  console.error("Failed to load app:", err);
  process.exit(1);
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  process.exit(1);
});