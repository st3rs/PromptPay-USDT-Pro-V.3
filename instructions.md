# Project Instructions: PromptPay USDT Pro 💱

This file contains project-specific rules, coding styles, and domain knowledge to guide the AI assistant in maintaining and expanding the application.

## 🎨 Coding Style & UI
- **Framework**: React 18 with Vite.
- **Styling**: Tailwind CSS (mobile-first).
- **Components**: Use custom UI components from `@/src/components/ui/`.
- **Icons**: Use `lucide-react` only.
- **Animations**: Use `motion` from `motion/react`.
- **Validation**: Use `zod` for schema validation and `react-hook-form` for forms.
- **State Management**: Use React Context for global states (Auth, I18n).

## 🧠 Domain Knowledge
- **Core Business**: A platform for buying USDT with Thai Baht (THB).
- **Payment Flow**:
  1. User creates an order (THB amount, network, wallet address).
  2. User pays via PromptPay or Bank Transfer (details in Admin Settings).
  3. User uploads a payment slip.
  4. Admin reviews the slip and approves the payment.
  5. Admin sends USDT and provides a transaction hash (TxID).
  6. Order is marked as "Completed".
- **Exchange Rates**: Live rates are synced from **Bitkub API** (`USDT/THB`).
- **Fee Calculation**:
  - `Service Fee`: A percentage of the THB amount (configured in Admin Settings).
  - `Network Fee`: A fixed USDT amount based on the network (TRC20, ERC20, BEP20).
  - `Final USDT` = `(THB Amount - Service Fee) / Rate - Network Fee`.

## 🤖 Model & API Usage
- **Primary Model**: Use `gemini-3-flash-preview` for general tasks.
- **Complex Reasoning**: Use `gemini-3.1-pro-preview` for complex logic or debugging.
- **API Key**: Always use `process.env.GEMINI_API_KEY` for GenAI tasks.
- **Backend**: Express.js server on port 3000. Use Prisma for database operations.

## 🔒 Security & Best Practices
- **Admin Access**: Protect admin routes with `authenticate` and `isAdmin` middleware.
- **Data Integrity**: Always validate order status transitions (e.g., don't allow "Completed" without a TxID).
- **Audit Trail**: Log all administrative actions (status changes, note updates) in the `AdminAction` table.
- **Error Handling**: Use the `handleFirestoreError` pattern if using Firebase (though this project currently uses Prisma/SQLite).
