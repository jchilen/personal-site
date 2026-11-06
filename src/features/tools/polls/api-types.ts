// The shapes our API returns. The Worker checks each response against these with `satisfies`,
// so the pages' `useApi<T>` types can't drift from what the server sends
import type { PollResults } from './results'

export type MyPoll = {
    id: string
    title: string
    expectedVoters: number
    ballotCount: number
    createdAt: number
    closed: boolean
}

export type MyPollsResponse = { polls: MyPoll[] }
export type CreatedPoll = { id: string; adminToken: string }

export type PollInfo = {
    id: string
    title: string
    options: string[]
    expectedVoters: number
    expiresAt: number
    closed: boolean
    hasVoted: boolean
}

export type PollStatus = {
    title: string
    ballotCount: number
    expectedVoters: number
    closed: boolean
    expiresAt: number
}

export type PollResultsResponse = {
    title: string
    options: string[]
    expectedVoters: number
    results: PollResults
}

export type VotedPoll = { id: string; title: string; closed: boolean }

export type VotedPollsResponse = { polls: VotedPoll[] }
