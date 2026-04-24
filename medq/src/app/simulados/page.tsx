import Sidebar from '@/components/Sidebar'

export default function SimuladosPage() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div className="empty-icon">🚧</div>
          <div className="empty-title">Simulados</div>
          <div className="empty-sub">
            Esta funcionalidade estará disponível na próxima atualização. Aguarde!
          </div>
        </div>
      </div>
    </div>
  )
}
