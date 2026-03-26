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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">{t("dashboard.welcome")}, {user?.name}</h1>
          <p className="text-neutral-500">{t("dashboard.subtitle")}</p>
        </div>
        <Link to="/buy">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Wallet className="w-4 h-4 mr-2" />
            {t("common.buy")} USDT
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">{t("dashboard.current_rate")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">1 USDT = {exchangeRate?.rate || "35.50"}</h3>
              <span className="text-emerald-100 text-sm font-medium">THB</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-100">
              <span>Source: {exchangeRate?.source || "Bitkub"}</span>
              <span>Updated: Just now</span>
            </div>
          </CardContent>
          {/* Decorative element */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{t("dashboard.total_bought")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-neutral-900">{formatNumber(stats?.totalUsdt || 0)}</h3>
              <span className="text-neutral-400 text-sm font-medium">USDT</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">≈ {formatCurrency(stats?.totalThb || 0)} THB</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              {stats?.pendingCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase">
                  Action Required
                </Badge>
              )}
            </div>
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{t("dashboard.pending_orders")}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-neutral-900">{stats?.pendingCount || 0}</h3>
              <span className="text-neutral-400 text-sm font-medium">{t("dashboard.orders")}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              {stats?.pendingCount > 0 ? t("dashboard.awaiting_payment") : "All clear"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-50 pb-4">
              <div>
                <CardTitle className="text-lg">{t("dashboard.recent_orders")}</CardTitle>
                <CardDescription className="text-xs">{t("dashboard.recent_orders_desc")}</CardDescription>
              </div>
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                  {t("common.view_all")}
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-neutral-400 uppercase tracking-widest bg-neutral-50/50">
                    <tr>
                      <th className="px-6 py-3 font-semibold">{t("orders.order_id")}</th>
                      <th className="px-6 py-3 font-semibold">{t("orders.amount")}</th>
                      <th className="px-6 py-3 font-semibold hidden sm:table-cell">{t("orders.usdt_amount")}</th>
                      <th className="px-6 py-3 font-semibold">{t("orders.status")}</th>
                      <th className="px-6 py-3 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-neutral-300" />
                            </div>
                            <p className="text-neutral-400 font-medium">{t("dashboard.no_orders")}</p>
                            <Link to="/buy">
                              <Button variant="ghost" className="text-emerald-600 text-sm hover:bg-emerald-50">Start your first purchase</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="group hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-neutral-400">#{order.id.slice(-6).toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-neutral-900">{formatNumber(order.thbAmount)} THB</span>
                              <span className="text-[10px] text-emerald-600 font-medium sm:hidden">
                                {formatNumber(order.usdtAmount)} USDT
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="font-medium text-neutral-600">{formatNumber(order.usdtAmount)} USDT</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn("border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight", getStatusColor(order.status))}>
                              {t(`orders.status_${order.status.toLowerCase()}`)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
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
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-neutral-900 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Quick Calculator
              </CardTitle>
              <CardDescription className="text-neutral-400 text-xs">Estimate your USDT purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">You Pay (THB)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">THB</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700">
                  <ArrowRight className="w-4 h-4 text-emerald-400 rotate-90" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">You Receive (USDT)</label>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-emerald-400">{formatNumber(calculatedUsdt)}</span>
                    <span className="text-emerald-400/60 font-bold">USDT</span>
                  </div>
                </div>
              </div>

              <Link to={`/buy?amount=${amount}`} className="block pt-2">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-bold py-6 rounded-xl">
                  Buy Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 group hover:bg-emerald-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">How to buy?</p>
                  <p className="text-[10px] text-neutral-500">Step-by-step guide for beginners</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 group hover:bg-emerald-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Security Tips</p>
                  <p className="text-[10px] text-neutral-500">Keep your assets safe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
