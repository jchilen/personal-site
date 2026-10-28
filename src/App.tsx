import { Footer } from '@/components/footer'
import { ModeToggle } from '@/components/mode-toggle'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { HomePage } from '@/pages/home/home-page'
import { SafeLeadPage } from '@/features/safe-lead/safe-lead-page'
import { ConfidencePage } from '@/features/confidence/confidence-page'
import { ImprovingEfficientlyPage } from '@/features/articles/improving-efficiently/improving-efficiently-page'
import { ComingSoonPage } from '@/pages/coming-soon-page'

function App() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return (
        <div className="flex min-h-svh flex-col overflow-x-clip">
            <ModeToggle className="fixed top-4 right-4 z-20 max-sm:hidden" />
            <main
                key={pathname}
                className="mx-auto w-full max-w-280 flex-1 px-6"
            >
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/tools/safe-lead-calculator"
                        element={<SafeLeadPage />}
                    />
                    <Route
                        path="/tools/confidence-calculator"
                        element={<ConfidencePage />}
                    />
                    <Route
                        path="/articles/the-article"
                        element={<ImprovingEfficientlyPage />}
                    />
                    <Route path="*" element={<ComingSoonPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App
