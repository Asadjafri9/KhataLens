# 🧾 KhataLens

**Digitizing the backbone of small businesses.**

KhataLens is a specialized AI-powered ledger management system designed for shopkeepers and small business owners. It bridges the gap between traditional handwritten "Khata" notebooks and modern digital accounting by using best-in-class AI to extract, track, and analyze financial data—all while keeping data private and local.

---

## ✨ Key Features

- **📸 AI-Powered OCR**: Snap a photo of your handwritten ledger. Our integrated Gemini AI model extracts names, amounts, and statuses with high precision.
- **💬 Smart RAG ChatBot**: A dedicated financial assistant powered by OpenRouter. Ask questions like *"Who owes me the most?"* or *"Draft a polite reminder for Ali"* in English or Roman Urdu.
- **📊 Real-time Analytics**: Track your recovery trends, portfolio health, and outstanding balances through a premium, interactive dashboard.
- **🔒 Local-First Privacy**: Your financial records are stored in a local SQLite database (`khata.db`), ensuring you own your data.
- **📱 Responsive Design**: A high-fidelity, mobile-friendly interface built with React, Tailwind CSS, and Framer Motion.
- **⚖️ Transaction History**: Detailed "invoice-style" statement views for every customer, tracking every credit and payment.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Python 3, FastAPI, Uvicorn.
- **Database**: SQLite (Local storage).
- **Authentication**: Supabase (Google Auth).
- **AI Models**: 
  - **Gemini 2.0 Flash**: OCR & Document Processing.
  - **OpenRouter (Gemini 2.0 Flash/Pro)**: RAG-based Chat Assistant.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python 3.9+
- A Google Gemini API Key
- An OpenRouter API Key
- A Supabase Project (for Auth)

### 2. Installation

**Clone the repository:**
```bash
git clone https://github.com/Asadjafri9/KhataLens.git
cd KhataLens
```

**Frontend Setup:**
```bash
npm install
```

**Backend Setup:**
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
# Supabase (Frontend)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini (OCR)
GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_API_KEY=your_google_api_key

# OpenRouter (ChatBot)
OPENROUTER_API_KEY=your_openrouter_key
```

### 4. Running the Project

**Start the Backend (Port 8000):**
```bash
python api.py
```

**Start the Frontend:**
```bash
npm run dev
```

---

## 📁 Project Structure

```text
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Main application views (Dashboard, Customer, Analytics)
│   ├── lib/           # Supabase client and utilities
│   └── contexts/      # Auth context
├── api.py             # FastAPI backend logic
├── khata_ocr.py       # AI OCR processing script
├── khata.db           # Local SQLite database
└── requirements.txt   # Python dependencies
```

---

## 🛡️ License
This project is for demonstration and private business use.
