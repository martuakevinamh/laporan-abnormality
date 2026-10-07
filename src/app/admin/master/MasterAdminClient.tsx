"use client";

import { useState } from "react";
import { Card, Button, Select } from "@/components/ui";
import { updateAdmin } from "./adminActions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MasterAdminClient({ initialAdmins }: { initialAdmins: any[] }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, newRole: string, newStatus: boolean) => {
    setLoadingId(id);
    const result = await updateAdmin(id, newRole, newStatus);
    setLoadingId(null);
    if (result.success) {
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, role: newRole, is_active: newStatus } : a))
      );
    } else {
      alert(result.error);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg text-text-muted font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">Email / Nama</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                  Belum ada data admin.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-text">{admin.name || "Tanpa Nama"}</div>
                    <div className="text-xs text-text-muted">{admin.email || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      value={admin.role}
                      disabled={loadingId === admin.id}
                      onChange={(e) => handleUpdate(admin.id, e.target.value, admin.is_active)}
                      className="min-w-[120px] text-sm py-1.5"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </Select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      disabled={loadingId === admin.id}
                      onClick={() => handleUpdate(admin.id, admin.role, !admin.is_active)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        admin.is_active ? "bg-accent" : "bg-gray-300"
                      } ${loadingId === admin.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          admin.is_active ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {loadingId === admin.id ? (
                      <span className="text-xs text-accent animate-pulse">Menyimpan...</span>
                    ) : (
                      <span className="text-xs text-green-600 font-medium">
                        {admin.is_active ? "Aktif" : "Non-aktif"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
