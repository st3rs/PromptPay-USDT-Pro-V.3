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
      <div>
        <h1 className="text-2xl font-bold text-black">Admin: Settings</h1>
        <p className="text-neutral-500">Configure bank accounts and exchange rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fee Settings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Fee & Network Settings
                  </CardTitle>
                  <CardDescription>Adjust service fees and network withdrawal costs</CardDescription>
                </div>
                <Button onClick={handleSaveFeeSettings} isLoading={isSaving} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save All Fees
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                    <Badge variant="outline" className="bg-white">TRC20</Badge>
                    Network Fee (USDT)
                  </div>
                  <Input 
                    type="number"
                    step="0.1"
                    value={feeSettings.NETWORK_FEE_TRC20}
                    onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_TRC20: e.target.value })}
                  />
                  <p className="text-[10px] text-neutral-500 italic">Standard fee for Tron network</p>
                </div>

                <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                    <Badge variant="outline" className="bg-white">ERC20</Badge>
                    Network Fee (USDT)
                  </div>
                  <Input 
                    type="number"
                    step="0.1"
                    value={feeSettings.NETWORK_FEE_ERC20}
                    onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_ERC20: e.target.value })}
                  />
                  <p className="text-[10px] text-neutral-500 italic">Standard fee for Ethereum network</p>
                </div>

                <div className="space-y-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                    <Badge variant="outline" className="bg-white">BEP20</Badge>
                    Network Fee (USDT)
                  </div>
                  <Input 
                    type="number"
                    step="0.1"
                    value={feeSettings.NETWORK_FEE_BEP20}
                    onChange={(e) => setFeeSettings({ ...feeSettings, NETWORK_FEE_BEP20: e.target.value })}
                  />
                  <p className="text-[10px] text-neutral-500 italic">Standard fee for BSC network</p>
                </div>

                <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <TrendingUp className="w-4 h-4" />
                    Service Fee (%)
                  </div>
                  <Input 
                    type="number"
                    step="0.1"
                    value={feeSettings.SERVICE_FEE_PERCENT}
                    onChange={(e) => setFeeSettings({ ...feeSettings, SERVICE_FEE_PERCENT: e.target.value })}
                  />
                  <p className="text-[10px] text-emerald-600 italic">Platform profit margin per order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Bank Accounts
            </h2>
            <Button size="sm" variant="outline" onClick={() => setIsAddingBank(!isAddingBank)}>
              <Plus className="w-4 h-4 mr-2" />
              {isAddingBank ? "Cancel" : "Add Bank"}
            </Button>
          </div>

          {isAddingBank && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">New Bank Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBank} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      label="Bank Name" 
                      value={newBank.bankName} 
                      onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                      required
                    />
                    <Input 
                      label="Account Name" 
                      value={newBank.accountName} 
                      onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                      required
                    />
                  </div>
                  <Input 
                    label="Account Number" 
                    value={newBank.accountNumber} 
                    onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isSaving}>
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {bankAccounts.map((bank) => (
            <Card key={bank.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={bank.isActive ? "success" : "secondary"}>
                    {bank.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setBankToDelete(bank.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Bank Name" 
                    defaultValue={bank.bankName} 
                    onBlur={(e) => handleUpdateBank(bank.id, { bankName: e.target.value })}
                  />
                  <Input 
                    label="Account Name" 
                    defaultValue={bank.accountName} 
                    onBlur={(e) => handleUpdateBank(bank.id, { accountName: e.target.value })}
                  />
                </div>
                <Input 
                  label="Account Number" 
                  defaultValue={bank.accountNumber} 
                  onBlur={(e) => handleUpdateBank(bank.id, { accountNumber: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={bank.isActive} 
                    onChange={(e) => handleUpdateBank(bank.id, { isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium">Set as Active Account</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Exchange Rates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Exchange Rates
            </h2>
            <Button size="sm" variant="outline" onClick={() => setIsAddingRate(!isAddingRate)}>
              <Plus className="w-4 h-4 mr-2" />
              {isAddingRate ? "Cancel" : "Add Manual Rate"}
            </Button>
          </div>

          {isAddingRate && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-sm">New Manual Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRateUpdateConfirm({ ...newRate, isNew: true });
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input 
                      label="Currency Pair (e.g. BTC/THB)" 
                      value={newRate.pair} 
                      onChange={(e) => setNewRate({ ...newRate, pair: e.target.value })}
                      required
                    />
                    <Input 
                      label="Rate" 
                      type="number"
                      step="0.000001"
                      value={newRate.rate} 
                      onChange={(e) => setNewRate({ ...newRate, rate: Number(e.target.value) })}
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-700">Source</label>
                      <select 
                        value={newRate.source}
                        onChange={(e) => setNewRate({ ...newRate, source: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="MANUAL">MANUAL</option>
                        <option value="BITKUB">BITKUB</option>
                        <option value="BINANCE">BINANCE</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" isLoading={isSaving}>
                    Save Rate
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {exchangeRates.map((rate) => (
            <Card key={rate.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  {rate.pair} Rate
                  <Badge variant={rate.source === "MANUAL" ? "warning" : "success"}>
                    {rate.source}
                  </Badge>
                </CardTitle>
                <CardDescription>Last updated: {formatDate(rate.updatedAt, "en")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="w-full sm:flex-1">
                    <Input 
                      id={`rate-${rate.id}`}
                      label={`Rate (1 ${rate.pair.split('/')[0] || 'Base'} = ? ${rate.pair.split('/')[1] || 'Quote'})`} 
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
                  {rate.source === "MANUAL" && (
                    <Button 
                      variant="primary" 
                      size="md" 
                      className="w-full sm:w-auto"
                      isLoading={isSaving}
                      onClick={() => {
                        const input = document.getElementById(`rate-${rate.id}`) as HTMLInputElement;
                        if (input) {
                          setRateUpdateConfirm({ id: rate.id, pair: rate.pair, rate: parseFloat(input.value), source: rate.source, isNew: false });
                        }
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="md" 
                    isLoading={isSaving}
                    onClick={() => {
                      const newSource = rate.source === "MANUAL" ? "BITKUB" : "MANUAL";
                      setRateUpdateConfirm({ id: rate.id, pair: rate.pair, rate: rate.rate, source: newSource, isNew: false });
                    }}
                  >
                    Switch to {rate.source === "MANUAL" ? "Bitkub" : "Manual"}
                  </Button>
                </div>
                {rate.source === "BITKUB" && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    This rate is automatically synced with Bitkub API. Switch to Manual to override.
                  </div>
                )}
                {rate.source === "MANUAL" && (
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Using manual rate. Switch to Bitkub to resume automatic syncing.
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
              <span className="text-sm font-bold text-emerald-600">{rateUpdateConfirm?.rate}</span>
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
