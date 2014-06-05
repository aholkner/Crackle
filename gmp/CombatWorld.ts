/// <reference path="_References.ts" />

module gmp {

    class Floater {
        timeout: number = 1.0
        constructor(public text: string, public x: number, public y: number, public border: crackle.Image[]) {
        }
    }

    export class ActiveEffect {
        constructor(public effect: Effect, public rounds: number) {
        }

        private addValue(character: Character, value: number) {
            var effect = this.effect
            if (effect.attribute == 'spin')
                character.spin = Math.clamp(character.spin + value, 0, character.maxSpin)
            else if (effect.attribute == 'votes') {
                if (game.world instanceof CombatWorld)
                    (<CombatWorld>game.world).applyDamage(character, -value)
                else
                    character.votes = Math.clamp(character.votes + value, 0, character.maxVotes)
            }
            else if (effect.attribute == 'wit')
                character.wit = Math.max(0, character.wit + value)
            else if (effect.attribute == 'cunning')
                character.cunning = Math.max(0, character.cunning + value)
            else if (effect.attribute == 'charisma')
                character.charisma = Math.max(0, character.charisma + value)
            else if (effect.attribute == 'flair')
                character.flair = Math.max(0, character.flair + value)
            else if (effect.attribute == 'resistance')
                character.resistance = Math.max(0, character.resistance + value)
            else if (effect.attribute == 'money')
                game.money = Math.max(0, game.money + value)
        }

        apply(character: Character) {
            var effect = this.effect
            if (effect.func == 'reduce')
                this.addValue(character, -effect.value)
            else if (effect.func == 'add' || effect.func == 'add_permanent')
                this.addValue(character, effect.value)
            else if (effect.func == 'revive') {
                character.votes = Math.floor(character.maxVotes * effect.value);
                (<CombatWorld>game.world).setDead(character, false);
                (<CombatWorld>game.world).addFloater(character, 'Revived!', UI.floaterBorderGrey)
            } else if (effect.func == 'callFriends') {
                var p = effect.attribute.split(':')
                var characterId = p[0]
                var level = parseInt(p[1]);
                (<CombatWorld>game.world).aiSummon(characterId, level, effect.value)
            }
        }

        unapply(character: Character) {
            var effect = this.effect
            if (effect.func == 'reduce')
                this.addValue(character, effect.value)
            else if (effect.func == 'add')
                this.addValue(character, -effect.value)
        }

        update(character: Character) {
            var effect = this.effect
            if (effect.func == 'drain') {
                (<CombatWorld>game.world).addFloater(character, effect.id, UI.floaterBorderGrey, 1)
                this.addValue(character, -effect.value)
            }
        }

    }

    export class CombatWorld extends World {

        encounter: Encounter
        restartCount: number

        private floaters: Floater[]
        activeAttack: Attack
        activeTargets: Character[]

        characters: Character[]
        currentCharacterIndex: number

        aiItemAttacks: ItemAttack[]
        slots: Slot[]

        constructor(mapId: string, encounterId: string) {
            super(mapId)
            this.encounter = gameData.encounters[encounterId]
            game.allies.forEach((ally) => {
                ally.savedVotes = ally.votes
            })
            this.restartCount = 0
        }

        start() {
            var encounter = this.encounter
            this.questName = encounter.name

            this.floaters = []
            this.activeAttack = null
            this.activeTargets = null
            this.currentCharacterIndex = -1

            this.characters = []
            for (var i = 0; i < game.allies.length; ++i) {
                var ally = game.allies[i]
                ally.accumulatedSpinDamage = 0
                this.fillSlot(this.playerSlots[i], ally)
            }

            this.aiItemAttacks = encounter.itemAttacks.slice()
            if (encounter.monster1)
                this.fillSlot(this.monsterSlots[0], new Character(encounter.monster1, encounter.monster1Lvl, this.aiItemAttacks, true))
            if (encounter.monster2)
                this.fillSlot(this.monsterSlots[1], new Character(encounter.monster2, encounter.monster2Lvl, this.aiItemAttacks, true))
            if (encounter.monster3)
                this.fillSlot(this.monsterSlots[2], new Character(encounter.monster3, encounter.monster3Lvl, this.aiItemAttacks, true))
            if (encounter.monster4)
                this.fillSlot(this.monsterSlots[3], new Character(encounter.monster4, encounter.monster4Lvl, this.aiItemAttacks, true))

            this.slots = this.playerSlots.concat(this.monsterSlots)

            this.runScript(this.playerSlots[0].sprite, this.encounter.id)

            if (!this.activeScript)
                this.beginRound()
        }

        restart() {
            this.sprites.splice(0)
            this.slots.forEach((slot) => {
                slot.character = null
            })
            this.popAllMenus()
            this.restartCount += 1
            game.allies.forEach((ally) => {
                ally.dead = false
                if (this.restartCount > 1) {
                    // extra help after second retry
                    ally.votes = ally.maxVotes
                    ally.spin = ally.maxSpin / 2
                } else {
                    ally.votes = Math.max(ally.maxVotes / 2, ally.savedVotes)
                    ally.spin = 0
                }
            })
            this.start()
        }

        get currentCharacter() {
            if (this.currentCharacterIndex >= 0)
                return this.characters[this.currentCharacterIndex]
        }

        fillSlot(slot, character) {
            slot.character = character
            if (character.id == 'lobbyist001' && this.encounter.id == 'p-med-12')
                slot.y = 4
            slot.sprite = new Sprite(character.image, slot.x, slot.y)
            this.sprites.push(slot.sprite)
            this.characters.push(character)
        }

        getSlot(character) {
            return this.slots.findFirst((slot) => {
                return slot.character == character
            })
        }

        beginRound() {
            this.characters.forEach((character) => {
                character.summoningSickness = false
            })
            this.characters.sort((a, b) => (b.speed - a.speed))
            this.currentCharacterIndex = 0
            while (this.currentCharacterIndex < this.characters.length && this.currentCharacter.dead)
                this.currentCharacterIndex += 1
            this.beginTurn()
        }

        getScriptSprite(param): Sprite {
            var slot = this.slots.findFirst((slot) => {
                return slot.character && slot.character.id == param
            })
            if (slot)
                return slot.sprite
            return null
        }

        beginTurn() {
            if (this.currentCharacterIndex >= this.characters.length) {
                this.beginRound()
                return
            }

            // check if character misses turn after effects
            var missTurn = this.currentCharacter.activeEffects.findFirst((ae: ActiveEffect) => ae.effect.func == 'MissTurn') != null

            // update character effects
            this.beginTurnApplyEffect(this.currentCharacter.activeEffects.slice(), 0, missTurn)
        }

        beginTurnApplyEffect(effects: ActiveEffect[], effectIndex: number, missTurn: boolean) {
            if (this.currentCharacter.dead) {
                this.endTurn()
                return
            }

            if (effectIndex >= effects.length) {
                this.beginTurnEndEffects(missTurn)
                return
            }

            var ae = effects[effectIndex]
            ae.rounds -= 1
            console.log('update effect ' + ae.effect.id + ' on ' + this.currentCharacter.id)
            ae.update(this.currentCharacter)
            if (ae.rounds <= 0)
                this.currentCharacter.removeActiveEffect(ae)

            if (this.floaters) {
                // queue up next effect if this one generated a floater
                this.after(1, () => { this.beginTurnApplyEffect(effects, effectIndex + 1, missTurn) })
            } else {
                // otherwise continue immediately
                this.beginTurnApplyEffect(effects, effectIndex + 1, missTurn)
            }
        }

        beginTurnEndEffects(missTurn: boolean) {
            if (this.currentCharacter.dead) {
                this.endTurn()
                return
            }

            // miss turn, do ai or show UI
            if (missTurn) {
                this.activeAttack = gameData.attacks['missturn']
                console.log(this.currentCharacter.id + ' misses turn')
                this.after(2, () => { this.endTurn() })
            } else if (this.currentCharacter.ai) {
                this.after(0.5, () => { this.ai() })
            } else {
                this.pushMenu(new CombatMenuMain(this))
            }
        }

        endTurn() {
            // end attack
            this.activeAttack = null
            this.activeTargets = null

            // check end condition
            var win = true
            var lose = true
            for (var i = 0; i < this.characters.length; ++i) {
                var character = this.characters[i]
                if (!character.dead) {
                    if (character.ai)
                        win = false
                    else
                        lose = false
                }
            }

            if (win)
                this.win()
            else if (lose)
                this.lose()
            else {
                // next character's turn
                this.currentCharacterIndex += 1
                while (this.currentCharacterIndex < this.characters.length &&
                       (this.currentCharacter.dead || this.currentCharacter.summoningSickness)) {
                    this.currentCharacterIndex += 1
                }
                this.beginTurn()
            }
        }

        win() {
            if (this.activeScript)
                this.continueScript()
            else {
                game.pushWorld(new WinCombatWorld(this))
            }
        }

        reset() {
            this.characters.forEach((character) => {
                character.removeAllActiveEffects()
                if (character.dead)
                    character.dead = false
                    character.votes = character.maxVotes / 2
            })
        }

        lose() {
            this.pushMenu(new GameOverMenu(this))
        }

        onDismissDialog() {
            if (!this.activeScript) {
                game.pushWorld(new WinCombatWorld(this))
            }
            super.onDismissDialog()
        }

        ai() {
            var source = this.currentCharacter
            var monsters = this.monsterSlots.map((slot) => slot.character).filter((character) => character != null)

            // list of all affordable attacks
            var attacks = source.attacks.filter((attack) => attack.spinCost <= source.spin)

            // add item attacks
            attacks = attacks.concat(source.itemAttacks
                .map((ia) => ia.attack)
                .filter((attack) => attack.spinCost <= source.spin))

            // filter health gain attacks
            var healthTargets = monsters.filter((character) => !character.dead && character.votes < character.maxVotes)
            var healthGainMax = 0
            if (healthTargets.length > 0)
                healthGainMax = healthTargets.max((character) => character.maxVotes - character.votes)
            attacks = attacks.filter((attack) => attack.healthBenefit <= healthGainMax)

            // filter revive attacks
            var reviveTargets = monsters.filter((monster) => monster.dead)
            if (reviveTargets.length == 0)
                attacks = attacks.filter((attack) => !attack.isRevive)

            // filter summon attacks
            var canSummon = reviveTargets.length > 0 || monsters.length < this.monsterSlots.length
            if (canSummon)
                attacks = attacks.filter((attack) => !attack.isSummon)

            // random choice of attack
            var attack = attacks.weightedChoice((attack) => attack.weight)

            // find applicable targets
            var targetType = attack.targetType
            var slots: Slot[]
            if (targetType == 'AllEnemy')
                slots = this.playerSlots.filter((slot) => slot.character && !slot.character.dead)
            else if (targetType == 'AllFriendly')
                slots = this.monsterSlots.filter((slot) => slot.character && !slot.character.dead)
            else if (targetType == 'DeadFriendly')
                slots = this.monsterSlots.filter((slot) => slot.character && slot.character.dead)
            else if (targetType == 'All')
                slots = this.slots.filter((slot) => slot.character && !slot.character.dead)
            else if (targetType == 'None')
                slots = [this.getSlot(source)]
            else
                throw new AssertException('bad targetType')

            // calculate target slots
            slots.sort((a, b) => (a.x - b.x))
            var targetCount = Math.min(attack.targetCount, slots.length)
            var maxSlotIndex = slots.length - targetCount + 1
            var slotIndex = -1

            // choose slot to revive
            if (attack.isRevive) {
                for (var i = 0; i < slots.length; ++i) {
                    var slot = slots[i]
                    if (slot.character.dead) {
                        slotIndex = i
                        break
                    }
                }
            }
            // choose slot for health benefit
            if (slotIndex == -1 && attack.healthBenefit > 0) {
                var bestHealth = 0
                for (var i = 0; i < slots.length; ++i) {
                    var slot = slots[i]
                    var health = slot.character.maxVotes - slot.character.votes
                    if (health > bestHealth) {
                        bestHealth = health
                        slotIndex = i
                    }
                }
            }
            // choose slot randomly
            if (slotIndex == -1)
                slotIndex = Math.randrangeint(0, maxSlotIndex)

            var targets = slots.slice(slotIndex, slotIndex + targetCount).map((slot) => slot.character)
            if (targets.length == 0 || !targets[0])
                throw new AssertException('')

            this.actionAttack(attack, targets)
        }

        aiSummon(characterId: string, level: number, count: number) {
            var didDestroy = false
            for (var i = 0; i < this.monsterSlots.length; ++i) {
                var slot = this.monsterSlots[i]
                if (slot.character && slot.character.dead) {
                    this.sprites.remove(slot.sprite)
                    slot.character = null
                    didDestroy = true
                }
            }

            if (didDestroy)
                this.after(0.5, () => { this.aiSummon2(characterId, level, count) })
            else
                this.aiSummon2(characterId, level, count)
        }

        aiSummon2(characterId: string, level: number, count: number) {
            for (var i = 0; i < this.monsterSlots.length; ++i) {
                var slot = this.monsterSlots[i]
                if (!slot.character) {
                    this.fillSlot(slot, new Character(characterId, level, this.aiItemAttacks, true))
                    count -= 1
                    if (count == 0)
                        return
                }
            }
        }

        actionAttack(attack: Attack, targets: Character[]) {
            this.popAllMenus()

            this.activeAttack = attack
            this.activeTargets = targets
            this.after(1, () => { this.actionAttackStep2() })
        }

        actionAttackStep2() {
            var source = this.currentCharacter
            var attack = this.activeAttack
            var targets = this.activeTargets
            
            var baseStat = 0
            if (!attack.underlyingStat)
                baseStat = 0
            else if (attack.underlyingStat == 'Cunning')
                baseStat = Math.max(source.cunning, 0)
            else if (attack.underlyingStat == 'Wit')
                baseStat = Math.max(source.wit, 0)
            else if (attack.underlyingStat == 'Money') {
                baseStat = Math.max(source.cunning, 0)
                game.money = Math.max(0, game.money - this.encounter.bribeCost)
                console.log(source.id + ' consumed ' + this.encounter.bribeCost + ' money, has ' + game.money + ' remaining')
            } else
                throw new AssertException('invalid underlyingStat')
            
            // health attacks (negative damage) need negative baseStat
            if (attack.baseDamageMin < 0)
                baseStat = -baseStat

            // consume spin
            if (attack.spinCost) {
                source.spin = Math.max(0, source.spin - attack.spinCost)
                console.log(source.id + ' consumed ' + attack.spinCost + ' spin, has ' + source.spin + ' remaining')
            }
            // consume item
            if (source.attacks.indexOf(attack) == -1) {
                console.log(source.id + ' consumed item ' + attack.name)
                ItemAttack.removeAttackFromItemAttackList(source.itemAttacks, attack)
            }

            // apply effects to source
            var criticalFailEffect = null
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.id == 'Critical Fail')
                    criticalFailEffect = effect
                else {
                    var rounds = Math.randrangeint(effect.roundsMin, effect.roundsMax + 1)
                    if (effect.applyToSource) {
                        source.addActiveEffect(new ActiveEffect(effect, rounds))
                    }
                }
            }

            // attack targets
            var criticalFail = true
            var totalDamage = 0
            for (var i = 0; i < targets.length; ++i) {
                var target = targets[i]
                var floaterOffset = 1

                // immunity
                if (target.data.immunities.indexOf(attack) != -1) {
                    this.addFloater(target, 'Immune', UI.floaterBorderGrey)
                    console.log(target.id + ' is immune to ' + attack.name)
                    continue
                }

                // crit
                var modifiers = 0
                if (attack.critChanceMax) {
                    var critChance = Math.randrangeint(attack.critChanceMin, attack.critChanceMax + 1)
                    var critSuccess = Math.randrangeint(0, 100) <= critChance + source.flair
                    console.log('critChance = ' + critChance + ', critSuccess = ' + critSuccess + ', flair = ' + source.flair)
                } else {
                    critSuccess = false
                    console.log('no crit chance calculated')
                }

                // damage
                var damage: number
                if (critSuccess) {
                    this.addFloater(target, 'Critical Hit!', UI.floaterBorderGrey, floaterOffset)
                    floaterOffset += 1
                    console.log('critical hit')
                    damage = baseStat + (attack.critBaseDamage + modifiers)
                } else {
                    damage = baseStat + (Math.randrangeint(attack.baseDamageMin, attack.baseDamageMax + 1) + modifiers)
                }

                if (damage > 0) {
                    // charisma
                    damage = Math.max(0, damage - target.charisma)

                    // resistance and weakness
                    if (target.data.resistance.indexOf(attack) != -1) {
                        this.addFloater(target, 'Resist', UI.floaterBorderGrey, floaterOffset)
                        floaterOffset += 1
                        console.log(target.id + ' is resistant to ' + attack.name)
                        damage -= damage * 0.3
                    } else if (target.data.weaknesses.indexOf(attack) != -1) {
                        this.addFloater(target, 'Weakness', UI.floaterBorderGrey, floaterOffset)
                        floaterOffset += 1
                        console.log(target.id + ' is weak to ' + attack.name)
                        damage += damage * 0.3
                    }
                    // global resistance (defense)
                    if (target.resistance) {
                        this.addFloater(target, 'Defends', UI.floaterBorderGrey, floaterOffset)
                        floaterOffset += 1
                        console.log(target.id + ' defends')
                    }
                    damage -= damage * Math.min(1, target.resistance)
                }

                var triedDamage = attack.baseDamageMin != 0 || attack.baseDamageMax != 0 || attack.critBaseDamage != 0
                if (!triedDamage || damage != 0)
                    criticalFail = false

                // apply damage
                damage = Math.floor(damage)
                if (triedDamage)
                    this.applyDamage(target, damage)

                // apply target effects
                for (var j = 0; j < attack.effects.length; ++j) {
                    var effect = attack.effects[j]
                    var rounds = Math.randrangeint(effect.roundsMin, effect.roundsMax + 1)
                    if (!effect.applyToSource) {
                        target.addActiveEffect(new ActiveEffect(effect, rounds))
                    }
                }
                console.log(source.id + ' attacks ' + target.id + ' with ' + attack.name + ' for ' + damage)

                if (damage > 0)
                    totalDamage += damage
            }

            // award spin for total damage
            if (attack.spinCost == 0)
                this.awardSpin(source, Math.max(0, totalDamage))

            // critical fail effect
            if (criticalFail && criticalFailEffect) {
                console.log('critical fail')
                rounds = Math.randrangeint(effect.roundsMin, criticalFailEffect.roundsMax + 1)
                if (effect.applyToSource) {
                    source.addActiveEffect(new ActiveEffect(criticalFailEffect, rounds))
                    this.addFloater(source, 'Critical Fail', UI.floaterBorderGrey)
                }
            }

            if (this.floaters)
                this.after(2, () => this.endTurn())
            else
                this.after(1, () => this.endTurn())
        }

        applyDamage(target: Character, damage: number) {
            target.votes -= damage
            target.votes = Math.floor(Math.clamp(target.votes, 0, target.maxVotes))

            if (damage >= 0)
                this.addFloater(target, damage.toString(), UI.floaterBorderRed)
            else if (damage < 0)
                this.addFloater(target, (-damage).toString(), UI.floaterBorderGreen)

            if (target.votes == 0) {
                target.votes = 0
                this.setDead(target, true)
            }
        }

        setDead(character: Character, dead: boolean) {
            character.dead = dead
            this.getSlot(character).sprite.effectDead = dead
        }

        awardSpin(target: Character, damage: number) {
            var bonus = (damage + target.accumulatedSpinDamage + Math.max(target.wit, 0)) / 5
            if (bonus <= 0)
                target.accumulatedSpinDamage += damage
            else
                target.accumulatedSpinDamage = 0

            console.log('awarded ' + bonus + ' spin; ' + target.accumulatedSpinDamage + 'left over damage for next time')
            target.spin = Math.min(target.spin + bonus, target.maxSpin)
        }

        addFloater(character: Character, text: string, border: crackle.Image[], offset?: number) {
            if (offset == null)
                offset = 0
            var slot = this.getSlot(character)
            this.floaters.push(new Floater(text, slot.x * this.tileSize * game.mapScale + 16, slot.y * this.tileSize * game.mapScale - offset * 28 - 16, border))
        }

        draw() {
            this.drawWorld()

            var i = -1
            for (var slotIndex = 0; slotIndex < this.slots.length; ++slotIndex) {
                var slot = this.slots[slotIndex]
                if (slot.character) {
                    var x = slot.x * this.tileSize * game.mapScale
                    var y = slot.y * this.tileSize * game.mapScale

                    var barWidth = Math.floor(Math.clamp(slot.character.votes * 32 / slot.character.maxVotes, 0, 32))
                    crackle.drawImage(UI.healthBackgroundImage, x, y - 12, x + 32, y - 8)
                    crackle.drawImage(UI.healthImage, x, y - 12, x + barWidth, y - 8)

                    x += 12
                    y += 56

                    var aes = slot.character.activeEffects.filter((ae) => ae.effect.abbrv ? true : false)
                    if (aes.length > 0) {
                        var ae = aes[Math.floor(crackle.time / 2) % aes.length]
                        UI.drawTextBox(ae.effect.abbrv, x + 4, y + 4, UI.floaterBorderGrey)
                        y += 24
                    }
                }
            }

            for (var slotIndex = 0; slotIndex < this.slots.length; ++slotIndex) {
                var slot = this.slots[slotIndex]
                if (slot.character) {
                    x = slot.x * this.tileSize * game.mapScale + 12
                    y = slot.y * this.tileSize * game.mapScale + 56

                    var aes = slot.character.activeEffects.filter((ae) => ae.effect.abbrv ? true : false)
                    if (aes.length > 0)
                        y += 24

                    if (slot.character == this.currentCharacter)
                        UI.drawCombatSelectionBox(slot.character.data.name, x, y)

                    i += 1
                }
            }

            if (this.activeAttack)
                UI.drawTextBox(this.activeAttack.name, game.width / 2, 64, UI.attackBorder)

            this.floaters.slice().forEach((floater) => {
                floater.timeout -= crackle.timestep
                if (floater.timeout < 0.5)
                    floater.y -= crackle.timestep * 80
                if (floater.timeout < 0)
                    this.floaters.remove(floater)
                else
                    UI.drawTextBox(floater.text, floater.x, Math.floor(floater.y), floater.border)
            })

            this.drawMenu()
            this.drawHud()
            this.drawStats()
        }
    }

} 