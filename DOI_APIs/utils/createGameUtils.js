class createGameSession{
    constructor({hostID,gameID,tournamentInfo,duration , joinCode , jwtGameAuth , playersCount , guessDigitCount , gameType , gameMode})
    {
        this.hostID = hostID;
        this.jwtGameAuth = jwtGameAuth;
        this.gameMode = gameMode
        this.hasStart = false;
        this.isEnd = false;
        this.clockTimer = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = duration;
                }
                return obj;
            })()
        }
        this.playersID = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        };
        this.secretCodes = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        };
        if(gameMode === multiplayerGameModes.mode2)
        {
            this.serverSecretCode = {
                code:serverSecretCodeGenerator(guessDigitCount)
            }
        }
        this.gameRecord = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    let array = [];
                    for(let j = 0; j < guessDigitCount; j++)
                    {
                        array.push("");
                    }
                    obj[`player${i+1}`] = array;
                }
                return obj;
            })()
        }
        this.deadPoints = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = 0;
                }
                return obj;
            })()
        }
        this.gameCalls = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        }
        this.playerAppInfo = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        }
        this.connectionTrack = 0
        this.invitableCode = joinCode;
        this.gameID = gameID;
        this.gameType = gameType;
        this.playersCount = playersCount;
        this.guessDigitCount = guessDigitCount;
        switch(true)
        {
            case Object.keys(tournamentInfo).length > 0:
                this.tournamentBase = true;
                this.tournamentInfo = tournamentInfo
            break;
            default:
                this.tournamentBase = false
        }
        this.getObject = () =>{
            const newObject = new Object();
            Object.assign(newObject , this);
            delete newObject.getObject;
            return newObject;
        }
    }
}

module.exports = {
    createGameSession:createGameSession
}