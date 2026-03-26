import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { useI18n } from "@/src/context/I18nContext";
import { Shield, Zap, Globe, ArrowRight, CheckCircle2, QrCode, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { LiveRateSection } from "@/src/components/sections/LiveRateSection";

import { Logo } from "@/src/components/Logo";

export function LandingPage() {
  const { t, setLocale, locale } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <button onClick={() => setLocale("th")} className={cn("text-xs font-bold", locale === "th" ? "text-black" : "text-neutral-400")}>TH</button>
            <button onClick={() => setLocale("en")} className={cn("text-xs font-bold", locale === "en" ? "text-black" : "text-neutral-400")}>EN</button>
          </div>
          <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-black">{t("common.login")}</Link>
          <Link to="/register">
            <Button size="sm">{t("common.register")}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-6">
            {t("landing.hero_title").split("PromptPay")[0]}
            <span className="text-emerald-600">PromptPay</span>
            {t("landing.hero_title").split("PromptPay")[1]}
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10">
            {t("landing.hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-10">
                {t("landing.get_started")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t("landing.how_it_works")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Live Rate Section */}
      <LiveRateSection />

      {/* Features */}
      <section className="bg-neutral-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold mb-4">{t("landing.features")}</h2>
            <p className="text-neutral-500">{t("landing.security_notice")}</p>
          </motion.div>
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                icon: Shield,
                title: "Secure Infrastructure",
                desc: "Enterprise-grade security protocols and cold storage solutions."
              },
              {
                icon: Zap,
                title: "Instant Verification",
                desc: "Automated verification of PromptPay slips in seconds."
              },
              {
                icon: Globe,
                title: "Multi-Network Support",
                desc: "Choose between TRC20, ERC20, and BEP20 networks."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
