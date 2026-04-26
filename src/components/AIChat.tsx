'use client'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePageContext } from '@/context/PageContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function getPageContext(pathname: string): string {
  if (pathname === '/dashboard') return 'Página inicial com resumo de desempenho do usuário'
  if (pathname.startsWith('/temas')) return 'Navegando por temas e especialidades médicas'
  if (pathname.startsWith('/questoes')) return 'Respondendo questões de medicina para residência. O usuário pode ter dúvidas sobre o gabarito, diagnóstico diferencial ou conceito da questão.'
  if (pathname.startsWith('/simulados')) return 'Realizando simulado cronometrado de prova de residência médica'
  if (pathname === '/estatisticas') return 'Visualizando estatísticas de desempenho por especialidade'
  if (pathname === '/desempenho') return 'Analisando desempenho inteligente com sugestões de melhora'
  if (pathname === '/favoritas') return 'Revisando questões favoritas salvas'
  return 'Usando o MedQuest, plataforma de questões para residência médica'
}

const SUGGESTIONS_DEFAULT = [
  'Explique o gabarito da última questão',
  'Qual o diferencial entre FA e flutter atrial?',
  'Como memorizar os critérios de Framingham?',
  'Me dê dicas para estudar Cardiologia',
]

export default function AIChat() {
  const pathname = usePathname()
  const { pageData } = usePageContext()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (pathname === '/login' || pathname === '/auth/callback') return null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError('')

    // Monta contexto rico com dados da questão atual se disponível
    let richContext = getPageContext(pathname)
    if (pageData.questaoAtual) {
      const q = pageData.questaoAtual
      const altsTexto = q.alternativas
        .sort((a, b) => a.letra.localeCompare(b.letra))
        .map(a => `  ${a.letra}) ${a.texto}${a.correta ? ' ← CORRETA' : ''}`)
        .join('\n')

      richContext = `O usuário está respondendo uma questão de ${q.tema || 'medicina'} — subtema: ${q.subtema || ''}.
${q.origem ? `Origem: ${q.origem}` : ''}
${q.respondida ? `O usuário JÁ RESPONDEU esta questão. Resposta correta: ${q.respostaCorreta}` : 'O usuário AINDA NÃO respondeu esta questão.'}

QUESTÃO ATUAL:
${q.enunciado}

ALTERNATIVAS:
${altsTexto}
${q.comentario ? `\nCOMENTÁRIO DO GABARITO:\n${q.comentario}` : ''}

Use essas informações para responder as dúvidas do usuário sobre esta questão específica.`
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          pageContext: richContext,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao contatar o servidor')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      setError(e.message || 'Erro de conexão. Tente novamente.')
    }

    setLoading(false)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir assistente MedBot"
        style={{
          position: 'fixed',
          bottom: open ? 428 : 24,
          right: 24,
          width: 54, height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 4px 20px rgba(74,144,226,.5)',
          transition: 'bottom 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.2s ease, box-shadow 0.2s ease',
          zIndex: 200,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(74,144,226,.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,226,.5)'
        }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat box */}
      <div style={{
        position: 'fixed',
        bottom: 90,
        right: 24,
        width: 365,
        height: 490,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 12px 48px rgba(0,0,0,.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 199,
        border: '1px solid #E4E8F0',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1117 0%, #1A1D27 100%)',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' }}>MedBot</div>
            <div style={{ fontSize: 11, color: '#6B7A99', marginTop: 1 }}>
              Assistente de estudos • IA
            </div>
          </div>
          {/* Indicador online */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#50C878',
              boxShadow: '0 0 0 2px rgba(80,200,120,.3)',
            }} />
            <span style={{ fontSize: 11, color: '#50C878', fontWeight: 500 }}>Online</span>
          </div>
        </div>

        {/* Mensagens */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {/* Estado inicial */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🩺</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
                Olá! Sou o MedBot.
              </div>
              <div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>
                Pergunte sobre qualquer questão, gabarito, diagnóstico diferencial ou conceito médico.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(pageData.questaoAtual ? ["Explique o gabarito desta questão","Por que as outras alternativas estão erradas?","Qual o conceito-chave desta questão?","Me dê uma dica de memorização"] : SUGGESTIONS_DEFAULT).map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{
                      background: '#F4F6FA', border: '1px solid #E4E8F0',
                      borderRadius: 9, padding: '9px 13px', fontSize: 12.5,
                      color: '#4A90E2', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      textAlign: 'left', transition: 'all 0.15s', fontWeight: 500,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#EBF3FD'
                      e.currentTarget.style.borderColor = '#4A90E2'
                      e.currentTarget.style.transform = 'translateX(3px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#F4F6FA'
                      e.currentTarget.style.borderColor = '#E4E8F0'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens do chat */}
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 8,
              animation: 'msgIn 0.2s ease',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, marginTop: 2,
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #4A90E2, #5B6EF5)'
                  : '#F4F6FA',
                color: msg.role === 'user' ? '#fff' : '#111827',
                fontSize: 13.5,
                lineHeight: 1.65,
                fontFamily: 'Inter, sans-serif',
                border: msg.role === 'assistant' ? '1px solid #E4E8F0' : 'none',
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user'
                  ? '0 2px 8px rgba(74,144,226,.3)'
                  : '0 1px 4px rgba(0,0,0,.05)',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'msgIn 0.2s ease' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              }}>🤖</div>
              <div style={{
                background: '#F4F6FA', border: '1px solid #E4E8F0',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF',
                    animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div style={{
              background: '#FDEAEA', border: '1px solid #E85D5D',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 12.5, color: '#E85D5D', lineHeight: 1.6,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #E4E8F0',
          display: 'flex', gap: 8, alignItems: 'center',
          background: '#fff', flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage() }}
            placeholder="Pergunte sobre medicina..."
            disabled={loading}
            style={{
              flex: 1, padding: '10px 14px',
              border: '1.5px solid #E4E8F0', borderRadius: 11,
              fontSize: 13.5, fontFamily: 'Inter, sans-serif',
              outline: 'none', background: '#F4F6FA',
              transition: 'border-color 0.15s, background 0.15s',
              color: '#111827',
            }}
            onFocus={e => { e.target.style.borderColor = '#4A90E2'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#E4E8F0'; e.target.style.background = '#F4F6FA' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 11,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #4A90E2, #5B6EF5)'
                : '#E4E8F0',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, transition: 'all 0.15s', flexShrink: 0,
              boxShadow: input.trim() && !loading ? '0 2px 8px rgba(74,144,226,.35)' : 'none',
            }}
            onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: .4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          /* Chat ocupa mais tela no mobile */
        }
      `}</style>
    </>
  )
}
