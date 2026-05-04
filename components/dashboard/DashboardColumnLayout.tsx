interface DashboardColumnLayoutProps {
  mainColumn: React.ReactNode
  rightColumn: React.ReactNode
}

export default function DashboardColumnLayout({
  mainColumn,
  rightColumn,
}: DashboardColumnLayoutProps) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
        <div className="min-w-0">{mainColumn}</div>
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          {rightColumn}
        </aside>
      </div>
    </div>
  )
}
