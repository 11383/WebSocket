class SocketClient {
    constructor(url) {
        this.url = url
        this.channels = {"*": []}

        this.ws = new WebSocket(url)
        this.ws.addEventListener('open', _ => this.onOpen)
        this.ws.addEventListener('error', e => this.onError(e))
        this.ws.addEventListener('message', data => this._onMsg(data))
    }

    onOpen() {
        console.log('connected')
    }

    onError(err) {
        console.error(err)
    }

    onMsg(cb, channel = "*") {
        !this.channels[channel] && (this.channels[channel] = [])

        this.channels[channel].push(cb)
    }

    emit(payload, channel = "*") {
        let subscribers = [
            ...this.channels["*"] || [],
            ...this.channels[channel] || []
        ]

        subscribers.forEach( subscriber => subscriber(payload) ) 
    }

    _onMsg(payload) {
        try {
            const data = JSON.parse(payload.data)

            this.emit(data.payload, data.channel)
        } catch (e) {
            console.error(e)
        }
    }

    send(payload, channel = "*") {
        this.ws.send(JSON.stringify({
            channel,
            payload
        }))
    }

    channel(channel) {
        return {
            onMsg: (cb) => {
                this.onMsg(cb, channel)
            },
            send: (payload) => {
                this.send(payload, channel)
            }
        }
    }
}

export default SocketClient