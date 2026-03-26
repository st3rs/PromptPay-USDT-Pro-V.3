import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { formatCurrency, formatNumber, formatDate, getStatusColor, cn } from "@/src/lib/utils";
import { AlertCircle, ArrowLeft, CheckCircle2, QrCode, Building2, Upload, ExternalLink, Copy, Clock, ShieldCheck, User as UserIcon } from "lucide-react";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [order, setOrder] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, bankRes] = await Promise.all([
          fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/bank-accounts/active", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (orderRes.ok) setOrder(await orderRes.json());
        if (bankRes.ok) setBankAccount(await bankRes.json());
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token && id) fetchData();
  }, [token, id]);

  // Auto-refresh for pending orders
  useEffect(() => {
    if (!token || !id || !order) return;

    const finalStatuses = ["COMPLETED", "REJECTED", "EXPIRED"];
    if (finalStatuses.includes(order.status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
          const updatedOrder = await res.json();
          // Only update if status or txHash changed to minimize re-renders
          if (updatedOrder.status !== order.status || updatedOrder.txHash !== order.txHash) {
            setOrder(updatedOrder);
          }
        }
      } catch (err) {
        console.error("Auto-refresh failed", err);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [token, id, order?.status, order?.txHash]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("slip", file);

    try {
      const res = await fetch(`/api/orders/${id}/upload-slip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const updatedOrder = await res.json();
      setOrder(updatedOrder);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  const isPendingPayment = order.status === "PENDING" || order.status === "AWAITING_PAYMENT";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/history" className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t("common.back")}</span>
        </Link>
        <Badge className={cn("border px-4 py-1 text-xs sm:text-sm self-start sm:self-auto", getStatusColor(order.status))}>
          {t(`orders.status_${order.status.toLowerCase()}`)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Instructions */}
          {isPendingPayment && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  {t("orders.payment_instructions")}
                </CardTitle>
                <CardDescription>{t("orders.payment_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                    {/* Placeholder for QR Code */}
                    <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-neutral-300" />
                  </div>
                  <p className="text-sm font-bold text-black mb-1">PromptPay QR</p>
                  <p className="text-xs text-neutral-500">{t("orders.scan_to_pay")}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-neutral-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider font-bold">{t("orders.bank_name")}</p>
                        <p className="text-sm font-bold">{bankAccount?.bankName || "Kasikorn Bank"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-1" onClick={() => copyToClipboard(bankAccount?.bankName || "Kasikorn Bank")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-neutral-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider font-bold">{t("orders.account_number")}</p>
                        <p className="text-sm font-bold">{bankAccount?.accountNumber || "123-4-56789-0"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-1" onClick={() => copyToClipboard(bankAccount?.accountNumber || "")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-emerald-600 text-white rounded-xl shadow-md gap-3">
                    <div>
                      <p className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider font-bold">{t("orders.total_amount")}</p>
                      <p className="text-lg sm:text-xl font-bold">{formatCurrency(order.thbAmount)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-emerald-500 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-1" onClick={() => copyToClipboard(order.thbAmount.toString())}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Slip */}
          {isPendingPayment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  {t("orders.upload_slip")}
                </CardTitle>
                <CardDescription>{t("orders.upload_subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-sm">
                    {uploadError}
                  </div>
                )}
                <div className="relative border-2 border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    accept="image/*"
                  />
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-black">{isUploading ? "Uploading..." : t("orders.click_to_upload")}</p>
                  <p className="text-xs text-neutral-500 mt-1">JPG, PNG or PDF (max 5MB)</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("orders.order_details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{t("orders.order_id")}</p>
                  <p className="text-sm font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{t("orders.date")}</p>
                  <p className="text-sm font-medium">{formatDate(order.createdAt, locale)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{t("orders.network")}</p>
                  <Badge variant="secondary">{order.network}</Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{t("orders.payment_method")}</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-2">{t("orders.wallet_address")}</p>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <code className="text-xs font-mono break-all">{order.walletAddress}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(order.walletAddress)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {order.txHash && (
                <div className="pt-6 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-2">{t("orders.tx_hash")}</p>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <code className="text-xs font-mono break-all text-emerald-800">{order.txHash}</code>
                    <a href={`https://tronscan.org/#/transaction/${order.txHash}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm" className="text-emerald-600">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-neutral-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white text-lg">{t("orders.summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{t("orders.amount")}</span>
                <span className="text-white font-medium">{formatCurrency(order.thbAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{t("orders.rate")}</span>
                <span className="text-white font-medium">1 USDT = {order.exchangeRate} THB</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{t("orders.fee")}</span>
                <span className="text-white font-medium">{formatNumber(order.fee)} USDT</span>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-neutral-400">{t("orders.you_receive")}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{formatNumber(order.usdtAmount)}</div>
                    <div className="text-xs text-neutral-500">USDT</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              {t("orders.timeline")}
            </h4>
            <div className="space-y-4">
              {[
                { label: t("orders.status_pending"), date: order.createdAt, active: true },
                { label: t("orders.status_payment_uploaded"), date: order.paymentSlipUrl ? order.updatedAt : null, active: !!order.paymentSlipUrl },
                { label: t("orders.status_under_review"), date: order.status === "UNDER_REVIEW" ? order.updatedAt : null, active: ["UNDER_REVIEW", "APPROVED", "COMPLETED"].includes(order.status) },
                { label: t("orders.status_completed"), date: order.status === "COMPLETED" ? order.updatedAt : null, active: order.status === "COMPLETED" },
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-2.5 h-2.5 rounded-full", step.active ? "bg-emerald-500" : "bg-neutral-200")} />
                    {i < 3 && <div className="w-0.5 flex-1 bg-neutral-100 my-1" />}
                  </div>
                  <div>
                    <p className={cn("text-xs font-medium", step.active ? "text-black" : "text-neutral-400")}>{step.label}</p>
                    {step.date && <p className="text-[10px] text-neutral-400">{formatDate(step.date, locale)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
