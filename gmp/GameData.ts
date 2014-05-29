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

    export class GameData {

        static questItems: { [key: string]: QuestItem }
        static effects: { [key: string]: Effect }
        static attacks: { [key: string]: Attack }
        static standardAttacks: { [key: string]: Attack[] }

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