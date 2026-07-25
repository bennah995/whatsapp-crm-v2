const cors = require("cors");
require("dotenv").config();

const express = require("express");
const { initSchema } = require("./db/init");
const app = express();
const PORT = process.env.PORT || 3000;
const crypto = require("crypto");

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
}));

function verifySignature(req, res, buf) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    throw new Error("No signature");
  }
  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", process.env.META_APP_SECRET)
      .update(buf)
      .digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Invalid signature");
  }
}

// whatsapp bot handling
const whatsappRoutes = require("./routes/whatsapp");
app.use("/whatsapp", express.json({verify: verifySignature}));
app.use("/whatsapp", whatsappRoutes);

// lead management 
const leadsRoutes = require("./routes/leads");

// auth
const requireAuth = require("./middleware/requireAuth");
const requireRole = require("./middleware/requireRole");

app.use("/api", express.json());
app.use("/api", requireAuth, leadsRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await initSchema();
  } catch (err) {
    console.error("Schema init failed:", err.message);
  }
});

