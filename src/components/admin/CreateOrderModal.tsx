import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { adminCreateOrderSchema, AdminCreateOrderInput } from "@/src/lib/validation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const { t } = useI18n();
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<AdminCreateOrderInput>({
    resolver: zodResolver(adminCreateOrderSchema),
    defaultValues: {
      userId: "",
      amountTHB: 1000,
      exchangeRate: 35.5,
      serviceFeeTHB: 0,
      networkFeeUSDT: 1.0,
      walletAddress: "",
      network: "TRC20",
      paymentMethod: "PROMPTPAY",
      status: "APPROVED",
      customerNote: "",
      adminNote: ""
    }
  });

  useEffect(() => {
    if (isOpen && token) {
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }
  }, [isOpen, token]);

  const onSubmit = async (data: AdminCreateOrderInput) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
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

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    reset();
    setSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Manual Order"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {t(error)}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Order created successfully
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Select User</label>
            <select
              className={`w-full h-10 px-3 rounded-lg border ${errors.userId ? 'border-rose-500' : 'border-neutral-200'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400`}
              {...register("userId")}
            >
              <option value="">Select a user</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            {errors.userId && <p className="text-xs text-rose-500">{t(errors.userId.message || "")}</p>}
          </div>
          <Input
            label="Amount (THB)"
            type="number"
            error={errors.amountTHB?.message}
            {...register("amountTHB", { valueAsNumber: true })}
          />
          <Input
            label="Exchange Rate"
            type="number"
            step="0.01"
            error={errors.exchangeRate?.message}
            {...register("exchangeRate", { valueAsNumber: true })}
          />
          <Input
            label="Service Fee (THB)"
            type="number"
            error={errors.serviceFeeTHB?.message}
            {...register("serviceFeeTHB", { valueAsNumber: true })}
          />
          <Input
            label="Network Fee (USDT)"
            type="number"
            step="0.1"
            error={errors.networkFeeUSDT?.message}
            {...register("networkFeeUSDT", { valueAsNumber: true })}
          />
          <Input
            label="Wallet Address"
            placeholder="0x... or T..."
            error={errors.walletAddress?.message}
            {...register("walletAddress")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Network</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              {...register("network")}
            >
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Payment Method</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
              {...register("paymentMethod")}
            >
              <option value="PROMPTPAY">PromptPay</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Initial Status</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            {...register("status")}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <Input
          label="Customer Note"
          placeholder="Optional note for customer"
          {...register("customerNote")}
        />
        <Input
          label="Admin Note"
          placeholder="Internal admin note"
          {...register("adminNote")}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
