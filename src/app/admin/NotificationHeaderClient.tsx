"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNotifications } from "./notificationActions";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type NotificationItem = {
  id: string;
  report_number: string;
  reporter_name: string;
  created_at: string;
  status: string;
  overdueDays?: number;
};

export default function NotificationHeaderClient() {
  const [unread, setUnread] = useState<NotificationItem[]>([]);
  const [overdue, setOverdue] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setUnread(data.unread as NotificationItem[]);
        setOverdue(data.overdue as NotificationItem[]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const total = unread.length + overdue.length;

  return (
    <>
      {overdue.length > 0 && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm flex items-center justify-between font-medium shadow-sm">
          <span>{overdue.length} laporan melewati batas waktu tindak lanjut!</span>
          <Link href="/admin/laporan?status=Reported" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors text-xs">
            Lihat Laporan
          </Link>
        </div>
      )}

      <div className="flex justify-end p-4 items-center gap-4 border-b border-border bg-white">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            aria-label="Notifikasi"
          >
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {total > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ring-2 ring-white">
                {total > 99 ? "99+" : total}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border shadow-xl rounded-lg overflow-hidden z-50 flex flex-col max-h-[80vh]">
              <div className="px-4 py-3 bg-bg border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-text">Notifikasi</h3>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">{total} Baru</span>
              </div>
              
              <div className="overflow-y-auto flex-1 divide-y divide-border">
                {total === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm flex flex-col items-center">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Semua laporan sudah tertangani.
                  </div>
                ) : (
                  <>
                    {unread.map(item => (
                      <Link 
                        key={`unread-${item.id}`} 
                        href={`/admin/laporan?drawer=${item.id}`} 
                        className="block p-4 hover:bg-blue-50 transition-colors bg-blue-50/30"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-text text-sm">{item.report_number}</span>
                          <span className="text-[10px] text-accent font-bold px-1.5 py-0.5 rounded bg-blue-100">Baru</span>
                        </div>
                        <p className="text-xs text-text-muted">Pelapor: {item.reporter_name}</p>
                        <p className="text-[10px] text-text-muted mt-1">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: idLocale })}</p>
                      </Link>
                    ))}
                    {overdue.map(item => (
                      <Link 
                        key={`overdue-${item.id}`} 
                        href={`/admin/laporan?drawer=${item.id}`} 
                        className="block p-4 hover:bg-red-50 transition-colors bg-red-50/30"
                        onClick={() => setIsOpen(false)}
                      >
                         <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-text text-sm">{item.report_number}</span>
                          <span className="text-[10px] text-red-600 font-bold px-1.5 py-0.5 rounded bg-red-100 shrink-0 text-right max-w-25 leading-tight">
                            Terlambat {item.overdueDays} hari
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">Status: {item.status}</p>
                      </Link>
                    ))}
                  </>
                )}
              </div>
              <div className="p-2 border-t border-border bg-gray-50 text-center">
                <Link href="/admin/laporan" onClick={() => setIsOpen(false)} className="text-xs font-medium text-accent hover:underline">
                  Lihat Semua Laporan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
