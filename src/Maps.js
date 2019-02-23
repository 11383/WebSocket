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
     * Get user position from browser
     * @returns {GeolocationCords} pos 
     * return position from geolocation api if allowed, other returns -34.397, 150.644 
     */
    async getCurrentUserPosition() {
        return new Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(position => {
                    const {latitude: lat, longitude: lng} = position.coords
                    resolve({lat, lng})
                },
                error => {
                    console.warn(error)

                    resolve({lat: -34.397, lng: 150.644})
                })
            }
        })
    }

    /**
     * When chat get msg from server
     * @param {Object} data payload
     */
    onMsgReceived(data) {
        if (data.user.id !== this.user.id) {
            this.updateMarker(data.data, data.user.id, data.user.img)
        }
    }

    /**
     * Send message to server
     */
    send() {
        this.socketClient.send({
            user: this.user,
            data: this.getUserMarkerPos()
        })
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
    async initMap() {
        this.map = 
        new google.maps.Map(document.querySelector(this.selector), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 8,
            keyboardShortcuts: false,
            disableDefaultUI: true
        });

        const position = await this.getCurrentUserPosition()
        this.updateMarker(position, this.user.id)
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

    /**
     * getUserMarker
     * @returns {GoogleMapMarker} actual user marker
     */
    getUserMarker() {
        return this.markers[this.user.id]
    }

    /**
     * getUserMarkerPos
     * @returns {GeolocationCords} pos
     * Position of current user marker
     */
    getUserMarkerPos() {
        const marker = this.getUserMarker()

        return {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng()
        }
    }

    /**
     * Update if exists or create new marker
     * @param {GeolocationCords} pos position of marker
     * @param {String} id unique id of marker. If exists marker with given idm it will be updated 
     * @param {Base64String} icon base64 icon
     */
    updateMarker(pos, id = Date.now(), icon) {

        if (this.markers[id]) {
            this.markers[id].setPosition(pos)

        } else {
            this.markers[id] = this.createMarker(pos, icon)
        }

        // if update this user marker
        if (id == this.user.id) {
            const center = new google.maps.LatLng(...Object.values(pos))

            this.map.panTo(center)
        }
    }

    attachKeyBinds() {
        document
        .querySelector(this.selector)
        .addEventListener('keydown', e => this.onKeyDown(e) )
    }

    onKeyDown(e) {
        let position = this.getUserMarkerPos()

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
        this.send()
    }
}

export default Maps