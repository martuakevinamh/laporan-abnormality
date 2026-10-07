"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "./actions";
import { Button, Input, Card } from "@/components/ui";

function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const [errorMsg, setErrorMsg] = useState<string | null>(
    authError === "unauthorized" ? "Sesi Anda telah habis atau Anda tidak memiliki akses admin." : null
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setErrorMsg(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Login Admin</h1>
          <p className="text-text-muted">Masuk ke Portal Laporan Abnormality</p>
        </div>

        <Card padding="lg">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
              {errorMsg}
            </div>
          )}

          <form action={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={isPending}
            >
              {isPending ? "Masuk..." : "Masuk"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-center p-8">Memuat...</p>}>
      <LoginForm />
    </Suspense>
  );
}
