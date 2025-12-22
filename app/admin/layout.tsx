import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Painel Administrativo - THE BOX Functional Training",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children as any
}
