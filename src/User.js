class User {
    constructor() {
        this.name = this.generateName()
        this.img = null
    }

    generateName() {
        return `anonymous_${Math.floor(100000 + Math.random() * 900000)}`
    }

    setName(name) {
        this.name = name
    }

    setImg(img) {
        this.img = img
    }

    getData() {
        return {
            name: this.name,
            img: this.img
        }
    }
}

export default User