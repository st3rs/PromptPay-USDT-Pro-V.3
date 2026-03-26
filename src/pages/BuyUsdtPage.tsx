import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOrderSchema, CreateOrderInput } from "@/src/lib/validation";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { formatCurrency, formatNumber, cn } from "@/src/lib/utils";
import { AlertCircle, Info, ArrowRight, Wallet, ShieldCheck, Zap } from "lucide-react";

export function BuyUsdtPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [feeSettings, setFeeSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      network: "TRC20",
      paymentMethod: "PROMPTPAY",
      amountTHB: 1000,
    },
  });

  const amountTHB = watch("amountTHB");
  const network = watch("network");

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const [rateRes, feeRes] = await Promise.all([
          fetch("/api/exchange-rate", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/fee-settings", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (rateRes.ok) setExchangeRate(await rateRes.json());
        if (feeRes.ok) setFeeSettings(await feeRes.json());
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    if (token) fetchRate();
  }, [token]);

  const serviceFeePercent = feeSettings ? parseFloat(feeSettings.SERVICE_FEE_PERCENT) : 1.5;
  const networkFeeUSDT = feeSettings ? parseFloat(feeSettings[`NETWORK_FEE_${network}`]) : 1.0;

  const usdtAmount = exchangeRate && amountTHB ? Number(amountTHB) / exchangeRate.rate : 0;
  const serviceFeeTHB = (Number(amountTHB || 0) * serviceFeePercent) / 100;
  const amountAfterServiceFee = Number(amountTHB || 0) - serviceFeeTHB;
  const usdtBeforeNetworkFee = exchangeRate ? amountAfterServiceFee / exchangeRate.rate : 0;
  const finalUsdt = Math.max(0, usdtBeforeNetworkFee - networkFeeUSDT);

  const onSubmit = async (data: CreateOrderInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create order");
      }

      const order = await res.json();
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">{t("common.buy")} USDT</h1>
        <p className="text-neutral-500">{t("orders.buy_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    {t(error)}
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label={t("orders.amount_thb")}
                    type="number"
                    placeholder="1,000"
                    error={errors.amountTHB?.message}
                    {...register("amountTHB", { valueAsNumber: true })}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("orders.network")}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["TRC20", "ERC20", "BEP20"].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setValue("network", n as any)}
                          className={cn(
                            "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                            network === n
                              ? "border-black bg-black text-white shadow-md"
                              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {errors.network && <p className="text-xs text-rose-500">{t(errors.network.message || "")}</p>}
                  </div>

                  <Input
                    label={t("orders.wallet_address")}
                    placeholder="0x... or T..."
                    error={errors.walletAddress?.message}
                    {...register("walletAddress")}
                  />

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-bold mb-1">{t("orders.warning_title")}</p>
                      <p>{t("orders.warning_text")}</p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base" isLoading={isLoading}>
                  {t("orders.create_order")}
                </Button>
              </form>
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
                <span>{t("orders.rate")}</span>
                <span className="text-white font-medium">1 USDT = {exchangeRate?.rate || "35.50"} THB</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>{t("orders.amount")}</span>
                <span className="text-white font-medium">{formatCurrency(amountTHB || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Service Fee ({serviceFeePercent}%)</span>
                <span className="text-white font-medium">{formatCurrency(serviceFeeTHB)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Network Fee ({network})</span>
                <span className="text-white font-medium">{formatNumber(networkFeeUSDT)} USDT</span>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-neutral-400">{t("orders.you_receive")}</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(finalUsdt)}</div>
                    <div className="text-xs text-neutral-500">USDT</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 px-2">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>{t("landing.security_notice")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>{t("landing.instant_verification")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
