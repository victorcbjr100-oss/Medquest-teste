'use client'
import { createContext, useContext, useState, useCallback } from 'react'

interface PageContextData {
  questaoAtual?: {
    enunciado: string
    alternativas: { letra: string; texto: string; correta: boolean }[]
    comentario?: string
    origem?: string
    tema?: string
    subtema?: string
    respondida?: boolean
    respostaUsuario?: string
    respostaCorreta?: string
  }
  pagina?: string
}

interface PageContextType {
  pageData: PageContextData
  setPageData: (data: PageContextData) => void
  clearPageData: () => void
}

const PageContext = createContext<PageContextType>({
  pageData: {},
  setPageData: () => {},
  clearPageData: () => {},
})

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [pageData, setPageDataState] = useState<PageContextData>({})

  const setPageData = useCallback((data: PageContextData) => {
    setPageDataState(data)
  }, [])

  const clearPageData = useCallback(() => {
    setPageDataState({})
  }, [])

  return (
    <PageContext.Provider value={{ pageData, setPageData, clearPageData }}>
      {children}
    </PageContext.Provider>
  )
}

export const usePageContext = () => useContext(PageContext)
