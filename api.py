from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import uvicorn
from pathlib import Path
import tempfile
import os
import uuid
import sqlite3
import secrets
from datetime import datetime
from khata_ocr import build_llm, extract_khata
from dotenv import load_dotenv
from authlib.integrations.starlette_client import OAuth

load_dotenv() # Load from .env

app = FastAPI(title="KhataLens API")

# Session middleware (required for OAuth state)
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", secrets.token_hex(32)),
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Google OAuth Setup ---
oauth = OAuth()
google_client_id = os.getenv("GOOGLE_CLIENT_ID")
google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

# Determine redirect URI based on environment
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"

if google_client_id and google_client_secret:
    oauth.register(
        name="google",
        client_id=google_client_id,
        client_secret=google_client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )


# --- Database Setup ---
DATABASE_URL = os.getenv("DATABASE_URL")
USE_POSTGRES = bool(DATABASE_URL)

if USE_POSTGRES:
    import psycopg2
    from psycopg2.extras import RealDictCursor

def _adapt_sql(sql):
    if USE_POSTGRES:
        return sql.replace("?", "%s")
    return sql

class DBConnection:
    def __init__(self, conn):
        self._conn = conn

    def execute(self, sql, params=None):
        sql = _adapt_sql(sql)
        if USE_POSTGRES:
            cur = self._conn.cursor()
            cur.execute(sql, params or ())
            return cur
        else:
            if params:
                return self._conn.execute(sql, params)
            return self._conn.execute(sql)

    def cursor(self):
        return self._conn.cursor()

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._conn.close()

def get_db():
    if USE_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        conn.cursor_factory = RealDictCursor
        return DBConnection(conn)
    else:
        conn = sqlite3.connect("khata.db")
        conn.row_factory = sqlite3.Row
        return DBConnection(conn)

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    if USE_POSTGRES:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE,
                balance REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
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
    else:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE,
                balance REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
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

# Initialize the LLM once (using OpenRouter for both OCR and chat)
api_key = os.environ.get("OPENROUTER_API_KEY")

if not api_key:
    print("WARNING: OPENROUTER_API_KEY is not set.")
    llm = None
else:
    llm = build_llm(api_key)

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "postgres" if USE_POSTGRES else "sqlite"}

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
    total_balance = conn.execute("SELECT COALESCE(SUM(balance), 0) AS val FROM customers").fetchone()
    total_balance = total_balance["val"] if USE_POSTGRES else total_balance[0]
    active_customers = conn.execute("SELECT COUNT(*) AS val FROM customers").fetchone()
    active_customers = active_customers["val"] if USE_POSTGRES else active_customers[0]
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
            cursor.execute(_adapt_sql("SELECT id, balance FROM customers WHERE phone = ?"), (phone,))
            existing = cursor.fetchone()
            
            if existing:
                customer_id = existing["id"]
                new_balance = existing["balance"] + amount
                cursor.execute(_adapt_sql("UPDATE customers SET balance = ? WHERE id = ?"), (new_balance, customer_id))
            else:
                customer_id = str(uuid.uuid4())
                cursor.execute(_adapt_sql("INSERT INTO customers (id, name, phone, balance) VALUES (?, ?, ?, ?)"),
                             (customer_id, name, phone, amount))
            
            # Add transaction
            cursor.execute(_adapt_sql("INSERT INTO transactions (id, customer_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)"),
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
    txs = conn.execute(_adapt_sql("SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC"), (customer_id,)).fetchall()
    conn.close()
    return [dict(t) for t in txs]

@app.post("/api/payment")
async def record_payment(data: dict):
    """Record a payment from a customer, reducing their balance."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        customer_id = data.get("customer_id")
        amount = float(data.get("amount", 0))
        note = data.get("note", "Payment received")
        
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Payment amount must be greater than 0")
        
        # Get current balance
        customer = cursor.execute(_adapt_sql("SELECT id, name, balance FROM customers WHERE id = ?"), (customer_id,)).fetchone()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        current_balance = customer["balance"]
        new_balance = max(0, current_balance - amount)  # Never go below 0
        actual_paid = current_balance - new_balance      # Actual deducted (cap at balance)
        
        # Update balance
        cursor.execute(_adapt_sql("UPDATE customers SET balance = ? WHERE id = ?"), (new_balance, customer_id))
        
        # Log the payment transaction
        cursor.execute(
            _adapt_sql("INSERT INTO transactions (id, customer_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)"),
            (str(uuid.uuid4()), customer_id, "payment", actual_paid, note, datetime.now().isoformat())
        )
        
        conn.commit()
        return {
            "status": "success",
            "customer_id": customer_id,
            "paid": actual_paid,
            "previous_balance": current_balance,
            "new_balance": new_balance
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.put("/api/customers/{customer_id}")
async def update_customer(customer_id: str, data: dict):
    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM customers WHERE id = ?", (customer_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        name = data.get("name")
        phone = data.get("phone")
        balance = data.get("balance")
        
        updates = []
        values = []
        if name is not None:
            updates.append(_adapt_sql("name = ?"))
            values.append(name)
        if phone is not None:
            updates.append(_adapt_sql("phone = ?"))
            values.append(phone)
        if balance is not None:
            updates.append(_adapt_sql("balance = ?"))
            values.append(float(balance))
        
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(customer_id)
        conn.execute(_adapt_sql(f"UPDATE customers SET {', '.join(updates)} WHERE id = ?"), values)
        conn.commit()
        
        updated = conn.execute(_adapt_sql("SELECT * FROM customers WHERE id = ?"), (customer_id,)).fetchone()
        return dict(updated)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/analytics")
def get_analytics():
    conn = get_db()
    try:
        # Total open balance (sum of what customers still owe)
        row = conn.execute("SELECT COALESCE(SUM(balance), 0) AS val FROM customers").fetchone()
        open_balance = row["val"] if USE_POSTGRES else row[0]

        # Total ever imported (sum of all credit transactions = total amount given on credit)
        row = conn.execute("SELECT COALESCE(SUM(amount), 0) AS val FROM transactions WHERE type = 'credit'").fetchone()
        total_credit = row["val"] if USE_POSTGRES else row[0]

        # Total recovered = total credit - open balance
        total_recovered = total_credit - open_balance

        # Customer count
        row = conn.execute("SELECT COUNT(*) AS val FROM customers").fetchone()
        customer_count = row["val"] if USE_POSTGRES else row[0]

        # Customers with balance > 0 (overdue/pending)
        row = conn.execute("SELECT COUNT(*) AS val FROM customers WHERE balance > 0").fetchone()
        pending_count = row["val"] if USE_POSTGRES else row[0]
        
        # Customers with balance = 0 (fully paid)
        paid_count = customer_count - pending_count
        
        # Monthly data: group transactions by month
        if USE_POSTGRES:
            monthly_rows = conn.execute("""
                SELECT
                    to_char(date, 'YYYY-MM') as month_key,
                    to_char(date, 'Mon') as month_label,
                    SUM(amount) as total
                FROM transactions
                WHERE type = 'credit'
                GROUP BY month_key, month_label
                ORDER BY month_key ASC
                LIMIT 6
            """).fetchall()
        else:
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
        existing = conn.execute(_adapt_sql("SELECT id FROM customers WHERE id = ?"), (customer_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Delete transactions first (foreign key), then customer
        conn.execute(_adapt_sql("DELETE FROM transactions WHERE customer_id = ?"), (customer_id,))
        conn.execute(_adapt_sql("DELETE FROM customers WHERE id = ?"), (customer_id,))
        conn.commit()
        return {"status": "success", "message": "Customer deleted"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

import requests

# --- Google Auth Endpoints ---

@app.get("/api/auth/google")
async def auth_google(request: Request):
    """Redirects user to Google's OAuth consent screen."""
    if not google_client_id:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    redirect_uri = GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/api/auth/google/callback")
async def auth_google_callback(request: Request):
    """Handles the OAuth callback from Google. Stores user in session and DB."""
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    if not user_info:
        # Fallback: fetch user info from token
        resp = await oauth.google.get("https://www.googleapis.com/oauth2/v1/userinfo", token=token)
        user_info = resp.json()

    # Store user in session
    request.session["user"] = {
        "id": user_info["sub"],
        "name": user_info.get("name", ""),
        "email": user_info.get("email", ""),
        "avatar": user_info.get("picture", ""),
    }

    # Redirect to frontend
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8080")
    return RedirectResponse(url=f"{frontend_url}/customer")

@app.get("/api/auth/me")
async def auth_me(request: Request):
    """Returns the current logged-in user from session."""
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@app.post("/api/auth/logout")
async def auth_logout(request: Request):
    """Logs out the current user."""
    request.session.clear()
    return {"status": "ok"}

@app.post("/api/chat")
def chat_bot(data: dict):
    user_message = data.get("userMessage", "")
    history = data.get("messages", [])
    
    try:
        # Build RAG Context by calling our existing analytics function
        stats = get_analytics()
        
        # Get top 10 customers to provide detailed context
        conn = get_db()
        customers = conn.execute("SELECT name, phone, balance FROM customers ORDER BY balance DESC LIMIT 15").fetchall()
        conn.close()
        
        cust_list = "\n".join([f"- {c['name']} (Phone: {c['phone']}): Rs. {c['balance']}" for c in customers])
        
        context_str = f"""
        Total Customers: {stats['customerCount']}
        Total Pending Recovery: Rs. {stats['openBalance']}
        Paid Off Customers: {stats['paidCount']}
        
        Customer Balances (Top 15 Debtors):
        {cust_list}
        """
        
        # Prepare messages for OpenRouter
        messages = [
            {
                "role": "system",
                "content": f"""You are KhataLens AI, a specialized financial assistant for shopkeepers in Pakistan.
You help them manage their digital ledger (Khata).

CONTEXT DATA FROM DATABASE:
{context_str}

INSTRUCTIONS:
- Answer questions based ONLY on the provided CONTEXT DATA.
- If asked about a customer's balance, look at the Customer Balances list. If they are not in the list, politely say you don't have their specific record right now.
- If asked to draft a payment reminder, provide it in both English and polite Roman Urdu.
- Be concise, helpful, and professional."""
            }
        ]
        
        # Append history
        for msg in history:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            
        # Append the new user message
        messages.append({"role": "user", "content": user_message})
        
        # Call OpenRouter API
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
            
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "stealth/ox-alpha",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 800
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            reply = result["choices"][0]["message"]["content"]
            return {"reply": reply}
        else:
            raise HTTPException(status_code=500, detail=f"AI API Error: {response.text}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Serve Frontend (Production) ---
DIST_DIR = Path(__file__).parent / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("api:app", host="0.0.0.0", port=port, reload=False)
