module gmp {

    export class Character {
        image: crackle.Image

        levelRow: Level
        xp: number
        dead: boolean
        summoningSickness: boolean
        data: CharacterData

        votes: number
        maxVotes: number
        spin: number
        maxSpin: number

        speed: number
        wit: number
        cunning: number
        charisma: number
        flair: number
        resistance: number
        //activeEffects: ActiveEffect[] = []
        itemAttacks: ItemAttack[] = []

        attacks: Attack[] = []

        constructor(public id: string, public level: number, public items: any[], public ai: boolean) {
            this.image = Resources.characterImages[id]
        }
    }

} 