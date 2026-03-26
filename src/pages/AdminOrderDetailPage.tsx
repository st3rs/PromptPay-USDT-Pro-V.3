import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import { formatCurrency, formatNumber, formatDate, getStatusColor, cn } from "@/src/lib/utils";
import { AlertCircle, ArrowLeft, CheckCircle2, XCircle, ExternalLink, Copy, Clock, ShieldCheck, User as UserIcon, Wallet, Hash, FileText, History } from "lucide-react";

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUsdtSentModal, setShowUsdtSentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setTxHash(data.txHash || "");
          setAdminNote(data.adminNote || "");
        }
      } catch (err) {
        console.error("Failed to fetch admin order detail", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token && id) fetchOrder();
  }, [token, id]);

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, txHash, adminNote }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }

      const updatedOrder = await res.json();
      
      // Re-fetch to get updated admin actions
      const detailRes = await fetch(`/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (detailRes.ok) {
        setOrder(await detailRes.json());
      } else {
        setOrder(updatedOrder);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }

      navigate("/admin/orders");
    } catch (err: any) {
      setError(err.message);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/admin/orders" className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to All Orders</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400 font-medium">Current Status:</span>
          <Badge className={cn("border px-4 sm:px-6 py-1 sm:py-1.5 text-xs sm:text-sm font-bold shadow-sm uppercase tracking-wider", getStatusColor(order.status))}>
            {t(`orders.status_${order.status.toLowerCase()}`)}
          </Badge>
        </div>
      </div>

      {/* Status Highlight Banner */}
      <div className={cn(
        "p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm", 
        getStatusColor(order.status).replace("text-", "border-").replace("bg-", "bg-opacity-10 bg-")
      )}>
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0", getStatusColor(order.status))}>
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-black">Order is {t(`orders.status_${order.status.toLowerCase()}`)}</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Last updated on {formatDate(order.updatedAt, locale)}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold tracking-tight mb-1">Order ID</p>
          <p className="text-xs sm:text-sm font-mono font-bold truncate max-w-[200px] sm:max-w-none">#{order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Payment Proof
              </CardTitle>
              <CardDescription>Review the customer's payment slip</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {order.proofImageUrl ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-sm border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    <img 
                      src={order.proofImageUrl} 
                      alt="Payment Slip" 
                      className="w-full h-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <a 
                    href={order.proofImageUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="mt-4 text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View Full Image
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-xl p-12 text-center">
                  <p className="text-sm text-neutral-400">No payment slip uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Admin Actions
              </CardTitle>
              <CardDescription>Update order status and add transaction details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input 
                  label="Transaction Hash (TxID)" 
                  placeholder="Enter blockchain transaction hash"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Admin Note</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                    placeholder="Add a note for the customer or internal use..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100">
                {order.status === "PAYMENT_UPLOADED" && (
                  <Button 
                    variant="secondary" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateStatus("UNDER_REVIEW")}
                    isLoading={isUpdating}
                  >
                    Mark Under Review
                  </Button>
                )}
                
                {["PAYMENT_UPLOADED", "UNDER_REVIEW"].includes(order.status) && (
                  <Button 
                    variant="primary" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => updateStatus("APPROVED")}
                    isLoading={isUpdating}
                  >
                    Approve Payment
                  </Button>
                )}

                {order.status === "APPROVED" && (
                  <Button 
                    variant="primary" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowUsdtSentModal(true)}
                    isLoading={isUpdating}
                    disabled={!txHash}
                  >
                    Mark USDT as Sent
                  </Button>
                )}

                {order.status === "USDT_SENT" && (
                  <Button 
                    variant="primary" 
                    className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                    onClick={() => updateStatus("COMPLETED")}
                    isLoading={isUpdating}
                  >
                    Complete Order
                  </Button>
                )}

                {["PAYMENT_UPLOADED", "UNDER_REVIEW", "PENDING", "AWAITING_PAYMENT"].includes(order.status) && (
                  <>
                    <Button 
                      variant="danger" 
                      className="flex-1 sm:flex-none"
                      onClick={() => updateStatus("REJECTED")}
                      isLoading={isUpdating}
                    >
                      Reject Order
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-amber-600 border-amber-200 hover:bg-amber-50 flex-1 sm:flex-none"
                      onClick={() => updateStatus("EXPIRED")}
                      isLoading={isUpdating}
                    >
                      Expire Order
                    </Button>
                  </>
                )}

                {["REJECTED", "EXPIRED", "PENDING", "AWAITING_PAYMENT"].includes(order.status) && (
                  <Button 
                    variant="outline" 
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 sm:flex-none"
                    onClick={() => setShowDeleteModal(true)}
                    isLoading={isDeleting}
                  >
                    Delete Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-600" />
                Order Timeline
              </CardTitle>
              <CardDescription>History of status changes and administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-neutral-100">
                {order.adminActions && order.adminActions.length > 0 ? (
                  order.adminActions.map((action: any, index: number) => {
                    const isStatusChange = action.action.includes("Status:");
                    let statusColor = "";
                    if (isStatusChange) {
                      const newStatus = action.action.split("->")[1]?.trim();
                      if (newStatus) {
                        statusColor = getStatusColor(newStatus);
                      }
                    }

                    return (
                      <div key={action.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Dot */}
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                          statusColor || "bg-neutral-100 text-neutral-400"
                        )}>
                          {isStatusChange ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        {/* Content */}
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-neutral-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-black text-sm">{action.action}</div>
                            <time className="font-mono text-[10px] text-neutral-400">{formatDate(action.createdAt, locale)}</time>
                          </div>
                          <div className="text-xs text-neutral-500">
                            {action.details} by <span className="font-medium text-black">{action.admin.name || action.admin.email}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-neutral-400 text-sm">No actions logged yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black">{order.user.name}</p>
                  <p className="text-xs text-neutral-500">{order.user.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-1">Wallet Address ({order.network})</p>
                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded border border-neutral-100">
                  <code className="text-[10px] font-mono break-all">{order.walletAddress}</code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(order.walletAddress)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-neutral-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white text-lg">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>THB Amount</span>
                <span className="text-white font-medium">{formatCurrency(order.amountTHB)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Exchange Rate</span>
                <span className="text-white font-medium">1 USDT = {order.exchangeRate} THB</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Network Fee</span>
                <span className="text-white font-medium">{formatNumber(order.networkFeeUSDT)} USDT</span>
              </div>
              <div className="pt-4 border-t border-neutral-800">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-neutral-400">USDT to Send</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(order.finalUSDT || order.estimatedUSDT)}</div>
                    <div className="text-xs text-neutral-500">USDT</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={deleteOrder} isLoading={isDeleting}>Delete</Button>
          </>
        }
      >
        <p className="text-neutral-600">Are you sure you want to delete this order? This action cannot be undone.</p>
      </Modal>

      <Modal 
        isOpen={showUsdtSentModal} 
        onClose={() => setShowUsdtSentModal(false)} 
        title="Confirm USDT Sent"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowUsdtSentModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={async () => {
                await updateStatus("USDT_SENT");
                setShowUsdtSentModal(false);
              }} 
              isLoading={isUpdating}
            >
              Confirm Sent
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Verification Required</p>
              <p>Please verify that you have successfully sent <strong>{formatNumber(order.finalUSDT || order.estimatedUSDT)} USDT</strong> to the customer's wallet address on the <strong>{order.network}</strong> network.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Customer Wallet Address</p>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 font-mono text-xs break-all">
              {order.walletAddress}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Transaction Hash (TxID)</p>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 font-mono text-xs break-all">
              {txHash}
            </div>
          </div>

          <p className="text-sm text-neutral-600">By clicking confirm, the customer will be notified that their USDT has been sent.</p>
        </div>
      </Modal>
    </div>
  );
}
