# Daily Sales & Import Manager (Web Edition)

A fullstack web application version of **Daily Sales & Import Manager**, built with **React** (Frontend) and **Node.js / Express** (Backend), maintaining full business logic parity, identical Role-Based Access Control (RBAC) restrictions, and sharing the **exact same Google Cloud Firestore database** as the Flutter mobile app (`proj_ela`).

---

## 📌 Architecture & Database Synchronization

| Component | Technology | Mobile Parity (`proj_ela`) |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Tailwind CSS | Flutter Material 3 + Google Fonts Inter |
| **Backend** | Node.js + Express | Dart Service Layer |
| **Database** | Google Cloud Firestore | Same Database (`elaprojects-3212e`) |
| **Firestore Collection** | `sales_entries` | Identical schema and document keys |
| **Security & Auth** | JWT + RBAC Middleware | Role-based system isolation |

### Shared Firestore Document Schema
```json
{
  "id": "uuid-v4-string",
  "systemType": "CENET | LOOP",
  "recordDate": "2026-11-08T00:00:00.000Z",
  "submissionDate": "2026-11-09T17:00:00.000Z",
  "field1Amount": 187750.24,
  "field2Amount": 28720.01,
  "totalSales": 216470.25,
  "importSource": "API | Excel | CSV | PDF | Manual",
  "isLate": true,
  "delayReason": "POS network outage at branch"
}
```

---

## 🛡️ Role-Based Access Control (RBAC)

The application enforces role boundaries across both client views and server API endpoints:

| Role | CENET Access (Restaurant & Lounge) | LOOP Access (Butchery & Liquor) | Log & Audit Reports | Data Import & Create |
| :--- | :---: | :---: | :---: | :---: |
| **ADMIN** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Allowed |
| **CENET_MANAGER** | ✅ Full Access | ❌ Restricted (403 Forbidden) | ✅ CENET Logs | ✅ CENET Only |
| **LOOP_MANAGER** | ❌ Restricted (403 Forbidden) | ✅ Full Access | ✅ LOOP Logs | ✅ LOOP Only |
| **AUDITOR** | 👁️ Read-Only | 👁️ Read-Only | ✅ Full Audit Trail | ❌ Read-Only |

> **Quick Role Switcher:** A dropdown selector is built directly into the top navigation bar to test and demonstrate real-time RBAC transitions instantly.

---

## 🚀 Key Features

### 1. CENET Sales (Restaurant & Lounge)
- System Theme: Deep Purple (`#673ab7`)
- Field 1: **Restaurant**
- Field 2: **Lounge**
- Total Sales: Sum of Restaurant + Lounge
- Real-time card feed with date, source chips, and currency formatting.

### 2. LOOP Sales (Butchery & Liquor)
- System Theme: Teal (`#009688`)
- Field 1: **Butchery**
- Field 2: **Liquor**
- Total Sales: Sum of Butchery + Liquor

### 3. Log & Audit Report
- System Theme: Indigo (`#3f51b5`)
- Filter chips: **All Logs**, **Late Submissions Only**, **CENET Only**, **LOOP Only**
- Executive KPI bar: Total Revenue, Total Submissions, Late Submissions, On-Time SLA %
- Audit trail displaying submitted timestamp, document date, and source.

### 4. Late Submission Compliance Rule
- Checks calendar day difference between `recordDate` and `submissionDate`.
- If difference is **greater than 1 calendar day**, submission is flagged as `isLate: true`.
- Automatically opens a **Mandatory Delay Reason Dialog**. The submission cannot be saved to Firestore without documenting an explanation.

### 5. Multi-Source Import Engine
1. **Automated API Sync:** Direct one-click synchronization simulating the store POS API.
2. **Excel Import:** Upload `.xlsx` or `.xls` documents with auto-extraction of dates and amounts.
3. **CSV Import:** Parses `.csv` documents and identifies sales numbers.
4. **PDF Statement Import:** Extracts dates and financial figures from daily PDF summaries.
5. **Manual Entry Form:** Direct form entry with live total calculation.

---

## 🏃 Running the Web App

### Quick Start (Zero Extra Setup)
The backend includes a pre-configured standalone web client:

```bash
# 1. Navigate to the server folder
cd "/run/media/dani/CA30D3F130D3E30D/me is working/proj ela web/server"

# 2. Start the server
node index.js
```

Open your browser to: **`http://localhost:5000`**

### Development Mode (Vite React + Express)
```bash
# Start backend API (Port 5000)
cd server && npm start

# In a second terminal, start Vite frontend dev server (Port 5173)
cd client && npm run dev
```

---

## 📂 Project Directory Structure

```
proj ela web/
├── server/
│   ├── index.js                  # Express server entry point (Port 5000)
│   ├── .env                      # Firebase project ID and secret keys
│   ├── config/
│   │   └── firebase.js           # Firestore REST API & cloud integration (elaprojects-3212e)
│   ├── middleware/
│   │   └── auth.js               # RBAC and JWT token verification
│   ├── routes/
│   │   ├── auth.js               # Login & role-switching API
│   │   ├── sales.js              # Sales CRUD, late detection & query filters
│   │   └── import.js             # API sync, Excel/CSV/PDF document parser
│   ├── services/
│   │   ├── salesService.js       # Core sales persistence & Firestore sync
│   │   └── fileParserService.js  # CSV, Excel (.xlsx), and PDF document parsing
│   └── public/
│       └── index.html            # Standalone React web interface (Served at http://localhost:5000)
├── client/
│   ├── package.json              # React dependencies
│   ├── vite.config.js            # Vite configuration with API proxy
│   ├── tailwind.config.js        # Tailwind CSS theme configuration
│   └── src/
│       ├── App.jsx               # Application shell & navigation
│       ├── context/
│       │   └── AuthContext.jsx   # RBAC state & role switcher
│       ├── services/
│       │   ├── api.js            # Axios client with JWT interceptor
│       │   └── firebaseClient.js # Direct Firebase client SDK configuration
│       ├── components/
│       │   ├── Navbar.jsx        # Navigation bar & role dropdown
│       │   ├── SalesCard.jsx     # Sales entry card with late warning
│       │   ├── ImportModal.jsx   # Modal with 4 import sources
│       │   ├── LateReasonModal.jsx # Mandatory delay justification dialog
│       │   ├── ManualEntryModal.jsx# Manual sales entry form
│       │   └── RbacRestrictedNotice.jsx # 403 Forbidden RBAC notice
│       └── screens/
│           ├── CenetScreen.jsx   # Restaurant & Lounge screen
│           ├── LoopScreen.jsx    # Butchery & Liquor screen
│           └── LogReportScreen.jsx # Audit trail & compliance screen
├── package.json                  # Root npm scripts
└── README.md                     # Documentation
```
