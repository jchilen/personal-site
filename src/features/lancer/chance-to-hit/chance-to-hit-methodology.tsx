export function ChanceToHitMethodology() {
    return (
        <>
            <p>
                Every attack is a d20 roll plus your attack bonus, against the
                target’s defense. Weapon attacks roll against Evasion; smart
                weapons and tech attacks roll against E-Defense. Meet or beat it
                and you hit.
            </p>
            <p>
                Your attack bonus is your Grit, which is half your License
                Level, rounded up. Tech attacks also add your frame’s Tech
                Attack and your Systems. Flat bonus covers anything else that
                adds straight to the roll.
            </p>
            <p>
                Accuracy and Difficulty cancel each other out, one for one. For
                whatever is left, you roll that many d6 and add the highest
                (Accuracy) or subtract it (Difficulty). Lock On and a Prone
                target each give 1 Accuracy. Soft cover gives 1 Difficulty, hard
                cover gives 2, and Impaired and Engaged give 1 each. Tech
                attacks ignore cover and Engaged.
            </p>
            <p>
                Rather than counting a die as its average, the calculator tries
                every d20 face against every possible highest die, and weighs
                each pair by how likely it is. That keeps the odds exact, even
                near the edges. Against Evasion 6 with 1 Accuracy, 110 of the
                120 pairs hit, for 91.7%, where the +3.5 shortcut would say
                92.5%.
            </p>
            <p>
                A total of 20 or more is a critical hit, as long as the attack
                hits. Tech attacks can only crit with certain Frontier Foundry
                abilities, so their crit chance assumes you have one.
            </p>
            <p>
                An Invisible target makes half of all attacks miss before you
                roll, so both chances are halved.
            </p>
            <p>
                Enemy defenses come from the Original and Rebake NPC lists, at
                the tier you pick. [Which NPCs are left out, and why.] The
                picker’s percentages and the average leave out each enemy’s own
                effects, since those only apply to its card.
            </p>
            <p>
                Your settings and chosen enemies are saved in this browser, so
                they’re still there next time.
            </p>
        </>
    )
}
