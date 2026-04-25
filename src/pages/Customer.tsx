import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Clock, Phone, Search, TrendingUp, Users, Trash2, AlertTriangle, Banknote, X } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  last_activity: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export default function Customer() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({ totalBalance: 0, activeCustomers: 0 });
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Record<string, Transaction[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  // Payment form state
  const [paymentCustomerId, setPaymentCustomerId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.map((c: any) => ({ ...c, last_activity: c.created_at || new Date().toISOString() })));
    } catch (error) {
      toast.error("Failed to load customers from local database");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerId: string) => {
    if (customerTransactions[customerId]) return;
    try {
      const res = await fetch(`http://localhost:8000/api/transactions/${customerId}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setCustomerTransactions(prev => ({ ...prev, [customerId]: data || [] }));
    } catch (error) {
      toast.error("Failed to load transaction history");
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    setDeletingId(customerId);
    try {
      const res = await fetch(`http://localhost:8000/api/customers/${customerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete customer");
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (expandedCustomerId === customerId) setExpandedCustomerId(null);
      toast.success("Customer deleted successfully");
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch("http://localhost:8000/api/customers/all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete all customers");
      setCustomers([]);
      setCustomerTransactions({});
      setExpandedCustomerId(null);
      setStats({ totalBalance: 0, activeCustomers: 0 });
      toast.success("All customers deleted successfully");
    } catch (error) {
      toast.error("Failed to delete all customers");
    } finally {
      setDeletingAll(false);
      setShowDeleteAll(false);
    }
  };

  const handleRecordPayment = async (customerId: string) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    setSubmittingPayment(true);
    try {
      const res = await fetch("http://localhost:8000/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          amount,
          note: paymentNote.trim() || "Payment received"
        })
      });
      if (!res.ok) throw new Error("Failed to record payment");
      const result = await res.json();
      // Update customer balance in state
      setCustomers(prev => prev.map(c =>
        c.id === customerId ? { ...c, balance: result.new_balance } : c
      ));
      // Refresh transactions for this customer
      setCustomerTransactions(prev => { const copy = { ...prev }; delete copy[customerId]; return copy; });
      await fetchCustomerTransactions(customerId);
      fetchStats();
      toast.success(`Payment of Rs. ${result.paid.toLocaleString()} recorded. New balance: Rs. ${result.new_balance.toLocaleString()}`);
      setPaymentCustomerId(null);
      setPaymentAmount("");
      setPaymentNote("");
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const toggleExpand = async (customerId: string) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
      setPaymentCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
      await fetchCustomerTransactions(customerId);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch { return dateString; }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  const confirmDeleteCustomer = customers.find(c => c.id === confirmDeleteId);

  return (
    <DashboardShell
      title="Customers"
      subtitle="View all customers, balances, and transaction history."
      actions={
        <Link to="/import-sheet" className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium text-ink hover:border-primary/30 hover:text-primary">
          <ArrowRight className="size-4" />
          Import sheet
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[28px] border border-border bg-background p-5 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">Active customers</span>
              <Users className="size-5 text-primary" />
            </div>
            <div className="mt-4 font-display text-3xl text-ink">{stats.activeCustomers}</div>
          </div>
          <div className="rounded-[28px] border border-border bg-background p-5 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">Total pending</span>
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div className="mt-4 font-display text-3xl text-ink">Rs. {stats.totalBalance.toLocaleString()}</div>
          </div>
          <div className="rounded-[28px] border border-border bg-background p-5 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">Last updated</span>
              <Clock className="size-5 text-primary" />
            </div>
            <div className="mt-4 font-display text-3xl text-ink">Just now</div>
          </div>
        </div>

        {/* Customer List */}
        <div className="rounded-[30px] border border-border bg-background shadow-lg shadow-primary/5">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Customer ledger</div>
              <h2 className="mt-1 font-display text-2xl text-ink">All Customers</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
                <Search className="size-4" />
                <input
                  type="text"
                  placeholder="Search by name or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none w-40"
                />
              </div>
              {customers.length > 0 && (
                <button
                  onClick={() => setShowDeleteAll(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-300/50 bg-red-50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                  Delete All
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-ink-soft">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-5 py-12 text-center text-ink-soft">
              {searchQuery ? "No customers found matching your search" : "No customers yet. Import a khata sheet to get started."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <div key={customer.id}>
                  <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto] sm:items-center">
                    {/* Name & Phone — clickable to expand */}
                    <div className="cursor-pointer" onClick={() => toggleExpand(customer.id)}>
                      <div className="font-semibold text-ink">{customer.name}</div>
                      <div className="flex items-center gap-1.5 text-sm text-ink-soft mt-1">
                        <Phone className="size-3" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-ink-soft sm:text-right cursor-pointer" onClick={() => toggleExpand(customer.id)}>
                      Rs. {customer.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-ink-soft sm:text-right cursor-pointer" onClick={() => toggleExpand(customer.id)}>
                      {formatDate(customer.last_activity)}
                    </div>

                    {/* Expand toggle */}
                    <div className="flex justify-end cursor-pointer" onClick={() => toggleExpand(customer.id)}>
                      {expandedCustomerId === customer.id
                        ? <ChevronUp className="size-5 text-primary" />
                        : <ChevronDown className="size-5 text-ink-soft" />}
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end">
                      {confirmDeleteId === customer.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={deletingId === customer.id}
                            className="h-7 px-2.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {deletingId === customer.id ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-7 px-2.5 rounded-full border border-border text-xs font-semibold text-ink-soft hover:bg-surface/50 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(customer.id)}
                          className="flex size-8 items-center justify-center rounded-full border border-transparent text-ink-soft hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Delete customer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {expandedCustomerId === customer.id && (
                    <div className="bg-surface/20 px-5 py-4 border-t border-border space-y-4">

                      {/* Record Payment */}
                      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <Banknote className="size-4" />
                            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Record Payment</span>
                          </div>
                          {paymentCustomerId === customer.id && (
                            <button onClick={() => { setPaymentCustomerId(null); setPaymentAmount(""); setPaymentNote(""); }} className="text-ink-soft hover:text-ink">
                              <X className="size-4" />
                            </button>
                          )}
                        </div>

                        {paymentCustomerId === customer.id ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">Rs.</span>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Amount paid"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  className="w-full rounded-xl border border-green-300 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:border-green-500"
                                  autoFocus
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Note (optional)"
                                value={paymentNote}
                                onChange={(e) => setPaymentNote(e.target.value)}
                                className="flex-1 rounded-xl border border-green-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRecordPayment(customer.id)}
                                disabled={submittingPayment || !paymentAmount}
                                className="flex-1 h-9 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {submittingPayment ? "Saving..." : "✓ Confirm Payment"}
                              </button>
                              <button
                                onClick={() => { setPaymentCustomerId(null); setPaymentAmount(""); setPaymentNote(""); }}
                                className="h-9 px-4 rounded-xl border border-green-300 text-sm text-green-700 hover:bg-green-100 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                            <p className="text-xs text-green-700/70">
                              Current khata: <strong>Rs. {customer.balance.toLocaleString()}</strong>
                              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                                <> → After payment: <strong>Rs. {Math.max(0, customer.balance - parseFloat(paymentAmount)).toLocaleString()}</strong></>
                              )}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setPaymentCustomerId(customer.id); setPaymentAmount(""); setPaymentNote(""); }}
                            disabled={customer.balance === 0}
                            className="w-full h-9 rounded-xl border border-green-300 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {customer.balance === 0 ? "✓ Fully Paid" : "+ Record Payment Received"}
                          </button>
                        )}
                      </div>

                      {/* Transaction History */}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">Transaction History</div>
                        {customerTransactions[customer.id]?.length === 0 ? (
                          <div className="text-sm text-ink-soft py-2">No transactions yet</div>
                        ) : (
                          <div className="space-y-2">
                            {customerTransactions[customer.id]?.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border">
                                <div className="flex items-center gap-2 flex-1">
                                  <span className={`size-2 rounded-full shrink-0 ${tx.type === 'credit' ? 'bg-red-400' : 'bg-green-500'}`} />
                                  <div>
                                    <div className="text-sm font-medium text-ink">{tx.description}</div>
                                    <div className="text-xs text-ink-soft mt-0.5">{formatDate(tx.date)}</div>
                                  </div>
                                </div>
                                <div className={`text-sm font-semibold whitespace-nowrap ${tx.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                                  {tx.type === 'credit' ? '+ Khata' : '− Paid'} Rs. {tx.amount.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAll} onOpenChange={setShowDeleteAll}>
        <AlertDialogContent className="max-w-md rounded-2xl border border-red-200 bg-background p-0 shadow-2xl">
          <div className="border-b border-red-100 px-7 py-6">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="size-5 text-red-600" />
                </div>
                <AlertDialogTitle className="font-display text-2xl text-ink">Delete All Customers?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-relaxed text-ink-soft">
                This will permanently delete <strong className="text-ink">{customers.length} customer{customers.length !== 1 ? 's' : ''}</strong> and all their transaction history. This action <strong className="text-red-600">cannot be undone</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="px-7 py-5 gap-3">
            <AlertDialogCancel className="h-10 rounded-full border border-border px-5 text-sm font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="h-10 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deletingAll ? "Deleting..." : "Yes, Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
