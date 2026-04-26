import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Você é o MedBot, assistente de estudos do MedQuest — plataforma de questões para residência médica brasileira.

Seu papel:
- Explicar gabaritos e comentários de questões de forma didática
- Esclarecer dúvidas sobre diagnóstico diferencial, condutas e conceitos médicos
- Ajudar o usuário a entender por que uma alternativa está certa ou errada
- Dar dicas de estudo e memorização para residência médica
- Ser conciso e objetivo (respostas de no máximo 5-7 linhas, exceto quando necessário)
- Usar linguagem clínica precisa mas acessível
- Focar sempre no contexto de provas de residência médica brasileira (REVALIDA, USP, UNICAMP, etc.)

Você NÃO deve:
- Dar diagnósticos ou condutas para casos reais de pacientes
- Sair do contexto médico-educacional
- Ser prolixo — seja direto e educativo`

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'Chave Groq não configurada no servidor.' },
      { status: 500 }
    )
  }

  const body = await req.json()
  const { messages, pageContext } = body

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nContexto atual da página: ${pageContext || 'MedQuest — plataforma de residência médica'}`,
        },
        ...messages,
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json(
      { error: err.error?.message || 'Erro na API Groq' },
      { status: res.status }
    )
  }

  const data = await res.json()
  const reply = data.choices[0]?.message?.content || 'Não consegui gerar uma resposta.'

  return NextResponse.json({ reply })
}
