export const CAREER_STAGES = [
    { id: 'data', label: 'Data', detail: '2021–23' },
    { id: 'testing', label: 'Testing', detail: 'Since 2024' },
    { id: 'pipeline', label: 'Pipeline', detail: '(Current)' },
    { id: 'development', label: 'Development', detail: '(Current)' },
] as const

export type StageId = (typeof CAREER_STAGES)[number]['id']

export type ExperienceEntry = {
    stage: StageId
    org: string
    title: string
    summary: string
    highlights: string[]
    stack: string[]
}

export const EXPERIENCE: ExperienceEntry[] = [
    {
        stage: 'data',
        org: 'Burns & McDonnell',
        title: 'SQL + analysis',
        summary:
            'Built the data frameworks behind custom, client-specific business plans.',
        highlights: [
            'Developed frameworks to take in, process, and cleanse client data',
            "Modeled generation sources to find the best renewable energy mix for clients' customers",
            'Consolidated legacy data silos into new data-management frameworks',
        ],
        stack: ['SQL Server', 'SQLite', 'KNIME'],
    },
    {
        stage: 'testing',
        org: 'City Lifestyle',
        title: 'Cypress',
        summary:
            'Wrote most of our original end-to-end suite, covering user and staff/admin workflows.',
        highlights: [
            'Wrote 60+ test files on a framework set up by a teammate',
            'Backfilled coverage for every critical workflow and our most-used ones',
        ],
        stack: ['Cypress', 'TypeScript'],
    },
    {
        stage: 'testing',
        org: 'City Lifestyle',
        title: 'Playwright',
        summary:
            'Finished our migration from Cypress to Playwright, which now runs all of our end-to-end testing.',
        highlights: [
            'Took over a partial port and brought 100+ test files to a reliable state',
            'Zero major incidents from shipped code since, down from several per year',
            "Own the team's test-writing patterns and keep them on best practices",
        ],
        stack: ['Playwright', 'TypeScript'],
    },
    {
        stage: 'pipeline',
        org: 'City Lifestyle',
        title: 'CI/CD',
        summary:
            'I keep the test pipeline fast and reliable, and run the checks that gate every release.',
        highlights: [
            'Parallelized Playwright runs (25 → 12 min) and sharded integration and unit tests (30 → 8 min)',
            'Added required checks: critical end-to-end tests on every PR, a smoke test before each production release, and a nightly full regression run',
            'Keep dependencies current with weekly updates',
        ],
        stack: ['GitHub Actions'],
    },
    {
        stage: 'development',
        org: 'City Lifestyle',
        title: 'Vue',
        summary:
            'Taking development tickets: building features and modernizing legacy pages.',
        highlights: [
            'Building admin controls for managing which recruiting emails go out',
            'Converted the new-client account creation flow from PHP to Vue',
            'Fixing bugs across the app',
        ],
        stack: ['Vue', 'TypeScript'],
    },
    {
        stage: 'development',
        org: 'IceNine',
        title: 'React',
        summary: 'Designed, built, and shipped this site.',
        highlights: [
            'React and TypeScript with Tailwind v4',
            'Interactive tools like the CBB safe-lead calculator',
            'Deployed on Cloudflare Workers with automatic builds from GitHub',
        ],
        stack: ['React', 'TypeScript', 'Tailwind', 'Cloudflare'],
    },
]