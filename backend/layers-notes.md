### What is the rule for "what can each layer know about"?
The rule is strict top-down dependency where each layer can only interact with the layer directly beneath it, completely blind to anything above


routes: only has the HTTP handlers, parse req/res
services: contains business logic, no req/res
repositories: has SQL only, no business logic

---
### Why should repositories never format HTTP responses?
They are intended to talk to our databse only, so mixing HTTP objects with them breaks code reusability, crashes if we switch protocols and violes the separation concerns

---
### Why should routes never write SQL directly?
Routes exist solely to intercept user requests and dispatch responses back to the client interface. Allowing raw SQL queries inside your network endpoint files creates severe security vulnerabilities, makes the application impossible to unit-test without a live connection, and results in duplicated, chaotic database interactions across multiple backend routes.

---