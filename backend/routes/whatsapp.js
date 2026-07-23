const express = require("express");
const router = express.Router();
const axios = require("axios");

const { findOrCreateLead, updateLead } = require("../db/leads");
const { getConversation, saveConversation } = require("../db/conversations");
const { logMessage } = require("../db/messages");

function parseIncoming(body) {
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message) return null;

  return {
    from: message.from, // phone number
    text: message.text?.body, // text content
    timestamp: message.timestamp,
    messageId: message.id,
  };
}

const STATES = {
  GREETING: "greeting",
  AWAITING_NAME: "awaiting_name",
  AWAITING_EMAIL: "awaiting_email",
  AWAITING_INQUIRY: "awaiting_inquiry",
  DONE: "done",
};

async function handleMessage(lead, text) {
  const convo = await getConversation(lead.id);
  const state = convo ? convo.state : STATES.GREETING;
  const data = convo ? JSON.parse(convo.data || "{}") : {}

  let reply;
  let nextState = state;

  if (state === STATES.GREETING) {
    nextState = STATES.AWAITING_NAME;
    reply = "Karibu! What is your full name?";
  }
  if (state === STATES.AWAITING_NAME) {
    data.name = text;
    nextState = STATES.AWAITING_EMAIL;
    reply = `Asante ${text}. What is your email?`;
    await updateLead(lead.id, { name: text });
  }
  if (state === STATES.AWAITING_EMAIL) {
    data.email = text;
    nextState = STATES.AWAITING_INQUIRY;
    reply = "What are you interested in?";
    await updateLead(lead.id, { email: text });
  }
  if (state === STATES.AWAITING_INQUIRY) {
    data.inquiry = text;
    nextState = STATES.DONE;
    reply = "Thank you. An agent will be in touch shortly.";
    await updateLead(lead.id, { inquiry_type: text, status: "qualified" });
  }
  if(state === STATES.DONE){
    reply = "You are all set. Dial again any time.";
  }
  await saveConversation(lead.id, nextState, data);
  return reply;
}

async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    },
    {
      headers: { Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}` },
    },
  );
}

router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post("/webhook", async (req, res) => {
  const parsed = parseIncoming(req.body);
  if (!parsed) return res.sendStatus(200);

  const lead = await findOrCreateLead(parsed.from);
  await logMessage(lead.id, "inbound", parsed.text);

  const reply = await handleMessage(lead, parsed.text);
  try {
    await sendMessage(parsed.from, reply);
  } catch (err) {
    console.log(err);
  }

  console.log("Incoming WhatsApp update:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = router;