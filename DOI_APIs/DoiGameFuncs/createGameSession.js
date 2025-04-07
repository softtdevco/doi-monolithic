const fs = require('fs');
const path = require('path');
const { createJwtToken } = require('../utils/jwtAuth');
const { multiplayerGameModes, serverSecretCodeGenerator } = require('../utils/multiplayerUtils');
const { createGameSession } = require('../utils/createGameUtils');


const createNewGameSession = async({userID , tournamentInfo = {} , duration = {"minute": 5,"seconds": 0} , playersCount , gameType , guessDigitCount , createGame_connection , initID , gameMode}) =>{
    const gameID = initID();
    const joinCode = gameID.split('-').join('').slice(0,10);
    const inviteToken = createJwtToken({inviteCode:joinCode , gameID:gameID} , "5h");
    const newSession = new createGameSession({hostID:userID,gameID,tournamentInfo,duration , joinCode , jwtGameAuth:inviteToken , playersCount , gameType , guessDigitCount , gameMode}).getObject();

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