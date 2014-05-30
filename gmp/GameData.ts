module gmp {

    export class QuestItem {
        id: string
        name: string
        description: string
    }

    export class Effect {
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
        monster1: CharacterTemplate
        monster1Lvl: number
        monster2: CharacterTemplate
        monster2Lvl: number
        monster3: CharacterTemplate
        monster3Lvl: number
        monster4: CharacterTemplate
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

    export class GameData {

        static questItems: { [key: string]: QuestItem }
        static effects: { [key: string]: Effect }
        static attacks: { [key: string]: Attack }
        static standardAttacks: { [key: string]: Attack[] }
        static characters: { [key: string]: CharacterTemplate }
        static encounters: { [key: string]: Encounter }
        static script: { [trigger: string]: ScriptRow[] }
        static levels: Level[]
        static shops: { [key: string]: Shop }

        static importGoogleSpreadsheet(spreadsheet: GoogleSpreadsheet) {
            GameData.questItems = GameData.importWorksheetIndex(spreadsheet.worksheets['items'], QuestItem, {
                id: 'id',
                name: 'name',
                description: 'description'
            })

            GameData.effects = GameData.importWorksheetIndex(spreadsheet.worksheets['effects'], Effect, {
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

            GameData.attacks = GameData.importWorksheetIndex(spreadsheet.worksheets['attacks'], Attack, {
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
                attack.effects = GameData.convertIdlistToObjlist(attack.effects, GameData.effects)
                attack.baseDamageMin = parseInt(attack.baseDamageMin)
                attack.baseDamageMax = parseInt(attack.baseDamageMax)
                attack.critBaseDamage = parseInt(attack.critBaseDamage)
                attack.critChanceMin = parseInt(attack.critChanceMin)
                attack.critChanceMax = parseInt(attack.critChanceMax)
                attack.weight = parseFloat(attack.weight) || 1
                attack.healthBenefit = GameData.aiGetHealthBenefit(attack)
                attack.isRevive = GameData.aiIsReviveAttack(attack)
                attack.isSummon = GameData.aiIsSummonAttack(attack)
                return attack
            })

            GameData.standardAttacks = GameData.importWorksheetMultiIndex(spreadsheet.worksheets['standardattacks'], Object, {
                id: 'attackgroup',
                name: 'attack',
            }, (obj) => {
                return GameData.attacks[obj.name]
            })

            GameData.characters = GameData.importWorksheetIndex(spreadsheet.worksheets['characters'], CharacterTemplate, {
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
                attackGroup: 'attackGroup',
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
                ch.attackGroup = GameData.standardAttacks[ch.attackGroup]
                ch.immunities = GameData.convertIdlistToObjlist(ch.immunities, GameData.attacks)
                ch.resistance = GameData.convertIdlistToObjlist(ch.resistance, GameData.attacks)
                ch.weaknesses = GameData.convertIdlistToObjlist(ch.weaknesses, GameData.attacks)
                return ch
            })

            GameData.encounters = GameData.importWorksheetIndex(spreadsheet.worksheets['encounters'], Encounter, {
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
                encounter.monster1 = GameData.characters[encounter.monster1]
                encounter.monster1Lvl = parseInt(encounter.monster1Lvl)
                encounter.monster2 = GameData.characters[encounter.monster2]
                encounter.monster2Lvl = parseInt(encounter.monster2Lvl)
                encounter.monster3 = GameData.characters[encounter.monster3]
                encounter.monster3Lvl = parseInt(encounter.monster3Lvl)
                encounter.monster4 = GameData.characters[encounter.monster4]
                encounter.monster4Lvl = parseInt(encounter.monster4Lvl)
                encounter.itemAttacks = GameData.convertIdlistToObjlist(encounter.itemAttacks, GameData.attacks).map((attack) => new ItemAttack(attack, 1))
                encounter.bribeCost = parseInt(encounter.bribeCost)
                encounter.xp = parseInt(encounter.xp)
                encounter.money = parseInt(encounter.money)
                var itemAttackDrops = []
                encounter.itemAttackDrops = GameData.convertIdlistToObjlist(encounter.itemAttackDrops, GameData.attacks).forEach((attack) => {
                    ItemAttack.addAttackToItemAttackList(itemAttackDrops, attack)
                })
                return encounter
            })

            GameData.script = GameData.importWorksheetMultiIndex(spreadsheet.worksheets['script'], ScriptRow, {
                id: 'trigger',
                action: 'action',
                param: 'param',
                dialog: 'dialog',
            }, (row) => {
                row.trigger = row.id
                delete row.id
                return row
            })

            GameData.levels = GameData.importWorksheetRows(spreadsheet.worksheets['levels'], Level, {
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

            GameData.shops = GameData.importWorksheetIndex(spreadsheet.worksheets['shops'], Shop, {
                id: 'id',
                itemAttack: 'attack item',
                price: 'price',
            }, (shop) => {
                shop.itemAttack = GameData.attacks[shop.itemAttack]
                shop.price = parseInt(shop.price)
                return shop
            })
        }


        private static importWorksheetMultiIndex(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): { [key: string]: any[] } {
            var objects = GameData.importWorksheetRows(worksheet, cls, fields, null)
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

        private static importWorksheetIndex(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): { [key: string]: any } {
            var objects = GameData.importWorksheetRows(worksheet, cls, fields, null)
            var index: { [key: string]: any } = {}
            for (var i = 0; i < objects.length; ++i) {
                var obj = objects[i]
                if (transform)
                    obj = transform(obj)
                index[obj.id] = obj
            }
            return index
        }

        private static importWorksheetRows(worksheet: {}[], cls: new () => any, fields: { [field: string]: string }, transform?: (any) => any): any[] {
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

        private static convertIdlistToObjlist(value, index) {
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

        private static aiGetHealthBenefit(attack: Attack) {
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

        private static aiIsReviveAttack(attack: Attack) {
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.func == 'revive')
                    return true
            }
            return false
        }

        private static aiIsSummonAttack(attack: Attack) {
            for (var i = 0; i < attack.effects.length; ++i) {
                var effect = attack.effects[i]
                if (effect.func == 'callFriends')
                    return true
            }
            return false
        }

    }

}