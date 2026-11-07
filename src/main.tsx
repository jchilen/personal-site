import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { IconContext } from '@phosphor-icons/react'
import { TooltipProvider } from '@/components/ui/tooltip'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <IconContext.Provider value={{ weight: 'light' }}>
                    {/* Timing shared by every tooltip: hovering waits 400ms, so passing over a
                        button doesn't flash one, and once one is open its neighbors open right
                        away for 300ms. Keyboard focus opens them immediately */}
                    <TooltipProvider
                        delayDuration={400}
                        skipDelayDuration={300}
                    >
                        <App />
                    </TooltipProvider>
                </IconContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    </StrictMode>,
)
