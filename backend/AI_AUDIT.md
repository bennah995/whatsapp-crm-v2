## DAY 1
used AI to write the script to migrate data from my SQlite to postgres database, and test scripts
migrating script:
 /scripts/migrate-from-sqlite.js

Testing scripts
 /db/test-pool.js
 /db/testConnection.js

## DAY 2
No AI used

## Day 3
### Every file that contains auth code
middleware/requireAuth.js - handwritten
- validate incoming JSON web token from the authorization header and attaches the parsed user data to the request

---
middleware/requireRole.js - handwritten
checks role of the authenticated user and blocks access if they do not match the required administrative permissions

routes/auth.js - handwritten
Handles manual user creation by hashing passwords with bcrypt and issues a signed JSON webtoken during authentication

---
everything together at
index.js - handwritten
parts that was added connects the protected API routers to their server ports

checklist: did any AI touch any of these files?
only index.js during testing and helped me rewrite to:
```
app.use("/api", requireAuth, leadsRoutes);
```
 from
```
app.use("/api/leads", requireAuth, leadsRoutes);
in order to match the respective path(s)
```
This was to avoid duplication such as `/api/leads/leads` and ensure everything matches up correctly

## Day 4
Used AI to generate a bunch of data in my database:
