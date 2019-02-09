class User {
    constructor() {
        this.name = this.generateName()
        this.img = null
        this.id = this.genID()
    }

    generateName() {
        return `anonymous_${this.genID()}`
    }

    genID() {
        return Math.floor(100000 + Math.random() * 900000)
    }

    setName(name) {
        this.name = name
    }

    setImg(img) {
        this.img = img
    }

    getData() {
        return {
            id: this.id,
            name: this.name,
            img: this.img
        }
    }
}

export default User