import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const root = window.document.documentElement

    // Remove old classes
    root.classList.remove('light', 'dark')

    // Add new class
    root.classList.add(theme)

    // Save preference
    localStorage.setItem('career-spark-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => (current === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
