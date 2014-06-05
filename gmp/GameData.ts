module gmp {

    export class QuestItem {
        id: string
        name: string
        description: string
    }

    export class Effect {
        id: string
        abbrv: string
        applyToSource: boolean
        func: string
        roundsMin: number
        roundsMax: number
        attribute: string
        value: number
    }

    export class Attack {
        id: string
        name: string
        description: string
        spinCost: number
        targetType: string
        targetCount: number
        underlyingStat: string
        effects: Effect[]
        baseDamageMin: number
        baseDamageMax: number
        critBaseDamage: number
        critChanceMin: number
        critChanceMax: number
        weight: number
        healthBenefit: number
        isRevive: boolean
        isSummon: boolean
    }

    export class CharacterTemplate {
        id: string
        name: string
        votesBase: number
        votesLvl: number
        spinBase: number
        spinLvl: number
        speedBase: number
        speedLvl: number
        witBase: number
        witLvl: number
        cunningBase: number
        cunningLvl: number
        charismaBase: number
        charismaLvl: number
        flairBase: number
        flairLvl: number
        attacks: Attack[]
        immunities: Attack[]
        resistance: Attack[]
        weaknesses: Attack[]
    }

    export class Encounter {
        id: string
        name: string
        monster1: string
        monster1Lvl: number
        monster2: string
        monster2Lvl: number
        monster3: string
        monster3Lvl: number
        monster4: string
        monster4Lvl: number
        itemAttacks: ItemAttack[]
        bribeCost: number
        xp: number
        money: number
        itemAttackDrops: ItemAttack[]
    }

    export class ScriptRow {
        trigger: string
        action: string
        param: string
        dialog: string
    }

    export class ItemAttack {
        constructor(public attack: Attack, public quantity: number) {
        }

        static addAttackToItemAttackList(itemAttacks: ItemAttack[], attack: Attack) {
            for (var i = 0; i < itemAttacks.length; ++i) {
                var ia = itemAttacks[i];
                if (ia.attack == attack) {
                    ia.quantity += 1
                    return
                }
            }
            itemAttacks.push(new ItemAttack(attack, 1))
        }

        static removeAttackFromItemAttackList(itemAttacks: ItemAttack[], attack: Attack) {
            for (var i = 0; i < itemAttacks.length; ++i) {
                var ia = itemAttacks[i];
                if (ia.attack == attack) {
                    ia.quantity -= 1
                    if (ia.quantity == 0)
                        itemAttacks.splice(i, 1)
                    return
                }
            }
        }
    }

    export class Level {
        level: number
        xp: number
        votes: number
        spin: number
        skillPoints: number
    }

    export class Shop {
        id: string
        itemAttack: Attack
        price: number
    }

    export var gameData: GameData

    export class GameData {

        questItems: { [key: string]: QuestItem }
        effects: { [key: string]: Effect }
        attacks: { [key: string]: Attack }
        standardAttacks: { [key: string]: Attack[] }
        characters: { [key: string]: CharacterTemplate }
        encounters: { [key: string]: Encounter }
        script: { [trigger: string]: ScriptRow[] }
        levels: Level[]
        shops: { [key: string]: Shop[] }

        static load() {
            gameData = new GameData()

            var gameDataStorage
            if (window.location.hash.indexOf('import') == -1)
                gameDataStorage = localStorage.getItem('gmp.GameData')

            if (!gameDataStorage) {    
                var spreadsheet = new GoogleSpreadsheet("1y8OUya0OIG5xpHmD2W7xx8lOG-A0Byx8UmSpCEFHd2s", (spreadsheet) => {
                    gameData.importGoogleSpreadsheet(spreadsheet)
                })
            } else {
                var values = JSON.parse(gameDataStorage)
                for (var key in values) {
                    gameData[key] = values[key]
                }
                gameData.link()
            }
        }

        private importGoogleSpreadsheet(spreadsheet: GoogleSpreadsheet) {
            this.questItems = this.importWorksheetIndex(spreadsheet.worksheets['items'], QuestItem, {
                id: 'id',
                name: 'name',
                description: 'description'
            })

            this.effects = this.importWorksheetIndex(spreadsheet.worksheets['effects'], Effect, {
                id: 'id',
                abbrv: 'abbrev',
                applyToSource: 'apply to source',
                func: 'function',
                roundsMin: 'number rounds base',
                roundsMax: 'number rounds max',
                attribute: 'attribute effected',
                value: 'value'
            }, (effect) => {
                effect.applyToSource = effect.applyToSource ? true : false
                effect.roundsMin = parseInt(effect.roundsMin)
                effect.roundsMax = parseInt(effect.roundsMax)
                effect.value = parseFloat(effect.value)
                return effect
            })

            this.attacks = this.importWorksheetIndex(spreadsheet.worksheets['attacks'], Attack, {
                id: 'id',
                name: 'attack name',
                description: 'description',
                spinCost: 'spin cost',
                targetType: 'target type',
                targetCount: 'target count',
                underlyingStat: 'underlying stat',
                effects: 'special effects',
                baseDamageMin: 'base damage',
                baseDamageMax: 'max base damage',
                critBaseDamage: 'crit base damage',
                critChanceMin: 'chance to crit base (%)',
                critChanceMax: 'chance to crit max (%)',
                weight: 'ai weight'
            }, (attack) => {
                attack.targetCount = parseInt(attack.targetCount)
                attack.spinCost = parseInt(attack.spinCost) || 0
                attack.baseDamageMin = parseInt(attack.baseDamageMin)
                attack.baseDamageMax = parseInt(attack.baseDamageMax)
                attack.critBaseDamage = parseInt(attack.critBaseDamage)
                attack.critChanceMin = parseInt(attack.critChanceMin)
                attack.critChanceMax = parseInt(attack.critChanceMax)
                attack.weight = parseFloat(attack.weight) || 1
                return attack
            })

            this.standardAttacks = this.importWorksheetMultiIndex(spreadsheet.worksheets['standardattacks'], Object, {
                id: 'attackgroup',
                name: 'attack',
            })

            this.characters = this.importWorksheetIndex(spreadsheet.worksheets['characters'], CharacterTemplate, {
                id: 'id',
                name: 'name',
                votesBase: 'votes',
                votesLvl: 'votes lvl',
                spinBase: 'sp',
                spinLvl: 'sp lvl',
                speedBase: 'spd',
                speedLvl: 'spd lvl',
                witBase: 'wit',
                witLvl: 'wit lvl',
                cunningBase: 'cun',
                cunningLvl: 'cun lvl',
                charismaBase: 'cha',
                charismaLvl: 'cha lvl',
                flairBase: 'flr',
                flairLvl: 'flr lvl',
                attackGroup: 'attackgroup',
                immunities: 'immunities',
                resistance: 'resistance',
                weaknesses: 'weaknesses'
            }, (ch) => {
                ch.votesBase = parseInt(ch.votesBase)
                ch.votesLvl = parseInt(ch.votesLvl)
                ch.spinBase = parseInt(ch.spinBase)
                ch.spinLvl = parseInt(ch.spinLvl)
                ch.speedBase = parseInt(ch.speedBase)
                ch.speedLvl = parseInt(ch.speedLvl)
                ch.witBase = parseInt(ch.witBase)
                ch.witLvl = parseInt(ch.witLvl)
                ch.cunningBase = parseInt(ch.cunningBase)
                ch.cunningLvl = parseInt(ch.cunningLvl)
                ch.charismaBase = parseInt(ch.charismaBase)
                ch.charismaLvl = parseInt(ch.charismaLvl)
                ch.flairBase = parseInt(ch.flairBase)
                ch.flairLvl = parseInt(ch.flairLvl)
                return ch
            })

            this.encounters = this.importWorksheetIndex(spreadsheet.worksheets['encounters'], Encounter, {
                id: 'id',
                name: 'name',
                monster1: 'monster 1',
                monster1Lvl: 'monster 1 lvl',
                monster2: 'monster 2',
                monster2Lvl: 'monster 2 lvl',
                monster3: 'monster 3',
                monster3Lvl: 'monster 3 lvl',
                monster4: 'monster 4',
                monster4Lvl: 'monster 4 lvl',
                itemAttacks: 'attack items',
                bribeCost: 'bribe cost',
                xp: 'xp',
                money: 'money',
                itemAttackDrops: 'attack drops',
            }, (encounter) => {
                encounter.monster1Lvl = parseInt(encounter.monster1Lvl)
                encounter.monster2Lvl = parseInt(encounter.monster2Lvl)
                encounter.monster3Lvl = parseInt(encounter.monster3Lvl)
                encounter.monster4Lvl = parseInt(encounter.monster4Lvl)
                encounter.bribeCost = parseInt(encounter.bribeCost)
                encounter.xp = parseInt(encounter.xp)
                encounter.money = parseInt(encounter.money)
                return encounter
            })

            this.script = this.importWorksheetMultiIndex(spreadsheet.worksheets['script'], ScriptRow, {
                id: 'trigger',
                action: 'action',
                param: 'param',
                dialog: 'dialog',
            }, (row) => {
                row.trigger = row.id
                delete row.id
                return row
            })

            this.levels = this.importWorksheetRows(spreadsheet.worksheets['levels'], Level, {
                level: 'level',
                xp: 'xp',
                votes: 'votes',
                spin: 'spin',
                skillPoints: 'skill points'
            }, (level) => {
                level.level = parseInt(level.level)
                level.xp = parseInt(level.xp)
                level.votes = parseInt(level.votes)
                level.spin = parseInt(level.spin)
                level.skillPoints = parseInt(level.skillPoints)
                return level
            })

            this.shops = this.importWorksheetMultiIndex(spreadsheet.worksheets['shops'], Shop, {
                id: 'id',
                itemAttack: 'attack item',
                price: 'price',
            }, (shop) => {
                shop.price = parseInt(shop.price)
                return shop
            })

            localStorage.setItem('gmp.GameData', JSON.stringify(this))
            this.link()
        }

        private link() {
            for (var id in this.attacks) {
                var attack = this.attacks[id]
                attack.effects = this.convertIdlistToObjlist(attack.effects, this.effects)
                attack.healthBenefit = this.aiGetHealthBenefit(attack)
                attack.isRevive = this.aiIsReviveAttack(attack)
                attack.isSummon = this.aiIsSummonAttack(attack)
            }
            for (var id in this.standardAttacks) {
                this.standardAttacks[id] = this.standardAttacks[id].map((sa) => this.attacks[(<any>sa).name])
            }
            for (var id in this.characters) {
                var character = this.characters[id]
                character.attacks = this.standardAttacks[(<any>character).attackGroup] || []
                character.immunities = this.convertIdlistToObjlist(character.immunities, this.attacks)
                character.resistance = this.convertIdlistToObjlist(character.resistance, this.attacks)
                character.weaknesses = this.convertIdlistToObjlist(character.weaknesses, this.attacks)
            }
            for (var id in this.encounters) {
                var encounter = this.encounters[id]
                encounter.itemAttacks = this.convertIdlistToObjlist(encounter.itemAttacks, this.attacks).map((attack) => new ItemAttack(attack, 1))
                var itemAttackDrops = []
                this.convertIdlistToObjlist(encounter.itemAttackDrops, this.attacks).forEach((attack) => {
                    ItemAttack.addAttackToItemAttackList(itemAttackDrops, attack)
                })
                encounter.itemAttackDrops = itemAttackDrops
            }
            for (var id in this.shops) {
                var wares = this.shops[id]
                wares.forEach((ware) => {
                    ware.itemAttack = this.attacks[<any>ware.itemAttack]
                })
            }
        }

        private importWorksheetMultiIndex(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): { [key: string]: any[] } {
            var objects = this.importWorksheetRows(worksheet, cls, fields, null)
            var index: { [key: string]: any[] } = {}
            for (var i = 0; i < objects.length; ++i) {
                var obj = objects[i]
                var id = obj.id
                if (!(id in index))
                    index[obj.id] = []
                if (transform)
                    obj = transform(obj)
                index[id].push(obj)
            }
            return index
        }

        private importWorksheetIndex(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): { [key: string]: any } {
            var objects = this.importWorksheetRows(worksheet, cls, fields, null)
            var index: { [key: string]: any } = {}
            for (var i = 0; i < objects.length; ++i) {
                var obj = objects[i]
                if (transform)
                    obj = transform(obj)
                index[obj.id] = obj
            }
            return index
        }

        private importWorksheetRows(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): any[] {
            var objects: any[] = []
            for (var i = 0; i < worksheet.length; ++i) {
                var row = worksheet[i]
                var obj = new cls()
                for (var field in fields) {
                    obj[field] = row[fields[field]]
                }
                if (transform)
                    obj = transform(obj)
                objects.push(obj)
            }
            return objects
        }

        private convertIdlistToObjlist(value, index) {
            if (!value)
                return []

            var result = []
            var values = value.split(',')
            for (var i = 0; i < values.length; ++i) {
                var id = values[i].trim()
                if (id)
                    result.push(index[id])
            }
            return result
        }

        private aiGetHealthBenefit(attack: Attack) {
            // get min health benefit
            if (attack.targetType != 'AllFriendly' && attack.targetType != 'None')
                return 0

            var h = Math.max(0, -attack.baseDamageMax)
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.attribute == 'votes' && effect.func == 'addPermanent')
                    h += effect.value
            }
            return h
        }

        private aiIsReviveAttack(attack: Attack) {
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.func == 'revive')
                    return true
            }
            return false
        }

        private aiIsSummonAttack(attack: Attack) {
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.func == 'callFriends')
                    return true
            }
            return false
        }

        getLevelForXP(xp: number): number {
            for (var i = 0; i < this.levels.length; ++i) {
                if (xp < this.levels[i].xp)
                    return i;
            }
            return this.levels.length - 1;
        }
    }

}