class createUserStats{
    constructor({userID , username , country})
    {
        this.userID = userID;
        this.username = username;
        this.dailyStreak = 0;
        this.matchPlayed = 0;
        this.shortestGameTime = 0;
        this.rank = 0;
        this.country = country;
        this.dateJoined = new Date().toISOString();
        this.achievements = new Array();
    }
}

module.exports = {
    createUserStats:createUserStats
}