import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6">
              <Link to="/#features" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">{t("landing.features")}</Link>
              <Link to="/#rates" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">{t("landing.live_rate")}</Link>
            </div>
            <div className="flex items-center gap-4 border-l border-neutral-200 pl-8">
              <div className="flex gap-3">
                <button onClick={() => setLocale("th")} className={cn("text-xs font-bold transition-colors", locale === "th" ? "text-primary" : "text-neutral-400 hover:text-neutral-600")}>TH</button>
                <button onClick={() => setLocale("en")} className={cn("text-xs font-bold transition-colors", locale === "en" ? "text-primary" : "text-neutral-400 hover:text-neutral-600")}>EN</button>
              </div>
              <Link to="/login" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">{t("common.login")}</Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20">{t("common.register")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 grid-pattern opacity-50 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge variant="secondary" className="mb-8 rounded-full px-4 py-1 bg-primary/10 text-primary border-none font-semibold">
              ✨ {t("landing.instant_verification")}
            </Badge>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight text-black mb-8 text-balance leading-[1.1]">
              {t("landing.hero_title").split("PromptPay")[0]}
              <span className="text-primary relative inline-block">
                PromptPay
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
              {t("landing.hero_title").split("PromptPay")[1]}
            </h1>
            <p className="text-xl md:text-2xl text-neutral-500 max-w-3xl mx-auto mb-12 leading-relaxed text-balance">
              {t("landing.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-12 py-7 text-lg rounded-full shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                  {t("landing.get_started")}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-12 py-7 text-lg rounded-full border-neutral-200 hover:bg-neutral-50">
                {t("landing.how_it_works")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="py-12 border-y border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-8">Supported Networks</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">T</div>
              <span className="font-bold text-neutral-900">TRC20</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">E</div>
              <span className="font-bold text-neutral-900">ERC20</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">B</div>
              <span className="font-bold text-neutral-900">BEP20</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Rate Section */}
      <div id="rates">
        <LiveRateSection />
      </div>

      {/* Features */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">{t("landing.features")}</h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">{t("landing.security_notice")}</p>
          </motion.div>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shield,
                title: "Secure Infrastructure",
                desc: "Enterprise-grade security protocols and cold storage solutions to keep your assets safe.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: Zap,
                title: "Instant Verification",
                desc: "Our AI-powered system verifies PromptPay slips in seconds, ensuring zero delays.",
                color: "bg-amber-50 text-amber-600"
              },
              {
                icon: Globe,
                title: "Global Liquidity",
                desc: "Deep liquidity pools ensure you always get the best market rates for your USDT.",
                color: "bg-indigo-50 text-indigo-600"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="group p-10 rounded-3xl border border-neutral-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500", feature.color)}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Logo className="mb-6 invert brightness-0" />
              <p className="text-neutral-400 max-w-sm leading-relaxed">
                The most trusted platform for buying USDT with PromptPay in Thailand. Fast, secure, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-neutral-500">Platform</h4>
              <ul className="space-y-4 text-neutral-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/#rates" className="hover:text-white transition-colors">Live Rates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-neutral-500">Support</h4>
              <ul className="space-y-4 text-neutral-400">
                <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-neutral-500">
            <p>© 2026 PromptPayUSDT. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
