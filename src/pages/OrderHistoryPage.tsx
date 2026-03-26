import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { formatCurrency, formatNumber, formatDate, getStatusColor, cn } from "@/src/lib/utils";
import { Search, Filter, ArrowRight } from "lucide-react";

export function OrderHistoryPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setOrders(await res.json());
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">{t("common.history")}</h1>
          <p className="text-neutral-500">{t("orders.history_subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder={t("common.search")} 
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
          <Button variant="outline" size="md" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            {t("common.filter")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 uppercase bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("orders.order_id")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.usdt_amount")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.network")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.status")}</th>
                  <th className="px-6 py-4 font-medium">{t("orders.date")}</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                      Loading...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                      {t("dashboard.no_orders")}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4">{formatCurrency(order.thbAmount)}</td>
                      <td className="px-6 py-4 font-medium text-emerald-600">{formatNumber(order.usdtAmount)} USDT</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{order.network}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={cn("border", getStatusColor(order.status))}>
                          {t(`orders.status_${order.status.toLowerCase()}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{formatDate(order.createdAt, locale)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            {t("common.details")}
                            <ArrowRight className="ml-2 w-4 h-4" />
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
