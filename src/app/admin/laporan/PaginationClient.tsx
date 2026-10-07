"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui";

export default function PaginationClient({ total, limit }: { total: number; limit: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(pathname + "?" + params.toString());
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm text-text-muted">
        Menampilkan halaman <span className="font-semibold text-text">{currentPage}</span> dari <span className="font-semibold text-text">{totalPages}</span> ({total} total laporan)
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          className="flex-1 md:flex-none"
          onClick={() => goToPage(currentPage - 1)} 
          disabled={currentPage <= 1}
        >
          Sebelumnya
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 md:flex-none"
          onClick={() => goToPage(currentPage + 1)} 
          disabled={currentPage >= totalPages}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
