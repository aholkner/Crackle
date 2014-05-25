module gmp {

    export class Character {
        image: crackle.Image

        constructor(public id: string, public level: number, public items: any[], public ai: boolean) {
            this.image = Resources.characterImages[id]
        }
    }

} 