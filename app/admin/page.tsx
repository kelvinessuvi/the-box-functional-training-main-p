import { AdminLogin } from "@/components/admin/admin-login"

export const dynamic = "force-dynamic"

export default function AdminLoginPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-3xl px-4">
      <AdminLogin />
    </main>
  )
}
