import { fieldLabelClass } from '@/components/field-styles'
import type { ReactNode } from 'react'
import { SectionTitle } from '@/components/section-title'
import type { LancerNpc } from './npc-types'
import { targetDefense, type AttackOdds } from './odds'
import type { PageState } from './settings'

import { percent } from './format'

type FeaturedResultProps = {
    npc: LancerNpc
    settings: PageState
    odds: AttackOdds
    action?: ReactNode
}

export function FeaturedResult({
    npc,
    settings,
    odds,
    action,
}: FeaturedResultProps) {
    const defenseName =
        settings.attackType === 'weapon' ? 'Evasion' : 'E-Defense'

    return (
        <section aria-live="polite" className="border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <SectionTitle>
                    {npc.name} · T{settings.tier}
                </SectionTitle>
                {action}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
                {npc.role} · {defenseName}{' '}
                {targetDefense(npc, settings.attackType, settings.tier)}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-3">
                <p>
                    <span className="block font-heading text-5xl font-semibold text-cat-lancer">
                        {percent(odds.hit)}
                    </span>
                    <span className={fieldLabelClass}>To hit</span>
                </p>
                <p>
                    <span className="block font-heading text-3xl font-semibold">
                        {percent(odds.crit)}
                    </span>
                    <span className={fieldLabelClass}>To crit</span>
                </p>
            </div>
            {settings.invisible && (
                <p className="mt-3 text-sm text-muted-foreground">
                    Invisible: 50% of attacks miss before rolling.
                </p>
            )}
            {settings.attackType === 'tech' && (
                <p className="mt-2 text-sm text-muted-foreground">
                    Tech attacks can only crit with certain Frontier Foundry
                    abilities.
                </p>
            )}
        </section>
    )
}

type AverageResultProps = {
    label: string
    odds: AttackOdds
}

export function AverageResult({ label, odds }: AverageResultProps) {
    return (
        <section className="border bg-card p-4">
            <SectionTitle>{label}</SectionTitle>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-8 gap-y-1">
                <span>
                    <span className="font-heading text-2xl font-semibold">
                        {percent(odds.hit)}
                    </span>{' '}
                    <span className={fieldLabelClass}>Hit</span>
                </span>
                <span>
                    <span className="font-heading text-xl font-semibold">
                        {percent(odds.crit)}
                    </span>{' '}
                    <span className={fieldLabelClass}>Crit</span>
                </span>
            </p>
        </section>
    )
}
