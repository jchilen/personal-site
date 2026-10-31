// The shapes our API returns, so pages can type what useApi gives them
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
}

export type PollResultsResponse = {
    title: string
    options: string[]
    expectedVoters: number
    results: PollResults
}
