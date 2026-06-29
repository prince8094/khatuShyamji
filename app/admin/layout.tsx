import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Khatu Shyam Ji · Temple Operations Command Center",
  description:
    "Admin Portal for Khatu Shyam Ji Digital Pilgrimage Platform. Manage temple operations, accommodation, parking, traffic, lost & found, seva, donations, and emergency response.",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
