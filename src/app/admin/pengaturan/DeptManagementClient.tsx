"use client";

import { useState, useTransition } from "react";
import { toggleDepartmentStatus, addDepartment } from "./deptActions";
import { Button, Input } from "@/components/ui";

interface Dept {
  id: string;
  name: string;
  is_active: boolean;
}

export default function DeptManagementClient({ initialDepartments }: { initialDepartments: Dept[] }) {
  const [isPending, startTransition] = useTransition();
  const [newDept, setNewDept] = useState("");

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleDepartmentStatus(id, !currentStatus);
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    
    startTransition(async () => {
      const res = await addDepartment(newDept.trim());
      if (res.success) {
        setNewDept("");
      } else {
        alert("Gagal menambah departemen: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-border pb-4">
        <h3 className="font-semibold text-lg text-text">Daftar Departemen</h3>
        <p className="text-sm text-text-muted">Kelola departemen yang dapat dipilih oleh pelapor.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1">
          <Input 
            placeholder="Nama Departemen Baru" 
            value={newDept} 
            onChange={e => setNewDept(e.target.value)}
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending || !newDept.trim()}>
          {isPending ? "Proses..." : "Tambah"}
        </Button>
      </form>

      <div className="bg-bg rounded-lg border border-border overflow-hidden">
        <ul className="divide-y divide-border">
          {initialDepartments.map((dept) => (
            <li key={dept.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <span className={`font-medium ${dept.is_active ? "text-text" : "text-text-muted line-through"}`}>
                {dept.name}
              </span>
              <button
                onClick={() => handleToggle(dept.id, dept.is_active)}
                disabled={isPending}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${
                  dept.is_active 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                {dept.is_active ? "Aktif" : "Nonaktif"}
              </button>
            </li>
          ))}
          {initialDepartments.length === 0 && (
            <li className="p-4 text-center text-text-muted text-sm">Belum ada departemen.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
