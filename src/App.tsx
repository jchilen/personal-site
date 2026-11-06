import { Footer } from '@/components/footer'
import { ModeToggle } from '@/components/mode-toggle'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { HomePage } from '@/pages/home/home-page'
import { SafeLeadPage } from '@/features/tools/safe-lead/safe-lead-page'
import { ConfidencePage } from '@/features/tools/confidence/confidence-page'
import { PollsPage } from '@/features/tools/polls/polls-page'
import { BallotPage } from '@/features/tools/polls/ballot-page'
import { ImprovingEfficientlyPage } from '@/features/articles/improving-efficiently/improving-efficiently-page'
import { PortfolioPage } from '@/features/articles/portfolio/portfolio-page'
import { ComingSoonPage } from '@/pages/coming-soon-page'
import { AdminPage } from '@/features/tools/polls/admin-page'
import { ResultsPage } from '@/features/tools/polls/results-page'
import { ChanceToHitPage } from '@/features/lancer/chance-to-hit/chance-to-hit-page'
import { cn } from 'cn'
import {
    headerMotionClass,
    hiddenHeaderClass,
} from '@/components/header-styles'
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll'

function App() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    // The theme toggle slides away with the hex bar
    const headerHidden = useHideOnScroll()

    return (
        <div className="flex min-h-svh flex-col overflow-x-clip">
            <ModeToggle
                className={cn(
                    'fixed top-4 right-4 z-20 max-sm:hidden',
                    headerMotionClass,
                    headerHidden && hiddenHeaderClass,
                )}
            />
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
                    <Route path="/tools/polls" element={<PollsPage />} />
                    <Route path="/tools/polls/:id" element={<BallotPage />} />
                    <Route
                        path="/tools/polls/:id/admin"
                        element={<AdminPage />}
                    />
                    <Route
                        path="/tools/polls/:id/results"
                        element={<ResultsPage />}
                    />
                    <Route
                        path="/lancer/chance-to-hit"
                        element={<ChanceToHitPage />}
                    />
                    <Route
                        path="/articles/the-article"
                        element={<ImprovingEfficientlyPage />}
                    />
                    <Route
                        path="/articles/portfolio"
                        element={<PortfolioPage />}
                    />
                    <Route path="*" element={<ComingSoonPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App
