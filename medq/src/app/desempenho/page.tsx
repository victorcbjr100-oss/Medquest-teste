import Sidebar from '@/components/Sidebar'

export default function DesempenhoPage() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Desempenho Inteligente</div>
          <div className="page-sub">Sugestões automáticas baseadas nos seus erros</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🔥</div>
          <div className="empty-title">Dados insuficientes</div>
          <div className="empty-sub">Responda pelo menos 20 questões para ativar as sugestões inteligentes de estudo.</div>
        </div>
      </div>
    </div>
  )
}
