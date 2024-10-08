class IPlayerData {
    constructor() {
        this.id = 0;
        this.username = null;
        this.mail = null;
        this.img = null;
        this.created_at = null;
        this.eloPong = 0;
        this.eloConnect4 = 0;
        this.is_online = false;
        this.last_connection = null;
        this.friends_count = 0;
        this.is42User = false;
        this.visitedProfile = false;
        this.gameELoBefore = 0;
        this.gameELoAfter = 0;
    }

    init(data) {
        console.log(data);
        if (!data) return;
        this.id = data.id;
        this.username = data.username;
        this.mail = data.mail;
        this.img = data.img;
        this.created_at = data.created_at;
        this.eloPong = data.eloPong;
        this.eloConnect4 = data.eloConnect4;
        this.is_online = data.is_online;
        this.last_connection = data.last_connection;
        this.friends_count = data.friends_count;
        this.is42User = data.is42User;
        this.visitedProfile = data.visitedProfile;
        this.gameELoBefore = data.elo_before || -1;
        this.gameELoAfter = data.elo_after || -1;
    }

    getId() {
        return this.id;
    }

    getUsername() {
        return this.username;
    }

    getMail() {
        return this.mail;
    }

    getImg() {
        return this.img;
    }

    getCreatedAt() {
        return this.created_at;
    }

    getEloPerType(type) {
        return type ? this.getEloPong() : this.getEloConnect4();
    }

    getEloPong() {
        return this.eloPong;
    }

    getEloConnect4() {
        return this.eloConnect4;
    }

    getIsOnline() {
        return this.is_online;
    }

    getLastConnection() {
        return this.last_connection.split("T")[0];
    }

    getFriendsCount() {
        return this.friends_count;
    }

    getIs42User() {
        return this.is42User;
    }

    getVisitedProfile() {
        return this.visitedProfile;
    }

    getEloAfterGame() {
        return this.gameELoAfter;
    }

    getEloAfterGameDiff() {
        return this.gameELoAfter - this.gameELoBefore;
    }

    setId(id) {
        this.id = id;
    }

    setUsername(username) {
        this.username = username;
    }

    setMail(mail) {
        this.mail = mail;
    }

    setImg(img) {
        this.img = img;
    }

    setCreatedAt(created_at) {
        this.created_at = created_at;
    }

    setEloPong(eloPong) {
        this.eloPong = eloPong;
    }

    setEloConnect4(eloConnect4) {
        this.eloConnect4 = eloConnect4;
    }

    setIsOnline(is_online) {
        this.is_online = is_online;
    }

    setLastConnection(last_connection) {
        this.last_connection = last_connection;
    }

    setFriendsCount(friends_count) {
        this.friends_count = friends_count;
    }

    setIs42User(is42User) {
        this.is42User = is42User;
    }

    setVisitedProfile(visitedProfile) {
        this.visitedProfile = visited
    }

    printData() {
        console.table(this);
    }
}

export default IPlayerData;