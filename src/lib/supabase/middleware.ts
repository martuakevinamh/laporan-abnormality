import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Protected routes logic
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { data: { user } } = await supabase.auth.getUser();

    // Jika belum login dan mencoba akses selain /admin/login, arahkan ke login
    if (!user && request.nextUrl.pathname !== "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // Jika sudah login, pastikan dia adalah admin yang aktif
    if (user) {
      const { data: adminData } = await supabase
        .from("admins")
        .select("id, is_active")
        .eq("id", user.id)
        .single();

      const isActiveAdmin = adminData && adminData.is_active;

      // Jika mencoba login padahal sudah aktif, arahkan ke dashboard
      if (isActiveAdmin && request.nextUrl.pathname === "/admin/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }

      // Jika bukan admin aktif tapi mencoba akses halaman admin selain login
      if (!isActiveAdmin && request.nextUrl.pathname !== "/admin/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("error", "unauthorized");
        // Hapus sesi pengguna yang tidak valid
        await supabase.auth.signOut();
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
