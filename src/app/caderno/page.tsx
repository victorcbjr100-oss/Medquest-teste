import Sidebar from '@/components/Sidebar'

export default function CadernoPage() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Meu Caderno</div>
          <div className="page-sub">Anotações e flashcards</div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📓</div>
          <div className="empty-title">Caderno vazio</div>
          <div className="empty-sub">Adicione anotações e flashcards durante os estudos.</div>
        </div>
      </div>
    </div>
  )
}
