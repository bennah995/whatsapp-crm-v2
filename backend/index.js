const cors = require("cors");
require("dotenv").config();

const express = require("express");
const { initSchema } = require("./db/init");
const app = express();
const PORT = process.env.PORT || 3000;
const crypto = require("crypto");

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
app.use("/api", express.json());
app.use("/api", leadsRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error(err);
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

// function parseIncoming(body) {
//   const entry = body.entry?.[0];
//   const change = entry?.changes?.[0];
//   const value = change?.value;
//   const message = value?.messages?.[0];
//   if (!message) return null;

//   return {
//     from: message.from, // phone number
//     text: message.text?.body, // text content
//     timestamp: message.timestamp,
//     messageId: message.id,
//   };
// }

// const whatsappRoutes = require("./routes/whatsapp");
// app.use("/whatsapp", express.json({ verify: verifySignature }));
// app.use("/whatsapp", whatsappRoutes);

// const leadsRoutes = require("./routes/leads");
// app.use("/api", express.json());
// app.use("/api", leadsRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await initSchema();
  } catch (err) {
    console.error("Schema init failed:", err.message);
  }
});

