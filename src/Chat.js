class Chat {
    constructor(socketClient, 
        { selector = ".chat", box = ".chat-box", input = ".chat-input", send = '.chat-send' } = params
    ) {

        this.socketClient = socketClient
        this.socketClient.onMsg( data => this.onMsgReceived(data) )
        this.typing = null

        this.initChat(selector, box, input, send)

        this.setUser({name: 'anonymous_' + Math.random(), img: null})
    }

    /**
     * When chat get msg from server
     * @param {Object} data payload
     */
    onMsgReceived(data) {
        switch(data.data.type) {
            case 'typing':
                this.setTyping(data)
            break;

            case 'message':
                this.addMsg( data.user.name == this.user.name ? 'me' : 'other', data)
            break;
        }
    }

    /**
     * Send message to server
     * @param {Object|Array|String} data data to send
     */
    send(data) {
        this.socketClient.send({
            user: this.user,
            data
        })

        this.typing = false
    }

    /**
     * Set current user of chat
     * @param {User} user current user
     */
    setUser(user) {
        this.user = user
    }

    /**
     * Add message to box
     * @param {String} type ['me','other']
     * @param {Object} data Object of message
     */
    addMsg(type, data) {
        const wrapperType = type == 'me' ? 'accent' : 'default'

        const messageWrapper = document.createElement('div')
              messageWrapper.classList.add('chat-msg__wrapper', `chat-msg__wrapper--${wrapperType}`)

        const avatar = document.createElement('div')
              avatar.classList.add('chat-msg__icon')

        if (data.user.img !== null) {
            avatar.style.backgroundImage = `url(${data.user.img})`
        }

        const message = document.createElement('div')
              message.classList.add('chat-msg')
              message.innerText = data.data.text

        messageWrapper.title = data.user.name
        messageWrapper.append(avatar, message)
        
        this.box.append(messageWrapper)
        this.scrollBox()
    }

    /**
     * Init chat.
     * @param {HTMLSelector} element selector of chat render place
     * @param {HTMLSelector} box selector where chat messages render
     * @param {HTMLSelector} input selector of chat input
     * @param {HTMLSelector} send selector of send btn
     */
    initChat(element, box, input, send) {
        this.element = document.querySelector(element)
        this.box = this.element.querySelector(box)
        
        this.initInput(input)
        this.initBtnSend(send)
    }

    initInput(selector) {
        this.input = this.element.querySelector(selector)
        
        this.input.addEventListener('keyup', e => {
            // enter key
            if (e.keyCode == 13) {
                this.stopTyping()
                this.sendFromInput()
            } 
            // other keys
            else {
                this.startTyping()
            }
        })
    }

    /**
     * Find btn send and attach handlers
     * @param {HTMLSelectElement} selector selector for send button
     */
    initBtnSend(selector) {
        this.btnSend = this.element.querySelector(selector)

        this.btnSend.addEventListener('click', _ => this.sendFromInput() )
    }

    /**
     * Get data from input, and send to server
     */
    sendFromInput() {
        this.send({ type: 'message', text: this.input.value })
        this.input.value = ''
    }

    /**
     * Add or remove typing indicator from chat
     * @param {Object} data { data: {type: 'typing', state: true|false } }
     */
    setTyping(data) {
        if (data.user.name == this.user.name) {
            return
        }
        
        this.element
        .querySelector('.chat-msg__wrapper--typing .chat-msg__icon')
        .style
        .backgroundImage = `url(${data.user.img})`
        
        this.element.classList.toggle('chat--typing', data.data.status)
    }

    /**
     * Call when user start typing
     * Notify server, that user start typing
     */
    startTyping() {
        if (!this.typing) {
            this.send({ type: 'typing', status: true })
        }

        clearTimeout(this.typing)
        this.typing = setTimeout( _ => { this.stopTyping() }, 1000)
        this.scrollBox()
    }
    
    /**
     * Call when user stop typing
     * Notify server, that user stop typing
     */
    stopTyping() {
        clearInterval(this.typing)
        this.typing = null

        this.send({ type: 'typing', status: false })
    }

    scrollBox() {
        this.box.parentElement.scrollTop = this.box.scrollHeight;
    }
}

export default Chat