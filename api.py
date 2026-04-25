from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path
import tempfile
import os
import uuid
import sqlite3
from datetime import datetime
from khata_ocr import build_llm, extract_khata
from dotenv import load_dotenv

load_dotenv() # Load from .env

app = FastAPI(title="KhataLens API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
DB_PATH = "khata.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Customers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT UNIQUE,
            balance REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers (id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# Initialize the LLM once
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    # Fallback to VITE_GOOGLE_API_KEY if exists
    api_key = os.environ.get("VITE_GOOGLE_API_KEY")

if not api_key:
    print("WARNING: GOOGLE_API_KEY is not set.")
    llm = None
else:
    llm = build_llm(api_key)

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "sqlite"}

# --- OCR Endpoints ---

@app.post("/api/extract")
def extract_api(file: UploadFile = File(...)):
    if not llm:
        raise HTTPException(status_code=500, detail="LLM not initialized. Check API key.")
        
    temp_dir = Path(tempfile.gettempdir()) / "khatalens"
    temp_dir.mkdir(exist_ok=True)
    temp_path = temp_dir / f"{uuid.uuid4().hex}_{file.filename}"
    
    try:
        content = file.file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        page = extract_khata(temp_path, llm)
        return page.model_dump()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path.exists():
            temp_path.unlink()

# --- Ledger Endpoints ---

@app.get("/api/customers")
def get_customers():
    conn = get_db()
    customers = conn.execute("SELECT * FROM customers ORDER BY balance DESC").fetchall()
    conn.close()
    return [dict(c) for c in customers]

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    total_balance = conn.execute("SELECT SUM(balance) FROM customers").fetchone()[0] or 0
    active_customers = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0] or 0
    conn.close()
    return {
        "totalBalance": total_balance,
        "activeCustomers": active_customers
    }

@app.post("/api/import")
async def import_entries(data: dict):
    # data: { entries: [{name, phone, amount}], date: string }
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        entries = data.get("entries", [])
        import_date = data.get("date") or datetime.now().isoformat()
        
        for entry in entries:
            name = entry.get("name")
            phone = entry.get("phone")
            amount = float(entry.get("amount", 0))
            
            # Check if customer exists by name and phone
            cursor.execute("SELECT id, balance FROM customers WHERE phone = ?", (phone,))
            existing = cursor.fetchone()
            
            if existing:
                customer_id = existing["id"]
                new_balance = existing["balance"] + amount
                cursor.execute("UPDATE customers SET balance = ? WHERE id = ?", (new_balance, customer_id))
            else:
                customer_id = str(uuid.uuid4())
                cursor.execute("INSERT INTO customers (id, name, phone, balance) VALUES (?, ?, ?, ?)",
                             (customer_id, name, phone, amount))
            
            # Add transaction
            cursor.execute("INSERT INTO transactions (id, customer_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)",
                         (str(uuid.uuid4()), customer_id, "credit", amount, "Imported via OCR", import_date))
        
        conn.commit()
        return {"status": "success", "imported": len(entries)}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/transactions/{customer_id}")
def get_transactions(customer_id: str):
    conn = get_db()
    txs = conn.execute("SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC", (customer_id,)).fetchall()
    conn.close()
    return [dict(t) for t in txs]

@app.get("/api/analytics")
def get_analytics():
    conn = get_db()
    try:
        # Total open balance (sum of what customers still owe)
        open_balance = conn.execute("SELECT COALESCE(SUM(balance), 0) FROM customers").fetchone()[0]
        
        # Total ever imported (sum of all credit transactions = total amount given on credit)
        total_credit = conn.execute("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'credit'").fetchone()[0]
        
        # Total recovered = total credit - open balance
        total_recovered = total_credit - open_balance
        
        # Customer count
        customer_count = conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0]
        
        # Customers with balance > 0 (overdue/pending)
        pending_count = conn.execute("SELECT COUNT(*) FROM customers WHERE balance > 0").fetchone()[0]
        
        # Customers with balance = 0 (fully paid)
        paid_count = customer_count - pending_count
        
        # Monthly data: group transactions by month
        monthly_rows = conn.execute("""
            SELECT 
                strftime('%Y-%m', date) as month_key,
                strftime('%b', date) as month_label,
                SUM(amount) as total
            FROM transactions
            WHERE type = 'credit'
            GROUP BY month_key
            ORDER BY month_key ASC
            LIMIT 6
        """).fetchall()
        
        monthly_data = []
        for row in monthly_rows:
            monthly_data.append({
                "month": row["month_label"],
                "imported": round(row["total"], 2)
            })

        return {
            "openBalance": round(open_balance, 2),
            "totalCredit": round(total_credit, 2),
            "totalRecovered": round(max(total_recovered, 0), 2),
            "customerCount": customer_count,
            "pendingCount": pending_count,
            "paidCount": paid_count,
            "monthlyData": monthly_data,
            "statusBreakdown": [
                {"label": "Paid Off", "value": paid_count},
                {"label": "Pending", "value": pending_count},
            ]
        }
    finally:
        conn.close()

@app.delete("/api/customers/all")
def delete_all_customers():
    conn = get_db()
    try:
        conn.execute("DELETE FROM transactions")
        conn.execute("DELETE FROM customers")
        conn.commit()
        return {"status": "success", "message": "All customers and transactions deleted"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: str):
    conn = get_db()
    try:
        # Check customer exists
        existing = conn.execute("SELECT id FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Delete transactions first (foreign key), then customer
        conn.execute("DELETE FROM transactions WHERE customer_id = ?", (customer_id,))
        conn.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
        conn.commit()
        return {"status": "success", "message": "Customer deleted"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
