module gmp {

    export class Resources {

        static titleImage: crackle.Image

        private static loadImage(name: string): crackle.Image {
            return new crackle.Image('gmp/res/' + name, { sampleNearest: true })
        }

        static load() {
            Resources.titleImage = Resources.loadImage('title.png')

            UI.load()
        }

    }

} 