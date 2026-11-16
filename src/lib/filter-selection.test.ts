import { expect, test } from 'vitest'
import { ALL, nextSelection } from './filter-selection'

const options = ['GMS', 'IPS-N', 'SSC']

test('turning an option on from All selects just that option', () => {
    expect(nextSelection([], [ALL, 'SSC'], options)).toEqual(['SSC'])
})

test('more options can be on at once, kept in the order they’re listed', () => {
    expect(nextSelection(['SSC'], ['SSC', 'GMS'], options)).toEqual([
        'GMS',
        'SSC',
    ])
})

test('clicking a selected option turns just that one off', () => {
    expect(nextSelection(['GMS', 'SSC'], ['SSC'], options)).toEqual(['SSC'])
})

test('turning off the last option goes back to All', () => {
    expect(nextSelection(['SSC'], [], options)).toEqual([])
})

test('clicking All turns every option off', () => {
    expect(nextSelection(['GMS', 'SSC'], ['GMS', 'SSC', ALL], options)).toEqual(
        [],
    )
})

test('clicking All while it’s already on keeps it on', () => {
    expect(nextSelection([], [], options)).toEqual([])
})
