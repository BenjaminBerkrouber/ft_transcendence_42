class IIa {
    constructor() {
        this.id = 0;
        this.img = null;
    }

    init(data) {
        if (!data) return;
        this.id = data.id;
        this.img = data.img;
    }

    getId() {
        return this.id;
    }

    getImg() {
        return this.img;
    }

    printData() {
        console.table(this);
    }
}

export default IPlayerData;