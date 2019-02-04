/**
 * ImageLoader
 * Load image from user device
 * Attach data to given input
 */
class ImageLoader {
    /**
     * Construct
     * @param {HTMLSelector} selector of input to attach data
     */
    constructor(selector) {
        this.events = {}
        
        this.input = document.querySelector(selector)
        this.input && this.input.addEventListener('change', (e) => this.onChange(e) )

        this.canvas = document.createElement('canvas')
        this.canvas.width = 50
        this.canvas.height = 50

        this.ctx = this.canvas.getContext('2d')

        this.emit('init', this)
    }

    /**
     * Event: on input change
     * @param {Event} e 
     */
    onChange(e) {
        const input = e.target

        if(input && input.files && input.files[0]) {

            Array.from( input.files ).forEach( file => {
                const reader = new FileReader()

                reader.addEventListener('load', (e) => {
                    const image = new Image(50, 50)

                    image.addEventListener('load', e => {
                        this.ctx.drawImage(image, 0, 0, 50, 50)
                        this.emit('load', this.canvas.toDataURL("image/jpeg"))
                    })

                    image.src = e.target.result
                })

                reader.readAsDataURL(file)
            })
        }

        this.emit('change', e)
    }

    /**
     * Attach callback to ImageLoader
     * @param {String} eventName on event
     * @param {CallableFunction} callback
     */
    on(eventName, callback) {
        !this.events[eventName] && (this.events[eventName] = [])

        this.events[eventName].push(callback)
    }

    /**
     * Emit given event
     * @param {String} eventName eventName to emit
     * @param  {...any} params params to pass to callbacks 
     */
    emit(eventName, ...params) {
        this.events[eventName] && 
        this.events[eventName].forEach( callback => callback(...params) )
    }
}

export default ImageLoader