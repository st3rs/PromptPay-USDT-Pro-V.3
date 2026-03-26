import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { formatCurrency, formatNumber, formatDate, getStatusColor, cn } from "@/src/lib/utils";
import { Wallet, TrendingUp, Clock, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export function DashboardPage() {
  const { user, token } = useAuth();
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState<string>("1000");
  const [calculatedUsdt, setCalculatedUsdt] = useState<number>(0);

  useEffect(() => {
    if (exchangeRate?.rate) {
      const thb = parseFloat(amount) || 0;
      setCalculatedUsdt(thb / exchangeRate.rate);
    }
  }, [amount, exchangeRate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, rateRes] = await Promise.all([
          fetch("/api/user/stats", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/orders?limit=5", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/exchange-rate", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (ordersRes.ok) setRecentOrders(await ordersRes.json());
        if (rateRes.ok) setExchangeRate(await rateRes.json());
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-8">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-neutral-900 leading-tight">
            {t("dashboard.welcome")}, <span className="font-semibold">{user?.name}</span>
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">{t("dashboard.subtitle")}</p>
        </div>
        <Link to="/buy">
          <Button size="lg" className="rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white px-8 h-14 shadow-xl shadow-neutral-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
            <Wallet className="w-5 h-5 mr-2" />
            {t("common.buy")} USDT
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-[32px] border-none shadow-sm bg-white p-2">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Live Market
              </Badge>
            </div>
            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest mb-2">{t("dashboard.current_rate")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-light text-neutral-900 tracking-tighter">1 <span className="text-2xl text-neutral-400">USDT</span> = {exchangeRate?.rate || "35.50"}</h3>
              <span className="text-neutral-400 text-lg font-medium">THB</span>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Source: {exchangeRate?.source || "Bitkub"}</span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                Updated: Just now
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-white p-2">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-neutral-900" />
              </div>
            </div>
            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest mb-2">{t("dashboard.total_bought")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-light text-neutral-900 tracking-tighter">{formatNumber(stats?.totalUsdt || 0)}</h3>
              <span className="text-neutral-400 text-lg font-medium">USDT</span>
            </div>
            <p className="text-sm text-neutral-500 mt-4 font-medium bg-neutral-50 inline-block px-3 py-1 rounded-full">
              ≈ {formatCurrency(stats?.totalThb || 0)} THB
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-white p-2">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              {stats?.pendingCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Action Required
                </Badge>
              )}
            </div>
            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest mb-2">{t("dashboard.pending_orders")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-light text-neutral-900 tracking-tighter">{stats?.pendingCount || 0}</h3>
              <span className="text-neutral-400 text-lg font-medium">{t("dashboard.orders")}</span>
            </div>
            <p className={cn(
              "text-sm mt-4 font-medium inline-block px-3 py-1 rounded-full",
              stats?.pendingCount > 0 ? "bg-amber-50 text-amber-700" : "bg-neutral-50 text-neutral-500"
            )}>
              {stats?.pendingCount > 0 ? t("dashboard.awaiting_payment") : "All clear"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-6">
              <div>
                <CardTitle className="text-xl font-medium text-neutral-900">{t("dashboard.recent_orders")}</CardTitle>
                <CardDescription className="text-sm mt-1">{t("dashboard.recent_orders_desc")}</CardDescription>
              </div>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4">
                  {t("common.view_all")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-0 pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-neutral-400 uppercase tracking-widest border-y border-neutral-50 bg-neutral-50/30">
                    <tr>
                      <th className="px-8 py-4 font-bold">{t("orders.order_id")}</th>
                      <th className="px-8 py-4 font-bold">{t("orders.amount")}</th>
                      <th className="px-8 py-4 font-bold hidden sm:table-cell">{t("orders.usdt_amount")}</th>
                      <th className="px-8 py-4 font-bold">{t("orders.status")}</th>
                      <th className="px-8 py-4 font-bold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center">
                              <AlertCircle className="w-8 h-8 text-neutral-300" />
                            </div>
                            <p className="text-neutral-400 font-medium">{t("dashboard.no_orders")}</p>
                            <Link to="/buy">
                              <Button variant="outline" className="rounded-full border-neutral-200 text-neutral-600 text-sm hover:bg-neutral-50 px-6">Start your first purchase</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="group hover:bg-neutral-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-mono text-[11px] text-neutral-400 bg-neutral-50 px-2 py-1 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-medium text-neutral-900">{formatNumber(order.thbAmount)} THB</span>
                              <span className="text-[10px] text-blue-600 font-bold sm:hidden mt-0.5">
                                {formatNumber(order.usdtAmount)} USDT
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 hidden sm:table-cell">
                            <span className="font-medium text-neutral-600">{formatNumber(order.usdtAmount)} USDT</span>
                          </td>
                          <td className="px-8 py-5">
                            <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight border-none", getStatusColor(order.status))}>
                              {t(`orders.status_${order.status.toLowerCase()}`)}
                            </Badge>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Link to={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-2xl group-hover:bg-neutral-900 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                                <ArrowRight className="w-4 h-4" />
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

        {/* Quick Calculator */}
        <div className="space-y-8">
          <Card className="rounded-[32px] border-none shadow-xl shadow-blue-100/50 bg-white overflow-hidden p-2">
            <CardHeader className="px-6 pt-8 pb-4">
              <CardTitle className="text-xl font-medium flex items-center gap-2 text-neutral-900">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Calculator
              </CardTitle>
              <CardDescription className="text-neutral-500 text-sm">Real-time conversion estimate</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">You Pay (THB)</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-neutral-50 border-2 border-transparent rounded-[20px] px-6 py-5 text-2xl font-light text-neutral-900 focus:bg-white focus:border-blue-100 outline-none transition-all placeholder:text-neutral-300"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">THB</span>
                </div>
              </div>

              <div className="flex justify-center -my-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center border border-neutral-50">
                  <ArrowRight className="w-5 h-5 text-neutral-400 rotate-90" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">You Receive (USDT)</label>
                <div className="bg-blue-50/50 border border-blue-100 rounded-[20px] px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-light text-blue-600 tracking-tighter">{formatNumber(calculatedUsdt)}</span>
                    <span className="text-blue-600/60 font-bold text-sm">USDT</span>
                  </div>
                </div>
              </div>

              <Link to={`/buy?amount=${amount}`} className="block pt-4">
                <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-8 rounded-[20px] text-lg shadow-lg shadow-neutral-200 transition-all hover:-translate-y-0.5">
                  Buy Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm bg-white p-2">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-sm font-bold text-neutral-900">Support & Security</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 group hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-blue-600 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Verified Security</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">All transactions are audited.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 group hover:bg-blue-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:text-blue-600 transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">24/7 Support</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">We're here to help anytime.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
