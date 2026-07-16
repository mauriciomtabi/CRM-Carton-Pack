import { Sidebar } from '@/components/layout/Sidebar'

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
