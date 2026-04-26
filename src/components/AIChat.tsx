'use client'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Contexto baseado na página atual
function getPageContext(pathname: string): string {
  if (pathname === '/dashboard') return 'O usuário está na página inicial do MedQuest, que mostra seu desempenho geral, questões respondidas e temas mais estudados.'
  if (pathname.startsWith('/temas')) return 'O usuário está navegando pelos temas de medicina para residência médica.'
  if (pathname.startsWith('/questoes')) return 'O usuário está respondendo questões de medicina para residência médica. Pode estar com dúvidas sobre uma questão específica, diagnóstico diferencial, conduta ou conceito médico abordado.'
  if (pathname.startsWith('/simulados')) return 'O usuário está na área de simulados, que simula provas de residência médica com tempo cronometrado.'
  if (pathname === '/estatisticas') return 'O usuário está vendo suas estatísticas de desempenho por especialidade.'
  if (pathname === '/desempenho') return 'O usuário está analisando seu desempenho inteligente, com sugestões de temas para melhorar.'
  if (pathname === '/favoritas') return 'O usuário está revisando suas questões favoritas salvas.'
  if (pathname === '/perfil') return 'O usuário está na página de perfil.'
  return 'O usuário está usando o MedQuest, plataforma de questões para residência médica.'
}

const SYSTEM_PROMPT = `Você é o MedBot, assistente de estudos do MedQuest — plataforma de questões para residência médica brasileira.

Seu papel:
- Explicar gabaritos e comentários de questões de forma didática
- Esclarecer dúvidas sobre diagnóstico diferencial, condutas e conceitos médicos
- Ajudar o usuário a entender por que uma alternativa está certa ou errada
- Dar dicas de estudo e memorização para residência médica
- Ser conciso e objetivo (respostas de no máximo 4-6 linhas, exceto quando necessário)
- Usar linguagem clínica precisa mas acessível
- Focar sempre no contexto de provas de residência médica brasileira (REVALIDA, USP, UNICAMP, etc.)

Você NÃO deve:
- Dar diagnósticos ou condutas para casos reais de pacientes
- Sair do contexto médico-educacional
- Ser prolixo — seja direto e educativo`

export default function AIChat() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [groqKey, setGroqKey] = useState('')
  const [keySet, setKeySet] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Esconde nas páginas de auth
  if (pathname === '/login' || pathname === '/auth/callback') return null

  useEffect(() => {
    // Tenta recuperar chave salva
    const saved = localStorage.getItem('mq_groq_key')
    if (saved) { setGroqKey(saved); setKeySet(true) }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && keySet) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, keySet])

  function saveKey() {
    if (!keyInput.trim()) return
    localStorage.setItem('mq_groq_key', keyInput.trim())
    setGroqKey(keyInput.trim())
    setKeySet(true)
    setKeyInput('')
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const pageCtx = getPageContext(pathname)

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 512,
          temperature: 0.4,
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nContexto atual: ${pageCtx}` },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || 'Erro na API Groq')
      }

      const data = await res.json()
      const reply = data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e: any) {
      const msg = e.message?.includes('401') || e.message?.includes('invalid')
        ? 'Chave inválida. Clique no ⚙️ para atualizar.'
        : 'Erro ao conectar. Tente novamente.'
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${msg}` }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          bottom: open ? 420 : 24,
          right: 24,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          boxShadow: '0 4px 20px rgba(74,144,226,.45)',
          transition: 'bottom 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.2s ease, box-shadow 0.2s ease',
          zIndex: 200,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(74,144,226,.55)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(74,144,226,.45)'
        }}
        title="MedBot — Assistente de estudos"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat box */}
      <div style={{
        position: 'fixed',
        bottom: 88,
        right: 24,
        width: 360,
        height: 480,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 8px 40px rgba(0,0,0,.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 199,
        border: '1px solid #E4E8F0',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F1117, #1A1D27)',
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>MedBot</div>
            <div style={{ fontSize: 11, color: '#6B7A99' }}>Assistente de estudos • Groq AI</div>
          </div>
          {keySet && (
            <button
              onClick={() => setKeySet(false)}
              style={{ background: 'none', border: 'none', color: '#6B7A99', cursor: 'pointer', fontSize: 16, padding: 4 }}
              title="Alterar chave API"
            >⚙️</button>
          )}
        </div>

        {/* Setup da chave */}
        {!keySet ? (
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: '#374151' }}>
              <strong>Configure o MedBot</strong> com sua chave gratuita do Groq:
            </div>
            <ol style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8, paddingLeft: 18 }}>
              <li>Acesse <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#4A90E2' }}>console.groq.com</a></li>
              <li>Crie uma conta gratuita</li>
              <li>Vá em <strong>API Keys → Create API Key</strong></li>
              <li>Cole a chave abaixo</li>
            </ol>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="gsk_..."
              style={{
                padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #E4E8F0', fontSize: 14,
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#4A90E2'}
              onBlur={e => e.target.style.borderColor = '#E4E8F0'}
            />
            <button
              onClick={saveKey}
              disabled={!keyInput.trim()}
              style={{
                background: keyInput.trim() ? '#4A90E2' : '#E4E8F0',
                color: keyInput.trim() ? '#fff' : '#9CA3AF',
                border: 'none', borderRadius: 10, padding: '11px',
                fontSize: 14, fontWeight: 600, cursor: keyInput.trim() ? 'pointer' : 'default',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
              }}
            >
              Ativar MedBot →
            </button>
            <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
              Plano gratuito: 14.400 tokens/min • Salvo localmente
            </div>
          </div>
        ) : (
          <>
            {/* Mensagens */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🩺</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Olá! Sou o MedBot.
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
                    Pergunte sobre qualquer questão, diagnóstico diferencial, conduta ou conceito médico. Estou aqui para ajudar!
                  </div>
                  {/* Sugestões rápidas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
                    {[
                      'Explique o gabarito da última questão',
                      'Qual a diferença entre FA e Flutter atrial?',
                      'Como memorizar os critérios de Framingham?',
                    ].map(s => (
                      <button key={s} onClick={() => setInput(s)}
                        style={{
                          background: '#F4F6FA', border: '1px solid #E4E8F0',
                          borderRadius: 8, padding: '8px 12px', fontSize: 12,
                          color: '#4A90E2', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#EBF3FD'; e.currentTarget.style.borderColor = '#4A90E2' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F4F6FA'; e.currentTarget.style.borderColor = '#E4E8F0' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 8,
                  animation: 'slideUp 0.2s ease',
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '9px 13px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #4A90E2, #6366F1)'
                      : '#F4F6FA',
                    color: msg.role === 'user' ? '#fff' : '#111827',
                    fontSize: 13,
                    lineHeight: 1.65,
                    fontFamily: 'Inter, sans-serif',
                    border: msg.role === 'assistant' ? '1px solid #E4E8F0' : 'none',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4A90E2, #6366F1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
                  }}>🤖</div>
                  <div style={{ background: '#F4F6FA', border: '1px solid #E4E8F0', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF',
                        animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 14px',
              borderTop: '1px solid #E4E8F0',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Pergunte sobre medicina..."
                disabled={loading}
                style={{
                  flex: 1, padding: '9px 13px',
                  border: '1.5px solid #E4E8F0', borderRadius: 10,
                  fontSize: 13, fontFamily: 'Inter, sans-serif',
                  outline: 'none', background: '#F4F6FA',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#4A90E2'}
                onBlur={e => e.target.style.borderColor = '#E4E8F0'}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: input.trim() && !loading ? '#4A90E2' : '#E4E8F0',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {loading ? '⏳' : '➤'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: .4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
