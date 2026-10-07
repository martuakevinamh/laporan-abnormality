"use client";

import { useState, useTransition } from "react";
import { saveSettingsAction } from "../notificationActions";

type SettingsFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSettings: any;
};

export default function SettingsFormClient({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    alert_high_days: initialSettings?.alert_high_days || 1,
    alert_medium_days: initialSettings?.alert_medium_days || 2,
    alert_low_days: initialSettings?.alert_low_days || 3,
    update_investigating_days: initialSettings?.update_investigating_days || 7,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setForm(prev => ({ ...prev, [e.target.name]: val }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await saveSettingsAction(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-text border-b border-border pb-2">Status: Reported</h3>
        <p className="text-sm text-text-muted">Batas waktu hari kerja sebelum laporan ditandai Terlambat.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text">Bahaya Tinggi (Hari)</label>
            <input 
              type="number" 
              name="alert_high_days"
              min="1"
              value={form.alert_high_days}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text">Bahaya Sedang (Hari)</label>
            <input 
              type="number" 
              name="alert_medium_days"
              min="1"
              value={form.alert_medium_days}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-text">Bahaya Rendah (Hari)</label>
            <input 
              type="number" 
              name="alert_low_days"
              min="1"
              value={form.alert_low_days}
              onChange={handleChange}
              className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-lg text-text border-b border-border pb-2">Status: Investigating</h3>
        <p className="text-sm text-text-muted">Batas waktu sebelum status investigasi tanpa update dianggap harus ditindaklanjuti.</p>
        
        <div className="max-w-xs space-y-1">
          <label className="text-sm font-semibold text-text">Batas Waktu (Hari)</label>
          <input 
            type="number" 
            name="update_investigating_days"
            min="1"
            value={form.update_investigating_days}
            onChange={handleChange}
            className="w-full p-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button 
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-accent hover:bg-blue-600 text-white font-medium rounded transition-colors disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
        {success && <span className="text-sm font-medium text-green-600">Berhasil disimpan!</span>}
      </div>
    </form>
  );
}
