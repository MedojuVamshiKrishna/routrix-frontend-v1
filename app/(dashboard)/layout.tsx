import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="min-w-0 flex-1 bg-background">{children}</main>
      </div>
    </div>
  )
}
