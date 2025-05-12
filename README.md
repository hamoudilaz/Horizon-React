# **Horizon – The Interactive Dashboard for My Trading Bot**

I'm nearing the final stage of Phase 1. This repo includes both the frontend and backend with fully functional logic, automatic error handling, and fallback options for reliability.

Built with **React + Vite** and wired to Solana for real-time execution and wallet tracking.

---

## ✅ Key Features

* **Copy trading support** with sub-100ms execution and next-block performance
* **Standard & Turbo modes** – choose between safe or aggressive execution
* **User-friendly dashboard** with saved preferences and instant feedback
* **Live wallet stats** – see total balance in USD, SOL, and wSOL
* **Auto-refreshing** with WebSocket updates across the whole app

---

## 🚀 Getting Started

```bash
git clone https://github.com/hamoudilaz/Horizon-React.git
cd Horizon-React
code .
```

Install dependencies:

```bash
npm install        # for frontend

cd ../server
npm install        # for backend
```

Start backend:

```bash
npm start
```

Start frontend:

```bash
npm run dev
```

---

## 🔮 What’s Coming

* Full trade execution from UI
* Gas tuning & optimization
* Advanced trade history and analytics
* Live deployment (not just localhost)

---

## 🛠 Tech Stack

* **Frontend:** React + Vite
* **Backend:** Fastify
* **Blockchain:** Solana / web3.js
* **Live updates:** WebSockets
* **Framework build**: Pre-built functions to make it easier.
