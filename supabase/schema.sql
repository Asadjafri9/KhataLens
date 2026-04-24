-- KhataLens Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. SHOPKEEPERS (auto-populated on first login)
-- ============================================
CREATE TABLE shopkeepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  shop_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. CUSTOMERS belonging to a shopkeeper
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopkeeper_id UUID NOT NULL REFERENCES shopkeepers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  balance NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TRANSACTIONS / activity log
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shopkeeper_id UUID NOT NULL REFERENCES shopkeepers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'payment')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. INDEXES for performance
-- ============================================
CREATE INDEX idx_customers_shopkeeper ON customers(shopkeeper_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_shopkeeper ON transactions(shopkeeper_id);

-- ============================================
-- 5. ROW LEVEL SECURITY (multi-tenant isolation)
-- ============================================
ALTER TABLE shopkeepers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Shopkeepers can only see their own row
CREATE POLICY "shopkeepers_own" ON shopkeepers
  FOR ALL USING (auth_id = auth.uid());

-- Customers scoped to shopkeeper
CREATE POLICY "customers_own" ON customers
  FOR ALL USING (shopkeeper_id IN (
    SELECT id FROM shopkeepers WHERE auth_id = auth.uid()
  ));

-- Transactions scoped to shopkeeper
CREATE POLICY "transactions_own" ON transactions
  FOR ALL USING (shopkeeper_id IN (
    SELECT id FROM shopkeepers WHERE auth_id = auth.uid()
  ));

-- ============================================
-- 6. ENABLE pgvector (for future AI chatbot)
-- ============================================
-- Uncomment when ready to use vector embeddings:
-- CREATE EXTENSION IF NOT EXISTS vector;
