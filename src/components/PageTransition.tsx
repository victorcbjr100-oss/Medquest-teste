'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [content, setContent] = useState(children)
  const prevPath = useRef(pathname)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (pathname === prevPath.current) {
      setContent(children)
      return
    }
    // Fade out
    setVisible(false)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setContent(children)
      prevPath.current = pathname
      // Fade in
      setVisible(true)
    }, 180)
    return () => clearTimeout(timeoutRef.current)
  }, [pathname, children])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(6px)',
      transition: 'opacity 0.22s ease, transform 0.22s ease',
      willChange: 'opacity, transform',
      minHeight: '100%',
    }}>
      {content}
    </div>
  )
}
