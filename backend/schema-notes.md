### Why UUID instead of auto-incrementing integers?
UUIDs provide globally unique IDs, making records safer to merge across systems and harder to guess than auto-incrementing integers.

---
### Why TIMESTAMPTZ instead of TIMESTAMP?
TIMESTAMPTZ stores timestamps with time zone information, ensuring dates and times remain accurate across different regions and servers.

---
### What does the CHECK (status IN (...)) constraint buy you over just a comment?
A CHECK (status IN (...)) constraint enforces valid values at the database level, whereas a comment only documents the intended values without preventing invalid data.

---
### Why ON DELETE CASCADE on conversations.lead_id and messages.lead_id?
ON DELETE CASCADE automatically removes related conversations and messages when a lead is deleted, preventing orphaned records.