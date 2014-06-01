module gmp {

    export class Character {
        image: crackle.Image

        xp: number
        data: CharacterTemplate

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

        attacks: Attack[] = []

        dead: boolean = false
        summoningSickness: boolean = true
        accumulatedSpinDamage: number = 0
        savedVotes: number = 0
        activeEffects: ActiveEffect[] = []

        constructor(public id: string, public level: number, public itemAttacks: ItemAttack[], public ai: boolean) {
            this.image = Resources.characterImages[id]
            var data = this.data = gameData.characters[id]
            
            var levelData = gameData.levels[level - 1]
            this.xp = levelData.xp
            if (ai) {
                this.votes = this.maxVotes = this.calcStat(data.votesBase, data.votesLvl)
                this.spin = this.maxSpin = this.calcStat(data.spinBase, data.spinLvl)
            } else {
                this.votes = this.maxVotes = levelData.votes
                this.maxSpin = levelData.spin
                this.spin = 0
            }

            this.speed = this.calcStat(data.speedBase, data.speedLvl)
            this.wit = this.calcStat(data.witBase, data.witLvl)
            this.cunning = this.calcStat(data.cunningBase, data.cunningLvl)
            this.charisma = this.calcStat(data.charismaBase, data.charismaLvl)
            this.flair = this.calcStat(data.flairBase, data.flairLvl)
            this.resistance = 0

            if (ai) 
                this.attacks = data.attacks
            else
                this.attacks = data.attacks.slice()
        }

        calcStat(base: number, exp: number) {
            return base + (this.level - 1) * exp
        }

        addActiveEffect(activeEffect: ActiveEffect) {
            if (this.activeEffects.findFirst((ae) => ae.effect == activeEffect.effect) != null)
                return

            this.activeEffects.push(activeEffect)
            activeEffect.apply(this)
            console.log('add effect ' + activeEffect.effect.id + ' to ' + this.data.id)

            if (activeEffect.rounds == 0)
                this.removeActiveEffect(activeEffect)
        }

        removeActiveEffect(activeEffect: ActiveEffect) {
            activeEffect.unapply(this)
            this.activeEffects.remove(activeEffect)
            console.log('remove effect ' + activeEffect.effect.id + ' from ' + this.data.id)
        }

        removeAllActiveEffects() {
            this.activeEffects.slice().forEach((ae) => {
                this.removeActiveEffect(ae)
            })
        }
    }

} 