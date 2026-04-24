import Sidebar from '@/components/Sidebar'

export default function PerfilPage() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Perfil</div>
          <div className="page-sub">Suas informações pessoais</div>
        </div>
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>RG</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Fraunces, serif' }}>Rafael Guimarães</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>🩺 Residente · Clínica Médica</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Autenticação completa com login será adicionada na próxima versão.<br />
            Por enquanto o progresso é salvo localmente no seu navegador.
          </p>
        </div>
      </div>
    </div>
  )
}
