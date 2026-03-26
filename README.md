# PromptPay USDT Pro 💱

A professional, full-stack web application for purchasing USDT with Thai Baht (THB) using local payment methods like PromptPay and Bank Transfers. Built with React, Vite, Tailwind CSS, Express, and Prisma.

## 🌟 Key Features

### For Users
- **Seamless USDT Purchasing**: Buy USDT via TRC20, ERC20, or BEP20 networks.
- **Local Payment Methods**: Support for PromptPay QR and direct Bank Transfers.
- **Real-Time Exchange Rates**: Live rates synced directly from Bitkub.
- **Order Tracking**: Track order status (Pending, Payment Uploaded, Under Review, Approved, USDT Sent, Completed).
- **Payment Slip Upload**: Securely upload payment proof for admin verification.
- **Multi-Language Support**: Fully internationalized (i18n) for English and Thai.

### For Administrators
- **Comprehensive Dashboard**: Overview of total sales, pending orders, and active users.
- **Order Management**: Review payment slips, approve payments, and mark USDT as sent.
- **Auto Rate Sync**: Automatically fetch and update the USDT/THB exchange rate from Bitkub every minute.
- **Dynamic Fee Settings**: Adjust service fee percentages and network withdrawal costs (TRC20, ERC20, BEP20) directly from the dashboard.
- **Bank Account Management**: Add, edit, or remove active bank accounts for receiving payments.
- **Audit Trails**: Track all administrative actions taken on orders.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, React Router, React Hook Form, Zod, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: Prisma ORM (SQLite by default, easily swappable to PostgreSQL/MySQL).
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs.
- **Email**: Nodemailer for order confirmations and status updates.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd promptpay-usdt-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Update the `.env` file with your specific configuration (JWT secret, SMTP details, Bitkub API keys, etc.).

### 4. Database Setup
Initialize the SQLite database and run the seed script to populate default admin accounts and settings:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Start the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🔐 Default Credentials

After running the seed script, you can log in with the following default accounts:

**Admin Account:**
- **Email**: `admin@example.com`
- **Password**: `admin123`

**Customer Account:**
- **Email**: `user@example.com`
- **Password**: `user123`

*(Note: Please change these passwords immediately in a production environment.)*

## ⚙️ Configuration Notes

- **Bitkub Auto Sync**: To enable automatic exchange rate syncing, ensure `BITKUB_AUTO_RATE_SYNC="true"` is set in your `.env` file or configured via the Admin Settings dashboard.
- **Email Notifications**: Update the `SMTP_*` variables in your `.env` file with a valid SMTP provider (e.g., SendGrid, Mailgun, AWS SES) to enable email notifications for order updates.
- **File Uploads**: Payment slips are saved to the local `./uploads` directory by default. For production, consider integrating a cloud storage provider like AWS S3 or Google Cloud Storage.

## 📄 License

This project is licensed under the MIT License.
