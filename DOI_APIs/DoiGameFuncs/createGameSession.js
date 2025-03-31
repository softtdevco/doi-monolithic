const fs = require('fs');
const path = require('path');
const { createJwtToken } = require('../utils/jwtAuth');
class createSession{
    constructor({hostID,gameID,tournamentInfo,duration , joinCode , jwtGameAuth , playersCount , guessDigitCount , gameType})
    {
        this.hostID = hostID;
        this.jwtGameAuth = jwtGameAuth;
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
        this.secretCode = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        };
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


const createNewGameSession = async({userID , tournamentInfo = {} , duration = {"minute": 5,"seconds": 0} , playersCount , gameType , guessDigitCount , createGame_connection , initID}) =>{
    const gameID = initID();
    const joinCode = gameID.split('-').join('').slice(0,10);
    const inviteToken = createJwtToken({inviteCode:joinCode , gameID:gameID} , "5h");
    const newSession = new createSession({hostID:userID,gameID,tournamentInfo,duration , joinCode , jwtGameAuth:inviteToken , playersCount , gameType , guessDigitCount}).getObject();

    let createNewSession;

    const processCodeNLink = () =>{
        const parcel = {}

        parcel['code'] = joinCode;
        parcel['link'] = process.env.serverUrl + `invite?code=${parcel['code']}&joined=false`,
        parcel['sessionInfo'] = createNewSession ? "Created new session" : "Updated session"
        return parcel
    }

    try{
        const gameSessionExist = await createGame_connection.findOne({
            $or: [{ hostID: userID}],
        });

        if(gameSessionExist)
        {
            await createGame_connection.findOneAndUpdate(
                {hostID:gameSessionExist.hostID},
                {$set : newSession},
                {new:false}
            )

            createNewSession = false;
        }else 
        {
            const savedGameSession = new createGame_connection(newSession);

            await savedGameSession.save();

            createNewSession = true;
        }

        return {ok:true , data:{type:"gameSessionCreateSuccess" , msg:processCodeNLink()}};
    }
    catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }    
}

module.exports = {
    createNewGameSession:createNewGameSession
}