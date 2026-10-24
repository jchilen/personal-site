import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { IconContext } from '@phosphor-icons/react'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider defaultTheme="system" storageKey="theme">
                <IconContext.Provider value={{ weight: 'light' }}>
                    <App />
                </IconContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
