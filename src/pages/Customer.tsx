import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Clock, Phone, Search, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";
import { toast } from "sonner";

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
      
      // The local API returns customers with balance. 
      // We'll treat created_at or latest transaction date as activity if needed.
      const processedCustomers = data.map((c: any) => ({
        ...c,
        last_activity: c.created_at || new Date().toISOString()
      }));

      setCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
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

      setCustomerTransactions(prev => ({
        ...prev,
        [customerId]: data || []
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    }
  };

  const toggleExpand = async (customerId: string) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
      await fetchCustomerTransactions(customerId);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as is if not a valid date string
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

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
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-ink-soft">
              <Search className="size-4" />
              <input
                type="text"
                placeholder="Search by name or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-48"
              />
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
                  <div 
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.5fr] sm:items-center cursor-pointer hover:bg-surface/30 transition-colors"
                    onClick={() => toggleExpand(customer.id)}
                  >
                    <div>
                      <div className="font-semibold text-ink">{customer.name}</div>
                      <div className="flex items-center gap-1.5 text-sm text-ink-soft mt-1">
                        <Phone className="size-3" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-ink-soft sm:text-right">
                      Rs. {customer.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-ink-soft sm:text-right">
                      {formatDate(customer.last_activity)}
                    </div>
                    <div className="flex justify-end">
                      {expandedCustomerId === customer.id ? (
                        <ChevronUp className="size-5 text-primary" />
                      ) : (
                        <ChevronDown className="size-5 text-ink-soft" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Transaction History */}
                  {expandedCustomerId === customer.id && (
                    <div className="bg-surface/20 px-5 py-4 border-t border-border">
                      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">
                        Transaction History
                      </div>
                      {customerTransactions[customer.id]?.length === 0 ? (
                        <div className="text-sm text-ink-soft py-4">No transactions yet</div>
                      ) : (
                        <div className="space-y-2">
                          {customerTransactions[customer.id]?.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-ink">{tx.description}</div>
                                <div className="text-xs text-ink-soft mt-0.5">{formatDate(tx.date)}</div>
                              </div>
                              <div className={`text-sm font-semibold ${tx.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                                {tx.type === 'credit' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
