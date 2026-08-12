import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) redirect("/home");

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center gap-4 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800">
          <Link href="/admin" className="font-semibold text-zinc-900 dark:text-zinc-50">
            관리자
          </Link>
          <Link href="/admin/users" className="text-zinc-500 hover:underline dark:text-zinc-400">
            회원 관리
          </Link>
          <Link href="/admin/payments" className="text-zinc-500 hover:underline dark:text-zinc-400">
            결제 관리
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
