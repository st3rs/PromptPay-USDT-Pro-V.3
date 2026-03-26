import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Button } from "@/src/components/ui/Button";
import { LayoutDashboard, History, PlusCircle, LogOut, ShieldCheck, User as UserIcon, Menu, X, Globe, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

import { Logo } from "@/src/components/Logo";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: t("common.dashboard"), href: "/dashboard", icon: LayoutDashboard, roles: ["CUSTOMER", "ADMIN"] },
    { name: t("common.buy"), href: "/buy", icon: PlusCircle, roles: ["CUSTOMER"] },
    { name: t("common.history"), href: "/history", icon: History, roles: ["CUSTOMER"] },
    { name: t("common.admin_orders"), href: "/admin/orders", icon: ShieldCheck, roles: ["ADMIN"] },
    { name: t("common.admin_users"), href: "/admin/users", icon: UserIcon, roles: ["ADMIN"] },
    { name: t("common.admin_settings"), href: "/admin/settings", icon: SettingsIcon, roles: ["ADMIN"] },
    { name: t("common.admin_bitkub"), href: "/admin/bitkub", icon: Globe, roles: ["ADMIN"] },
  ];

  const filteredNav = navigation.filter((item) => user && item.roles.includes(user.role));

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-neutral-200 p-6">
        <div className="mb-10 px-2">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-neutral-100 text-black"
                  : "text-neutral-500 hover:text-black hover:bg-neutral-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-100 space-y-4">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Globe className="w-3 h-3" />
              Language
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setLocale("th")}
                className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", locale === "th" ? "bg-black text-white" : "text-neutral-400")}
              >
                TH
              </button>
              <button 
                onClick={() => setLocale("en")}
                className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", locale === "en" ? "bg-black text-white" : "text-neutral-400")}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 truncate">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("common.logout")}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-neutral-200 px-4 h-16 flex items-center justify-between sticky top-0 z-50">
        <Logo iconSize="sm" textSize="lg" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-neutral-500">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 top-16"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed inset-x-0 top-16 z-50 bg-white flex flex-col p-4 border-b border-neutral-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
            <nav className="flex-1 space-y-2 mb-6">
              {filteredNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-neutral-100 text-black"
                      : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-neutral-100 space-y-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  <Globe className="w-4 h-4" />
                  Language
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setLocale("th")}
                    className={cn("text-xs font-bold px-2 py-1 rounded", locale === "th" ? "bg-black text-white" : "text-neutral-400")}
                  >
                    TH
                  </button>
                  <button 
                    onClick={() => setLocale("en")}
                    className={cn("text-xs font-bold px-2 py-1 rounded", locale === "en" ? "bg-black text-white" : "text-neutral-400")}
                  >
                    EN
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-black truncate">{user.name}</p>
                  <p className="text-sm text-neutral-500 truncate">{user.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="lg" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4" onClick={logout}>
                <LogOut className="w-5 h-5 mr-3" />
                {t("common.logout")}
              </Button>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
