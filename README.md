# WhatsApp CRM

A full-stack WhatsApp Customer Relationship Management (CRM) system for capturing, managing, and tracking customer conversations from WhatsApp. The project consists of an Express.js backend that handles webhooks and APIs, and a React dashboard for managing leads, conversations, and lead statuses.

---

# Features

* Receive WhatsApp webhook events from Meta
* Automatically create and update leads
* View all leads in a searchable dashboard
* View complete conversation history for each lead
* Update lead status
* Add internal notes to leads
* Dashboard statistics
* REST API for frontend communication

---

# Tech Stack

## Backend

* Node.js
* Express.js
* SQLite
* dotenv

## Frontend

* React
* Vite
* Tailwind CSS
* React Router

## Tooling

* npm Workspaces
* Concurrently

---

# Repository Structure

```text
## Repository Structure

whatsapp-crm/
│
├── backend/
│   ├── db/
│   │   ├── conversations.js
│   │   ├── crm.db
│   │   ├── helpers.js
│   │   ├── init.js
│   │   ├── leads.js
│   │   ├── messages.js
│   │   └── schema.sql
│   │
│   ├── routes/
│   │   ├── leads.js
│   │   └── whatsapp.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── CHECKLIST.md
│
├── frontend/
│   ├── crm-dashboard/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   └── leads.js
│   │   │   ├── assets/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   │   ├── LeadDetailPage.jsx
│   │   │   │   └── LeadsPage.jsx
│   │   │   ├── App.jsx
│   │   │   ├── App.css
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   │
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── vite.config.js
│   │   └── README.md
│
└── README.md
```
```

---

# System Architecture

```text
                     WhatsApp User
                           │
                           ▼
                    WhatsApp Cloud API
                           │
                           ▼
                      Meta Webhook
                           │
                           ▼
                  Express Backend API
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
   SQLite Database                     REST Endpoints
                                                │
                                                ▼
                                       React Dashboard
```

---

# Prerequisites

Before running the project, install:

* Node.js 20 or newer
* npm 10 or newer
* Git
* ngrok (for local webhook testing)
* Meta Developer Account
* WhatsApp Business Cloud API App

---

# Environment Variables

## Backend

Create

```
packages/backend/.env
```

Example:

```env
PORT=3000

VERIFY_TOKEN=your_verify_token

WHATSAPP_TOKEN=your_access_token

PHONE_NUMBER_ID=your_phone_number_id

META_APP_SECRET=meta_app_secret
```

---

## Frontend

Create

```
packages/frontend/.env
```

Example

```env
VITE_API_URL=http://localhost:3000
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/bennah995/whatsapp-crm.git
```

Move into the project

```bash
cd whatsapp-crm
```

Install all dependencies

```bash
npm install
```

Because this project uses npm workspaces, a single install command installs dependencies for both the backend and frontend.

---

# Running the Project

Start both applications

```bash
npm run dev
```

Start only the backend

```bash
npm run dev:backend
```

Start only the frontend

```bash
npm run dev
```

---
# First-Time Setup

## 1. Clone the repository

```bash
git clone https://github.com/bennah995/whatsapp-crm.git
cd whatsapp-crm
```

---

## 2. Install backend dependencies

```bash
cd backend
npm install
```

---

## 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory and add the following variables:

```env
PORT=3000
VERIFY_TOKEN=your_verify_token
WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id
```

---

## 4. Start the backend server

From the `backend` directory, run:

```bash
npm run dev
```

The backend will be available at:

```
http://localhost:3000
```

---

## 5. Install frontend dependencies

Open a new terminal and navigate to the frontend project:

```bash
cd frontend/crm-dashboard
npm install
```

---

## 6. Configure frontend environment variables

Create a `.env` file inside `frontend/crm-dashboard`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 7. Start the frontend

From the `frontend/crm-dashboard` directory, run:

```bash
npm run dev
```

The dashboard will be available at the URL shown by Vite (typically `http://localhost:5173`).

---

## 8. Expose the backend using ngrok

In a new terminal, run:

```bash
ngrok http 3000
```

Example output:

```
https://abcd1234.ngrok-free.app
```

---

## 9. Configure the Meta Webhook

In the Meta Developer Dashboard, configure:

**Webhook URL**

```
https://YOUR_NGROK_URL/webhook
```

**Verify Token**

```
Same value as VERIFY_TOKEN in backend/.env
```

Subscribe to the following webhook field:

- `messages`

---

## 10. Verify the setup

Send a WhatsApp message to your connected WhatsApp Business number.

If everything is configured correctly:

- The webhook receives the message.
- A lead is created (or updated) in the database.
- The conversation is stored.
- The lead appears in the React CRM dashboard.

#

# API

## GET

```
/api/leads
```

Returns paginated leads.

---

## GET

```
/api/leads/:id
```

Returns a single lead together with conversation history.

---

## PATCH

```
/api/leads/:id
```

Updates lead information.

Example

```json
{
  "status": "qualified"
}
```

or

```json
{
  "notes": "Requested pricing information."
}
```

---

## GET

```
/api/stats
```

Returns lead statistics grouped by status.

---

# Database

The application uses **SQLite** as its primary database. It consists of three main tables: `leads`, `conversations`, and `messages`.

---

## leads

Stores information about each customer (lead) who interacts with the WhatsApp Business account.

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT | Unique identifier (UUID) for the lead. |
| `wa_phone` | TEXT | Customer's WhatsApp phone number (unique). |
| `name` | TEXT | Customer's name. |
| `email` | TEXT | Customer's email address. |
| `inquiry_type` | TEXT | Category of the customer's inquiry. |
| `status` | TEXT | Current lead status (`new`, `contacted`, `qualified`, `closed`). |
| `notes` | TEXT | Internal notes added by CRM users. |
| `created_at` | TEXT | Timestamp when the lead was created. |
| `updated_at` | TEXT | Timestamp of the most recent update. |

---

## conversations

Stores the conversation state for each lead, allowing the chatbot or workflow engine to track where a customer is in a conversation.

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT | Unique identifier (UUID) for the conversation. |
| `lead_id` | TEXT | References the associated lead. |
| `state` | TEXT | Current conversation state. |
| `data` | TEXT | Serialized conversation data or context. |
| `updated_at` | TEXT | Timestamp of the last conversation update. |

---

## messages

Stores all incoming and outgoing WhatsApp messages associated with a lead.

| Field | Type | Description |
|-------|------|-------------|
| `id` | TEXT | Unique identifier (UUID) for the message. |
| `lead_id` | TEXT | References the associated lead. |
| `direction` | TEXT | Message direction (`incoming` or `outgoing`). |
| `body` | TEXT | Message content. |
| `created_at` | TEXT | Timestamp when the message was sent or received. |

# Common Commands

Install dependencies

```bash
npm install
```

Run both apps

```bash
npm run dev
```

Run backend

```bash
npm run dev:backend
```

Run frontend

```bash
npm run dev:frontend
```

Build frontend

```bash
npm run build -w @crm/frontend
```

---

# Troubleshooting

## Port already in use

Find the running process

```bash
lsof -i :3000
```

Terminate it

```bash
kill -9 PID
```

---

## Frontend cannot reach backend

Verify

```
VITE_API_URL
```

matches your backend address.

---

## Webhook verification fails

Ensure the Meta Verify Token matches the

```
VERIFY_TOKEN
```

inside the backend `.env` file.

---

## npm install errors

Delete

```
node_modules
package-lock.json
```

Then reinstall

```bash
npm install
```

---

## ngrok URL changed

Free ngrok URLs change every session.

Update the webhook URL inside the Meta Developer Dashboard whenever you start a new ngrok tunnel.

---

# Future Improvements

* Authentication
* Role-based access control
* Lead assignment
* Labels and tags
* File attachments
* Live updates with WebSockets
* Notifications
* PostgreSQL support
* Docker support
* CI/CD with GitHub Actions
* Unit and integration tests

---

# Author

**Benard**

Software Developer

GitHub: https://github.com/bennah995
