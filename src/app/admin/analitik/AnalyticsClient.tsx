"use client";

import { useState, useEffect } from "react";
import { fetchAnalyticsData } from "./actions";
import { format, subDays } from "date-fns";
import { Card, Input, Button } from "@/components/ui";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = {
  Rendah: "#3b82f6", // blue-500
  Sedang: "#f59e0b", // amber-500
  Tinggi: "#ef4444", // red-500
};

export default function AnalyticsClient() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    // Add 23:59:59 to endDate to include the whole day
    const res = await fetchAnalyticsData(
      new Date(`${startDate}T00:00:00`).toISOString(),
      new Date(`${endDate}T23:59:59`).toISOString()
    );
    setData(res);
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;
    const fetcher = async () => {
      setIsLoading(true);
      const res = await fetchAnalyticsData(
        new Date(`${startDate}T00:00:00`).toISOString(),
        new Date(`${endDate}T23:59:59`).toISOString()
      );
      if (active) {
        setData(res as Record<string, unknown>);
        setIsLoading(false);
      }
    };
    fetcher();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, monthly, departments, hazards, top_areas } = data as {
    metrics: Record<string, number | string>;
    monthly: Array<Record<string, unknown>>;
    departments: Array<Record<string, unknown>>;
    hazards: Array<{ name: string; value: number }>;
    top_areas: Array<{ area_name: string; total: number }>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analitik Laporan</h1>
          <p className="text-sm text-text-muted mt-1">Ringkasan performa dan data laporan abnormalitas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
          <span className="text-text-muted">-</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
          <Button onClick={loadData} disabled={isLoading}>Terapkan</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-text-muted mb-1">Total Laporan</p>
          <p className="text-3xl font-bold text-text">{metrics.total}</p>
        </Card>
        <Card padding="md" className="flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-text-muted mb-1">Penyelesaian</p>
          <p className="text-3xl font-bold text-green-600">{metrics.resolved_percentage}%</p>
          <p className="text-xs text-text-muted mt-1">{metrics.resolved} laporan</p>
        </Card>
        <Card padding="md" className="flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-text-muted mb-1">Waktu Rata-rata</p>
          <p className="text-3xl font-bold text-text">{metrics.avg_resolution_days}</p>
          <p className="text-xs text-text-muted mt-1">Hari</p>
        </Card>
        <Card padding="md" className="flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-red-500 mb-1">Terlambat</p>
          <p className="text-3xl font-bold text-red-600">{metrics.overdue_count}</p>
          <p className="text-xs text-text-muted mt-1">Melewati Batas</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-bold text-text">Tren Bulanan</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="incoming" name="Masuk" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Selesai" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hazard Level Donut */}
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-bold text-text">Tingkat Bahaya</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazards}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {hazards.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Departments Bar (Horizontal) */}
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-bold text-text">Laporan per Departemen</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="department" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top 5 Areas List */}
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-bold text-text">Top 5 Area Temuan</h2>
          <div className="space-y-3 mt-4">
            {top_areas.length > 0 ? (
              top_areas.map((area, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs">
                      {index + 1}
                    </span>
                    <span className="font-medium text-sm text-text">{area.area_name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-muted">{area.total} lap.</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted text-center py-8">Belum ada data.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
