module crackle {

    export class Sound {
        private audio: HTMLAudioElement

        constructor(public src: string) {
        }

        play() {
            this.audio = new Audio(this.src)
            this.audio.autoplay = true
        }

        stop() {
            this.audio.pause()
            this.audio = null
        }
    }

}