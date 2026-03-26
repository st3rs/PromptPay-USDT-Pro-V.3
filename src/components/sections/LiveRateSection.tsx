import React, { useState, useEffect } from "react";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { TrendingUp, Globe, Clock } from "lucide-react";
import { motion } from "motion/react";

export function LiveRateSection() {
  const { t } = useI18n();
  const [rateData, setRateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("/api/exchange-rate");
        if (res.ok) {
          const data = await res.json();
          setRateData(data);
        }
      } catch (err) {
        console.error("Failed to fetch live rate", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Card className="bg-neutral-900 text-white border-none overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3">
              <div className="p-8 border-b md:border-b-0 md:border-r border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  {t("landing.live_rate")}
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {rateData?.rate?.toFixed(2)} <span className="text-lg font-normal text-neutral-500">THB</span>
                </div>
                <div className="text-sm text-neutral-400">
                  1 USDT = {rateData?.rate?.toFixed(2)} THB
                </div>
              </div>

              <div className="p-8 border-b md:border-b-0 md:border-r border-neutral-800">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Globe className="w-4 h-4 text-blue-500" />
                  {t("landing.market_rate")}
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {rateData?.marketRate?.toFixed(2)} <span className="text-sm font-normal text-neutral-500">THB</span>
                </div>
                <Badge variant="secondary" className="bg-neutral-800 text-neutral-400 border-none">
                  {t("landing.source")}: {rateData?.source}
                </Badge>
              </div>

              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Last Updated
                </div>
                <div className="text-sm text-neutral-300">
                  {rateData?.timestamp ? new Date(rateData.timestamp).toLocaleTimeString() : "-"}
                </div>
                <div className="mt-4 text-[10px] text-neutral-500 leading-relaxed uppercase tracking-widest">
                  Real-time data synced with Bitkub exchange API
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
