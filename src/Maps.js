class Maps {
    constructor(socketClient, 
        { selector = ".map" } = params
    ) {

        this.socketClient = socketClient
        this.socketClient.onMsg( data => this.onMsgReceived(data) )
        this.selector = selector
        this.markers = {}

        this.setUser({name: 'anonymous_' + Math.random(), img: null})

        this.attachKeyBinds()
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

    updateMarkerIcon(icon) {
        this.getUserMarker().setIcon(icon)
    }

    /**
     * Callback for google maps api success loaded
     */
    initMap() {
        this.map = 
        new google.maps.Map(document.querySelector(this.selector), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8,
            keyboardShortcuts: false,
            disableDefaultUI: true
        });

        this.updateMarker({lat: -34, lng: 150}, this.user.id)
    }

    /**
     * Create and add marker to current map
     * @param {google.latLng} pos position of marker
     * @param {String} icon base64 string of image 
     * @param {String} title title of marker
     */
    createMarker(pos, icon, title = "ASD") {
        return new google.maps.Marker({
            position: pos,
            map: this.map,
            icon,
            title
        });
    }

    getUserMarker() {
        return this.markers[this.user.id]
    }

    updateMarker(pos, id = Date.now(), icon) {

        if (this.markers[id]) {
            this.markers[id].setPosition(pos)

        } else {
            this.markers[id] = this.createMarker(pos, icon)
        }
    }

    attachKeyBinds() {
        document
        .querySelector(this.selector)
        .addEventListener('keydown', e => this.onKeyDown(e) )
    }

    onKeyDown(e) {
        const marker = this.getUserMarker()

        let position = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
        }

        switch(e.keyCode) {
            // left
            case 65:
            position.lng -= 1
            break;
    
            // right
            case 68:
            position.lng += 1
            break;
    
            // top
            case 87:
            position.lat += 1
            break;
    
            case 83:
            position.lat -= 1
            break;
        }

        this.updateMarker(position, this.user.id)
    }
}

export default Maps