import type { ApiState } from '@/hooks/use-api'

/** A poll page's heading: the poll's own title once it loads, the tool's name until then */
export function pollTitle(state: ApiState<{ title: string }>): string {
    return state.status === 'success' ? state.data.title : 'Ranked Choice Poll'
}
