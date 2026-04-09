# Local Service Provider Platform

A powerful, full-stack, role-based platform designed to instantly connect local service professionals with customers. It features comprehensive booking management, dynamic PDF receipt generation, and real-time visualization of provider performance analytics!

---

## 🚀 Key Features

* **Dual Role Architecture:** Completely isolated Dashboards and routing flows for standard **Customers** vs structural **Service Providers**.
* **Live Booking Lifecycle:** A formalized workflow pipeline tracking jobs from `Requested` ➔ `Accepted` ➔ `In Progress` ➔ `Completion Requested` ➔ `Completed`.
* **Dynamic PDF Receipts:** Automatically triggers dynamic `.pdf` downloads natively on the client device documenting financial and service completion data using backend `pdfkit` formatting upon job completion!
* **Provider Analytics Dashboard:** A visually stunning Data Dashboard tracking real-time Booking proportions, timeline frequencies, and total tracked Earnings leveraging customizable `recharts` layouts.
* **Portfolio & Availability Management:** Full CRUD handling for Providers to dictate their geographical operational bounds, image portfolios (Cloudinary-backed), and explicit Weekly scheduling nodes!
* **Global Authentication:** Fully protected REST API structure natively locked behind JSON Web Tokens (`jsonwebtoken`) mapped centrally across generic React Contexts.

---

## 🛠️ Technology Stack

**Frontend Framework:**
- React (Vite environment)
- Tailwind CSS (Utility styling / animations)
- Recharts (SVG metric charting)
- React Router DOM
- Lucide React (Icons)
- Axios

**Backend Framework:**
- Node.js & Express.js
- MongoDB & Mongoose (Object mapping)
- PDFKit (Serverside PDF piping)
- Bcrypt.js (Password cryptography)
- JSON Web Tokens (JWT)
- Multer & Cloudinary (File handling integrations)

---

## 📥 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/omraul2911/LocalServiceProvider.git
   cd LocalServiceProvider
   ```

2. **Backend Configuration:**
   From the exact root, open a terminal instance moving into the Node environment:
   ```bash
   cd backend
   npm install
   ```
   Create a local `.env` block inside `/backend` mimicking the core bindings:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/local_services_platform
   JWT_SECRET=your_super_secret_key
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
   *Boot the API manually:*
   ```bash
   npm start
   # or node server.js
   ```

3. **Frontend Configuration:**
   Open a separate shell branching into the React root:
   ```bash
   cd frontend
   npm install
   ```
   *Spin up the reactive Vite sandbox:*
   ```bash
   npm run dev
   ```

4. **Ready for connection!** Head over exclusively into `http://localhost:5173` mapped to your preferred local web client to witness the platform organically render!

---

## 🏗️ Architecture

- **/backend:** Express router definitions aggregating Models, authenticating routes via custom strictly typed Middleware mechanisms implicitly connecting Mongo schemas.
- **/frontend:** A tightly coupled React system isolating strict route boundaries protecting private views implicitly routing non-session-users securely!

