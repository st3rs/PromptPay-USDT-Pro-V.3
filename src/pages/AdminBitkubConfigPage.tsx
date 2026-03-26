import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { ShieldCheck, Save, AlertCircle, RefreshCw, Key, Settings as SettingsIcon } from "lucide-react";

export function AdminBitkubConfigPage() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [config, setConfig] = useState<any>({
    apiKey: "",
    apiSecret: "",
    baseUrl: "https://api.bitkub.com",
    symbol: "THB_USDT",
    autoRateSync: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/bitkub-config", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setConfig(await res.json());
      } catch (err) {
        console.error("Failed to fetch Bitkub config", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchConfig();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/bitkub-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }

      setSuccess("Bitkub configuration saved successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Admin: Bitkub Integration</h1>
        <p className="text-neutral-500">Configure Bitkub API credentials and trading settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              API Credentials
            </CardTitle>
            <CardDescription>These keys are used to fetch rates and execute orders on Bitkub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {success}
              </div>
            )}

            <Input 
              label="API Key" 
              placeholder="Enter Bitkub API Key"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            />
            <Input 
              label="API Secret" 
              type="password"
              placeholder="Enter Bitkub API Secret"
              value={config.apiSecret}
              onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-neutral-600" />
              Market Settings
            </CardTitle>
            <CardDescription>Configure how the app interacts with the Bitkub market</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Base API URL" 
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            />
            <Input 
              label="Trading Symbol" 
              value={config.symbol}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
            />
            
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Auto Rate Sync</p>
                <p className="text-xs text-neutral-500">Automatically update exchange rates every 5 minutes</p>
              </div>
              <input 
                type="checkbox" 
                checked={config.autoRateSync}
                onChange={(e) => setConfig({ ...config, autoRateSync: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-black focus:ring-black"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-neutral-50 border-t border-neutral-100 pt-6">
            <Button type="submit" className="w-full" isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Security Warning</p>
          <p>API keys are stored securely in the database. Ensure your Bitkub API keys have restricted permissions (e.g., only "Read" and "Trade", no "Withdrawal" unless strictly necessary).</p>
        </div>
      </div>
    </div>
  );
}
