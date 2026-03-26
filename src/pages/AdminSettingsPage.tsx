import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { formatDate, cn } from "@/src/lib/utils";
import { Building2, Save, Plus, Trash2, ShieldCheck, TrendingUp, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";

export function AdminSettingsPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [feeSettings, setFeeSettings] = useState<any>({
    NETWORK_FEE_TRC20: "1.0",
    NETWORK_FEE_ERC20: "15.0",
    NETWORK_FEE_BEP20: "0.8",
    SERVICE_FEE_PERCENT: "1.5"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: "", accountName: "", accountNumber: "", isActive: true });
  const [bankToDelete, setBankToDelete] = useState<string | null>(null);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [newRate, setNewRate] = useState({ pair: "BTC/THB", rate: 0, source: "MANUAL" });
  const [rateUpdateConfirm, setRateUpdateConfirm] = useState<{
    id?: string;
    pair: string;
    rate: number;
    source: string;
    isNew: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankRes, rateRes, feeRes] = await Promise.all([
          fetch("/api/admin/bank-accounts", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/exchange-rates", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/admin/fee-settings", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (bankRes.ok) setBankAccounts(await bankRes.json());
        if (rateRes.ok) setExchangeRates(await rateRes.json());
        if (feeRes.ok) setFeeSettings(await feeRes.json());
      } catch (err) {
        console.error("Failed to fetch admin settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/bank-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBank),
      });
      if (res.ok) {
        const added = await res.json();
        setBankAccounts([...bankAccounts, added]);
        setIsAddingBank(false);
        setNewBank({ bankName: "", accountName: "", accountNumber: "", isActive: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBank = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBankAccounts(bankAccounts.filter(b => b.id !== id));
        setBankToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBank = async (id: string, data: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/bank-accounts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setBankAccounts(bankAccounts.map(b => b.id === id ? updated : b));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRate = async (id: string, updates: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/exchange-rates/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setExchangeRates(exchangeRates.map(r => r.id === id ? updated : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeeSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/fee-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feeSettings),
      });
      if (res.ok) {
        // Success
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddManualRate = async () => {
    setIsSaving(true);
    try {
      if (!rateUpdateConfirm) return;
      const res = await fetch("/api/admin/exchange-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          pair: rateUpdateConfirm.pair, 
          rate: Number(rateUpdateConfirm.rate), 
          source: rateUpdateConfirm.source 
        }),
      });
      if (res.ok) {
        const added = await res.json();
        const existingIndex = exchangeRates.findIndex(r => r.pair === added.pair);
        if (existingIndex >= 0) {
          const newRates = [...exchangeRates];
          newRates[existingIndex] = added;
          setExchangeRates(newRates);
        } else {
          setExchangeRates([...exchangeRates, added]);
        }
        setIsAddingRate(false);
        setNewRate({ pair: "BTC/THB", rate: 0, source: "MANUAL" });
        setRateUpdateConfirm(null);
      } else {
        const err = await res.json();
        console.error("Failed to add manual rate:", err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!rateUpdateConfirm) return;
    if (rateUpdateConfirm.isNew) {
      await handleAddManualRate();
    } else if (rateUpdateConfirm.id) {
      await handleUpdateRate(rateUpdateConfirm.id, { 
        rate: rateUpdateConfirm.rate, 
        source: rateUpdateConfirm.source 
      });
      setRateUpdateConfirm(null);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-neutral-900 uppercase">System Configuration</h1>
          <p className="text-neutral-500 font-serif italic text-sm">Adjust network parameters, liquidity settings, and banking infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 border border-neutral-100">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          System Status: Operational
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-none border-neutral-200 shadow-none">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xs font-serif italic uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Protocol Fees & Network Parameters
                  </CardTitle>
                </div>
                <Button onClick={handleSaveFeeSettings} isLoading={isSaving} className="w-full sm:w-auto rounded-none font-mono text-[10px] uppercase tracking-widest h-9">
                  <Save className="w-3.5 h-3.5 mr-2" />
                  Commit Changes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4 p-5 bg-neutral-50 border border-neutral-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neutral-300 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    <span>TRC20 Network</span>
                    <Badge variant="outline" className="rounded-none border-neutral-200 bg-white text-[9px]">TRON</Badge>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Withdrawal Fee (USDT)</label>
                    <Input 
                      type="number"
                      step="0.1"
                      className="rounded-none border-neutral-300 font-mono focus-visible:ring-0 focus-visible:border-blue-500"
                      value={feeSettings.NETWORK_FEE_TRC20}
                      onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_TRC20: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic font-serif">Fixed cost per outbound transaction</p>
                </div>

                <div className="space-y-4 p-5 bg-neutral-50 border border-neutral-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neutral-300 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    <span>ERC20 Network</span>
                    <Badge variant="outline" className="rounded-none border-neutral-200 bg-white text-[9px]">ETH</Badge>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Withdrawal Fee (USDT)</label>
                    <Input 
                      type="number"
                      step="0.1"
                      className="rounded-none border-neutral-300 font-mono focus-visible:ring-0 focus-visible:border-blue-500"
                      value={feeSettings.NETWORK_FEE_ERC20}
                      onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_ERC20: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic font-serif">Variable gas-adjusted baseline</p>
                </div>

                <div className="space-y-4 p-5 bg-neutral-50 border border-neutral-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neutral-300 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                    <span>BEP20 Network</span>
                    <Badge variant="outline" className="rounded-none border-neutral-200 bg-white text-[9px]">BSC</Badge>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-tight">Withdrawal Fee (USDT)</label>
                    <Input 
                      type="number"
                      step="0.1"
                      className="rounded-none border-neutral-300 font-mono focus-visible:ring-0 focus-visible:border-blue-500"
                      value={feeSettings.NETWORK_FEE_BEP20}
                      onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_BEP20: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic font-serif">Optimized BSC smart chain cost</p>
                </div>

                <div className="space-y-4 p-5 bg-blue-50/30 border border-blue-200 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-blue-600">
                    <span>Global Service Fee</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">Platform Margin (%)</label>
                    <Input 
                      type="number"
                      step="0.1"
                      className="rounded-none border-blue-200 font-mono focus-visible:ring-0 focus-visible:border-blue-500 bg-white"
                      value={feeSettings.SERVICE_FEE_PERCENT}
                      onChange={(e) => setFeeSettings({ ...feeSettings, SERVICE_FEE_PERCENT: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-blue-600/70 italic font-serif">Applied to all THB/USDT conversions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="text-xs font-serif italic uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Banking Infrastructure
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingBank(!isAddingBank)} className="h-8 rounded-none font-mono text-[10px] uppercase tracking-widest border border-neutral-200">
              <Plus className="w-3.5 h-3.5 mr-2" />
              {isAddingBank ? "Abort" : "Initialize New"}
            </Button>
          </div>

          {isAddingBank && (
            <Card className="rounded-none border-blue-200 bg-blue-50/20 shadow-none">
              <CardHeader className="pb-3 border-b border-blue-100">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-blue-600">New Account Entry</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddBank} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Bank Name" 
                      className="rounded-none font-mono text-xs"
                      value={newBank.bankName} 
                      onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                      required
                    />
                    <Input 
                      label="Account Name" 
                      className="rounded-none font-mono text-xs"
                      value={newBank.accountName} 
                      onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                      required
                    />
                  </div>
                  <Input 
                    label="Account Number" 
                    className="rounded-none font-mono text-xs"
                    value={newBank.accountNumber} 
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    required
                  />
                  <Button type="submit" className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest" isLoading={isSaving}>
                    Commit to Database
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {bankAccounts.map((bank) => (
            <Card key={bank.id} className="rounded-none border-neutral-200 shadow-none group relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", bank.isActive ? "bg-blue-500" : "bg-neutral-300")} />
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={cn("rounded-none text-[9px] uppercase tracking-widest font-bold px-2 py-0.5", bank.isActive ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-neutral-100 text-neutral-500 border-neutral-200")}>
                    {bank.isActive ? "ACTIVE_NODE" : "OFFLINE"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 rounded-none h-7 w-7 p-0" onClick={() => setBankToDelete(bank.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Bank Name" 
                    className="rounded-none font-mono text-xs border-neutral-200"
                    defaultValue={bank.bankName} 
                    onBlur={(e) => handleUpdateBank(bank.id, { bankName: e.target.value })}
                  />
                  <Input 
                    label="Account Name" 
                    className="rounded-none font-mono text-xs border-neutral-200"
                    defaultValue={bank.accountName} 
                    onBlur={(e) => handleUpdateBank(bank.id, { accountName: e.target.value })}
                  />
                </div>
                <Input 
                  label="Account Number" 
                  className="rounded-none font-mono text-xs border-neutral-200"
                  defaultValue={bank.accountNumber} 
                  onBlur={(e) => handleUpdateBank(bank.id, { accountNumber: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    checked={bank.isActive} 
                    onChange={(e) => handleUpdateBank(bank.id, { isActive: e.target.checked })}
                    className="w-4 h-4 rounded-none border-neutral-300 text-blue-600 focus:ring-0"
                  />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Enable as primary gateway</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="text-xs font-serif italic uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Liquidity & Exchange Rates
            </h2>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingRate(!isAddingRate)} className="h-8 rounded-none font-mono text-[10px] uppercase tracking-widest border border-neutral-200">
              <Plus className="w-3.5 h-3.5 mr-2" />
              {isAddingRate ? "Abort" : "Manual Override"}
            </Button>
          </div>

          {isAddingRate && (
            <Card className="rounded-none border-blue-200 bg-blue-50/20 shadow-none">
              <CardHeader className="pb-3 border-b border-blue-100">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-blue-600">New Market Pair</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRateUpdateConfirm({ ...newRate, isNew: true });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input 
                      label="Currency Pair" 
                      className="rounded-none font-mono text-xs"
                      placeholder="BTC/THB"
                      value={newRate.pair} 
                      onChange={(e) => setNewRate({ ...newRate, pair: e.target.value })}
                      required
                    />
                    <Input 
                      label="Rate Value" 
                      className="rounded-none font-mono text-xs"
                      type="number"
                      step="0.000001"
                      value={newRate.rate} 
                      onChange={(e) => setNewRate({ ...newRate, rate: Number(e.target.value) })}
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Data Source</label>
                      <select 
                        value={newRate.source}
                        onChange={(e) => setNewRate({ ...newRate, source: e.target.value })}
                        className="flex h-10 w-full rounded-none border border-neutral-200 bg-white px-3 py-2 text-xs font-mono ring-offset-white focus-visible:outline-none focus-visible:ring-0 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="MANUAL">MANUAL_ENTRY</option>
                        <option value="BITKUB">BITKUB_API</option>
                        <option value="BINANCE">BINANCE_API</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest" isLoading={isSaving}>
                    Inject Rate
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {exchangeRates.map((rate) => (
            <Card key={rate.id} className="rounded-none border-neutral-200 shadow-none group relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", rate.source === "MANUAL" ? "bg-amber-500" : "bg-blue-500")} />
              <CardHeader className="pb-3 border-b border-neutral-50">
                <CardTitle className="text-[11px] font-mono uppercase tracking-widest flex items-center justify-between">
                  <span className="font-bold">{rate.pair}</span>
                  <Badge className={cn("rounded-none text-[9px] uppercase tracking-widest font-bold px-2 py-0.5", rate.source === "MANUAL" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-blue-100 text-blue-700 border-blue-200")}>
                    {rate.source}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-[10px] font-serif italic">Last sync: {formatDate(rate.updatedAt, "en")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="w-full sm:flex-1">
                    <Input 
                      id={`rate-${rate.id}`}
                      label={`Rate (1 ${rate.pair.split('/')[0] || 'Base'} = ? ${rate.pair.split('/')[1] || 'Quote'})`} 
                      className="rounded-none font-mono text-xs border-neutral-200"
                      type="number" 
                      step="0.000001"
                      defaultValue={rate.rate}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val !== rate.rate) {
                          setRateUpdateConfirm({ id: rate.id, pair: rate.pair, rate: val, source: rate.source, isNew: false });
                        }
                      }}
                      disabled={rate.source === "BITKUB"}
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {rate.source === "MANUAL" && (
                      <Button 
                        variant="ghost" 
                        className="flex-1 sm:flex-none rounded-none border border-neutral-200 h-10 px-4 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white"
                        isLoading={isSaving}
                        onClick={() => {
                          const input = document.getElementById(`rate-${rate.id}`) as HTMLInputElement;
                          if (input) {
                            setRateUpdateConfirm({ id: rate.id, pair: rate.pair, rate: parseFloat(input.value), source: rate.source, isNew: false });
                          }
                        }}
                      >
                        Update
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="flex-1 sm:flex-none rounded-none border border-neutral-200 h-10 px-4 font-mono text-[10px] uppercase tracking-widest hover:bg-neutral-900 hover:text-white"
                      isLoading={isSaving}
                      onClick={() => {
                        const newSource = rate.source === "MANUAL" ? "BITKUB" : "MANUAL";
                        setRateUpdateConfirm({ id: rate.id, pair: rate.pair, rate: rate.rate, source: newSource, isNew: false });
                      }}
                    >
                      {rate.source === "MANUAL" ? "Sync API" : "Override"}
                    </Button>
                  </div>
                </div>
                {rate.source === "BITKUB" && (
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-none text-[10px] font-mono text-blue-700 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    SYNC_ACTIVE: BITKUB_API_STREAM
                  </div>
                )}
                {rate.source === "MANUAL" && (
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-none text-[10px] font-mono text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    OVERRIDE_ACTIVE: MANUAL_MODE
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={!!bankToDelete} 
        onClose={() => setBankToDelete(null)} 
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setBankToDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => bankToDelete && handleDeleteBank(bankToDelete)} isLoading={isSaving}>Delete</Button>
          </>
        }
      >
        <p className="text-neutral-600">Are you sure you want to delete this bank account? This action cannot be undone.</p>
      </Modal>

      <Modal
        isOpen={!!rateUpdateConfirm}
        onClose={() => setRateUpdateConfirm(null)}
        title="Confirm Exchange Rate Update"
        footer={
          <>
            <Button variant="outline" onClick={() => setRateUpdateConfirm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmUpdate} isLoading={isSaving}>Confirm Update</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600">Please confirm the following exchange rate changes:</p>
          <div className="bg-neutral-50 p-4 rounded-lg space-y-2 border border-neutral-100">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Currency Pair:</span>
              <span className="text-sm font-bold">{rateUpdateConfirm?.pair}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">New Rate:</span>
              <span className="text-sm font-bold text-blue-600">{rateUpdateConfirm?.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Source:</span>
              <Badge variant={rateUpdateConfirm?.source === "MANUAL" ? "warning" : "success"}>
                {rateUpdateConfirm?.source}
              </Badge>
            </div>
          </div>
          {rateUpdateConfirm?.source === "MANUAL" && (
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Manual rates will override automatic API syncing.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
