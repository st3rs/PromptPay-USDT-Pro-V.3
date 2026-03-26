import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useI18n } from "@/src/context/I18nContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { formatDate } from "@/src/lib/utils";
import { Search, User as UserIcon, Shield, MoreVertical, Mail, Calendar, Trash2, AlertCircle } from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";

export function AdminUsersPage() {
  const { token } = useAuth();
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } catch (err) {
        console.error("Failed to fetch admin users", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  const handleUpdateRole = async (id: string, role: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, role: updated.role } : u));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        setUserToDelete(null);
      } else {
        const err = await res.json();
        setError(err.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    customers: users.filter(u => u.role === "CUSTOMER").length,
    newThisMonth: users.filter(u => {
      const date = new Date(u.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Admin: Users</h1>
          <p className="text-neutral-500">Manage application users and roles</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-2xl font-bold text-black">{stats.total}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Administrators</p>
            <h3 className="text-2xl font-bold text-black">{stats.admins}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white border-neutral-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Customers</p>
            <h3 className="text-2xl font-bold text-black">{stats.customers}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">New This Month</p>
            <h3 className="text-2xl font-bold text-blue-700">+{stats.newThisMonth}</h3>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Search by Name or Email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px] md:min-w-full border-collapse">
              <thead className="text-[11px] font-serif italic uppercase tracking-wider text-neutral-400 bg-neutral-50/50 border-y border-neutral-100">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Joined Date</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">Orders</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-mono">
                      LOADING_USERS...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-mono">
                      NO_USERS_FOUND
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-neutral-900 hover:text-white transition-all duration-200 cursor-pointer border-b border-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs font-mono group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                            <span className="text-[10px] opacity-50 font-mono uppercase tracking-tighter truncate max-w-[120px] sm:max-w-none">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === "ADMIN" ? "destructive" : "secondary"} className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-none">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs opacity-50 hidden sm:table-cell">{formatDate(user.createdAt, locale)}</td>
                      <td className="px-6 py-4 font-mono text-xs hidden lg:table-cell">{user._count?.orders || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] font-bold uppercase tracking-widest px-2 sm:px-3 rounded-none border border-transparent group-hover:border-white/20 group-hover:text-white"
                            onClick={(e) => { e.stopPropagation(); handleUpdateRole(user.id, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN"); }}
                          >
                            <Shield className="w-3.5 h-3.5 sm:mr-2" />
                            <span className="hidden sm:inline">{user.role === "ADMIN" ? "Make Customer" : "Make Admin"}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none"
                            onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); }}
                            disabled={user._count?.orders > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={!!userToDelete} 
        onClose={() => { setUserToDelete(null); setError(null); }} 
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => { setUserToDelete(null); setError(null); }}>Cancel</Button>
            <Button variant="danger" onClick={() => userToDelete && handleDeleteUser(userToDelete)} isLoading={isLoading}>Delete</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-neutral-600">Are you sure you want to delete this user? This action can only be performed if the user has no transaction history.</p>
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
