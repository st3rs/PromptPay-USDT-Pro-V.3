import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { formatCurrency, formatNumber, formatDate, getStatusColor, cn } from "@/src/lib/utils";
import { Search, Filter, ArrowRight, Download, MoreVertical, Eye, Plus } from "lucide-react";
import { CreateOrderModal } from "@/src/components/admin/CreateOrderModal";

export function AdminOrdersPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error("Failed to fetch admin orders", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const stats = {
    pending: orders.filter(o => ["PENDING", "AWAITING_PAYMENT"].includes(o.status)).length,
    review: orders.filter(o => ["PAYMENT_UPLOADED", "UNDER_REVIEW"].includes(o.status)).length,
    approved: orders.filter(o => o.status === "APPROVED").length,
    totalVolume: orders.filter(o => o.status === "COMPLETED").reduce((acc, o) => acc + o.amountTHB, 0),
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "ALL") return matchesSearch;
    if (activeTab === "PENDING") return matchesSearch && ["PENDING", "AWAITING_PAYMENT"].includes(o.status);
    if (activeTab === "REVIEW") return matchesSearch && ["PAYMENT_UPLOADED", "UNDER_REVIEW"].includes(o.status);
    if (activeTab === "ACTION_REQUIRED") return matchesSearch && ["APPROVED", "USDT_SENT"].includes(o.status);
    
    return matchesSearch && o.status === activeTab;
  });

  const tabs = [
    { id: "ALL", label: "All Orders" },
    { id: "PENDING", label: "Pending" },
    { id: "REVIEW", label: "Review" },
    { id: "ACTION_REQUIRED", label: "Action Required" },
    { id: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Admin: {t("common.orders")}</h1>
          <p className="text-neutral-500">Manage and review customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
          <Button variant="outline" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Awaiting Payment</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-black">{stats.pending}</h3>
              <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Needs Review</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-black">{stats.review}</h3>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">Review</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">To Send USDT</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-black">{stats.approved}</h3>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100">Action</Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-none">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Volume (Completed)</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalVolume)}</h3>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">THB</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateOrderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchOrders();
        }} 
      />

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input 
                  placeholder="Search by Order ID, Name or Email..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filter
                </Button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-100 overflow-x-auto scrollbar-hide whitespace-nowrap px-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px flex-shrink-0",
                    activeTab === tab.id 
                      ? "border-emerald-500 text-emerald-600" 
                      : "border-transparent text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px] md:min-w-full">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">USDT</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-black">{order.user.name}</span>
                          <span className="text-xs text-neutral-400 hidden sm:inline">{order.user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{formatCurrency(order.amountTHB)}</span>
                          <span className="text-xs text-emerald-600 font-medium sm:hidden">
                            {formatNumber(order.finalUSDT || order.estimatedUSDT)} USDT
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600 hidden sm:table-cell">
                        {formatNumber(order.finalUSDT || order.estimatedUSDT)} USDT
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("border text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1", getStatusColor(order.status))}>
                          {t(`orders.status_${order.status.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 hidden lg:table-cell">{formatDate(order.createdAt, locale)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-1">
                            <Eye className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Review</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
