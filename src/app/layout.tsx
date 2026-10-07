import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laporan Abnormality Fasilitas Umum",
  description: "Sistem monitoring dan pelaporan temuan abnormality di fasilitas umum perusahaan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        {/* Global Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Shield icon */}
              <svg
                className="w-6 h-6 text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-semibold text-text text-sm sm:text-base leading-tight">
                Laporan <span className="text-accent">Abnormality</span>
              </span>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium text-text-muted">
              <Link href="/cek-status" className="hover:text-accent transition-colors">
                Cek Status
              </Link>
              <Link
                href="/"
                className="hover:text-accent transition-colors hidden sm:inline"
              >
                Buat Laporan
              </Link>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-white mt-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} Sistem Laporan Abnormality Fasilitas Umum
          </div>
        </footer>
      </body>
    </html>
  );
}
