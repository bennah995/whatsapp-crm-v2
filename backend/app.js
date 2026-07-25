require("dotenv").config();
const cors = require("cors");
const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
}));

function verifySignature(req, res, buf) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) throw new Error("No signature");

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

const whatsappRoutes = require("./routes/whatsapp");
app.use("/whatsapp", express.json({ verify: verifySignature }));
app.use("/whatsapp", whatsappRoutes);

const leadsRoutes = require("./routes/leads");
const requireAuth = require("./middleware/requireAuth");

app.use("/api", express.json());
app.use("/api", requireAuth, leadsRoutes);

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;