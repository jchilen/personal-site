// The shapes our API returns, so pages can type what useApi gives them

export type MyPoll = {
    id: string
    title: string
    expectedVoters: number
    ballotCount: number
    createdAt: number
    closed: boolean
}

export type MyPollsResponse = { polls: MyPoll[] }
