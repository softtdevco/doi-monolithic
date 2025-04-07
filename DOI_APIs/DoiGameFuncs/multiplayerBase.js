const { connectionInit, createClosedConnectionInfo, sendJointParcel, processCalls, sendJointParcel_exceptCurrentConnection , createClientMultiplayer, multiplayerGameModes, generateNextPlayer} = require("../utils/multiplayerUtils");
const {tempconnectObj__checkData , tempconnectObj__addData, tempconnectObj__getData, tempconnectObj__delData} = require("../DoiTempCache/playersConnectionCache");
const { sendMissingCredResponseWs } = require("../utils/MissingCred");
const { tournamentBaseEndGame, tournamentBase__createPair__endGame } = require("../utils/tournamentUtils");

async function sendNupdateConnection(msg,connectionWs , gameConnectionDB , userConnectionDB)
{
    const {userID,gameID} = msg;

        try{
        const gameSessionExist = await gameConnectionDB.findOne({
            $or: [{ gameID }],
        });

        if(gameSessionExist)
            {
                let currentPlayerMark = '';

                for(let i = 0; i < gameSessionExist.playersCount; i++)
                {
                    if(gameSessionExist.playersID[`player${i+1}`][0] === userID)
                    {
                        currentPlayerMark = `player${i+1}`;
                        break;
                    }
                }
                
                if(currentPlayerMark.length > 0)
                {
                    if(!tempconnectObj__checkData({key:gameID}))
                    {
                        const userVal = new connectionInit(gameSessionExist.playersCount , gameSessionExist.gameMode , gameSessionExist.guessDigitCount , gameSessionExist.playersID , gameSessionExist.secretCodes).getObject();
                        tempconnectObj__addData({key:gameID , value:userVal});
                    }
        
                        if(tempconnectObj__getData({key:gameID}).playersObj[currentPlayerMark].length === 0){
                            tempconnectObj__getData({key:gameID}).playersObj[currentPlayerMark].push(connectionWs);
        
                            tempconnectObj__getData({key:gameID}).connectionTrack++;
                            
                            let checkDisconnectIndex = tempconnectObj__getData({key:gameID}).disconnectedUsers.indexOf(currentPlayerMark);

                            if(checkDisconnectIndex !== -1)
                            {
                                tempconnectObj__getData({key:gameID}).disconnectedUsers.splice(checkDisconnectIndex , 1);
                            }
        
                            //create closed connection logic
                            connectionWs.on('close', () =>{
                                createClosedConnectionInfo({gameID , currentPlayerMark , connection:connectionWs})
                            })
                            //create closed connection logic

                            sendJointParcel_exceptCurrentConnection({gameID , parcel:{type:"newGameConnection" , msg:{generalPlayerInfo:gameSessionExist.playerAppInfo}} , post:"serverAuto" , currentPlayerMark});

                            if(gameSessionExist.gameMode === multiplayerGameModes.mode2)
                            {
                                tempconnectObj__getData({key:gameID}).serverSecretCode = gameSessionExist.serverSecretCode;
                                checkAllPlayers__start__connection({gameID , gameConnectionDB})
                            }
                        }
                        
                        connectionWs.send(JSON.stringify(
                            new createClientMultiplayer({msg:{type:"wsConnectionSuccess" , msg:{generalPlayerInfo:gameSessionExist.playerAppInfo , playerPosition:currentPlayerMark , connectedPlayersCount:tempconnectObj__getData({key:gameID}).connectionTrack , gameMode:gameSessionExist.gameMode}} , post:"connection"})
                        ))
                        
                }else connectionWs.send(JSON.stringify(
                    new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"User isn't a player in this game session"} , post:"connection"})
                ))
            }else{
                connectionWs.send(JSON.stringify(
                    new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"Game session does not exist"} , post:"connection"})
                ))
            }
    }catch(err)
    {
        connectionWs.send(JSON.stringify(
            new createClientMultiplayer({msg:{type:"serverError" , msg:err.message} , post:"connection"})
        ))
    }    
}



async function sendNupdateRe_connection(msg,connectionWs , gameConnectionDB , userConnectionDB)
{
    const {userID,gameID} = msg;

        try{
        const gameSessionExist = await gameConnectionDB.findOne({
            $or: [{ gameID }],
        });

        if(gameSessionExist)
            {
                let currentPlayerMark = '';

                for(let i = 0; i < gameSessionExist.playersCount; i++)
                {
                    if(gameSessionExist.playersID[`player${i+1}`][0] === userID)
                    {
                        currentPlayerMark = `player${i+1}`;
                        break;
                    }
                }
                
                if(currentPlayerMark.length > 0)
                {
                    if(tempconnectObj__getData({key:gameID}).playersObj[currentPlayerMark].length === 0)
                    {
                        tempconnectObj__getData({key:gameID}).playersObj[currentPlayerMark].push(connectionWs);
    
                        tempconnectObj__getData({key:gameID}).connectionTrack++;
    
                        //create closed connection logic
                        connectionWs.on('close', () =>{
                            createClosedConnectionInfo({gameID , currentPlayerMark , connection:connectionWs})
                        })
                        //create closed connection logic

                        connectionWs.send(JSON.stringify(
                            new createClientMultiplayer({msg:{type:"wsReconnectionSuccess" , msg:{generalPlayerInfo:gameSessionExist.playerAppInfo , playerPosition:currentPlayerMark , connectedPlayersCount:tempconnectObj__getData({key:gameID}).connectionTrack , playersTimer:tempconnectObj__getData({key:gameID}).clockTimer , playerTurn:tempconnectObj__getData({key:gameID}).playerTurn , yourCalls: tempconnectObj__getData({key:gameID}).gameCalls[currentPlayerMark], gameMode:gameSessionExist.gameMode}} , post:"re_connect"})
                        ))

                        let checkDisconnectIndex = tempconnectObj__getData({key:gameID}).disconnectedUsers.indexOf(currentPlayerMark);

                        if(checkDisconnectIndex !== -1) tempconnectObj__getData({key:gameID}).disconnectedUsers.splice(checkDisconnectIndex , 1);

                        sendJointParcel({gameID , parcel:{type:"reconnectGame" , msg:{reconnectPlayer:currentPlayerMark , reconnectPlayerTimer:tempconnectObj__getData({key:gameID}).clockTimer[currentPlayerMark] , playState:"play" , playerTurn:tempconnectObj__getData({key:gameID}).playerTurn}} , post:"serverAuto"});
                    }
                        
                }else connectionWs.send(JSON.stringify(
                    new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"User isn't a player in this game session"} , post:"connection"})
                ))
            }else{
                connectionWs.send(JSON.stringify(
                    new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"Game session does not exist"} , post:"connection"})
                ))
            }
    }catch(err)
    {
        connectionWs.send(JSON.stringify(
            new createClientMultiplayer({msg:{type:"serverError" , msg:err.message} , post:"connection"})
        ))
    }    
}



async function checkAllPlayers__start__bySecretCode({gameID , gameConnectionDB})
{
    if(tempconnectObj__checkData({key:gameID}))
    {
        if(Object.keys(tempconnectObj__getData({key:gameID}).secretCodes).length > 0)
        {
            console.log(Object.keys(tempconnectObj__getData({key:gameID}).secretCodes).every(val =>{return tempconnectObj__getData({key:gameID}).secretCodes[`${val}`].length > 0}) , "  bool")
            if(Object.keys(tempconnectObj__getData({key:gameID}).secretCodes).every(val =>{return tempconnectObj__getData({key:gameID}).secretCodes[`${val}`].length > 0}))//checks if all the players have uploaded secret code
            {
                console.log(tempconnectObj__getData({key:gameID}).secretCodes)
                await gameConnectionDB.findOneAndUpdate(
                    { gameID },
                    {$set : {hasStart:true}},
                    {new:false}
                )
    
                sendJointParcel({gameID , parcel:{type:"gameStart" , msg:{playerTurn:"player1"}} , post:"serverAuto"})
    
            }//else sendJointParcel({gameID , parcel:{type:"secretCodeError" , msg:"Not all players have uploaded secret code"} , post:"serverAuto"})
        }
    }
        
}


async function checkAllPlayers__start__connection({gameID , gameConnectionDB})
{
    if(Object.keys(tempconnectObj__getData({key:gameID}).playersObj).every(val =>{return tempconnectObj__getData({key:gameID}).playersObj[`${val}`].length > 0}))//checks if all the players have uploaded secret code
    {

        await gameConnectionDB.findOneAndUpdate(
            { gameID },
            {$set : {hasStart:true}},
            {new:false}
        )

        sendJointParcel({gameID , parcel:{type:"gameStart" , msg:{playerTurn:"player1"}} , post:"serverAuto"})

    }//else sendJointParcel({gameID , parcel:{type:"secretCodeError" , msg:"Not all players have uploaded secret code"} , post:"serverAuto"})
        
}




async function getCallsNupdate_MODE1(msg , connectionWs , gameConnectionDB , tournamentConnection){
    const {userID , gameID , guess , clockTimer} = msg;

    try{
        const gameSessionCache = tempconnectObj__getData({key:gameID})

        if(gameSessionCache)
        {
            let currentPlayerMark = '';

            for(let i = 0; i < gameSessionCache.playersCount; i++)
            {
                if(gameSessionCache.playersID[`player${i+1}`][0] === userID)
                {
                    currentPlayerMark = `player${i+1}`;
                    break;
                }
            }

            const playersSecretCode = gameSessionCache.secretCodes;
            const opponentSecretCode = playersSecretCode[currentPlayerMark === "player1" ? "player2" : "player1"];
            const processResult = processCalls({guess , sCode:opponentSecretCode[0] , guessDigitCount:gameSessionCache.guessDigitCount});

            tempconnectObj__getData({key:gameID}).gameRecord[currentPlayerMark === "player1" ? "player2" : "player1"] = processResult.callArray;
            tempconnectObj__getData({key:gameID}).deadPoints[currentPlayerMark === "player1" ? "player2" : "player1"] = processResult.dead;
            tempconnectObj__getData({key:gameID}).gameCalls[currentPlayerMark].push(processResult.callString);
            tempconnectObj__getData({key:gameID}).clockTimer[currentPlayerMark] = [clockTimer]
            
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"yourCalls" , msg:{calls:processResult.callString , dead:processResult.dead , injured:processResult.injured}} , post:"playerGuess"})
            ))

            if(processResult.dead < gameSessionCache.guessDigitCount)
            {
                sendJointParcel({gameID , parcel:{playerTimeSync:clockTimer , previousPlayer:currentPlayerMark , playerTurn:currentPlayerMark === "player1" ? "player2" : "player1"} , post:"nextGameRound"})
            }else{
                    await endGameSeq_MODE({gameID , gameConnectionDB , winnerPosition:currentPlayerMark , connectionWs ,tournamentConnection})
            }
        }else{
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"Game session does not exist"} , post:"playerGuess"})
            ))
        }
    }catch(err)
    {
        console.log(err)
        connectionWs.send(JSON.stringify(
            new createClientMultiplayer({msg:{type:"serverError" , msg:err.message} , post:"playerGuess"})
        ))
    }
}





async function getCallsNupdate_MODE2(msg , connectionWs , gameConnectionDB){
    const {userID , gameID , guess , clockTimer} = msg;

    try{
        const gameSessionCache = tempconnectObj__checkData({key:gameID})

        if(gameSessionCache)
        {
            let currentPlayerMark = '';

            for(let i = 0; i < gameSessionCache.playersCount; i++)
            {
                if(gameSessionCache.playersID[`player${i+1}`][0] === userID)
                {
                    currentPlayerMark = `player${i+1}`;
                    break;
                }
            }

            const processResult = processCalls({guess , sCode:gameSessionCache.serverSecretCode.code , guessDigitCount:gameSessionCache.guessDigitCount});

            tempconnectObj__getData({key:gameID}).gameCalls[currentPlayerMark].push(processResult.callString);
            tempconnectObj__getData({key:gameID}).clockTimer[currentPlayerMark] = [clockTimer]
            
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"yourCalls" , msg:{calls:processResult.callString , dead:processResult.dead , injured:processResult.injured}} , post:"playerGuess"})
            ))

            if(processResult.dead < gameSessionCache.guessDigitCount)
            {
                sendJointParcel({gameID , parcel:{playerTimeSync:clockTimer , previousPlayer: currentPlayerMark, playerTurn:generateNextPlayer(currentPlayerMark , gameSessionCache.playersCount) === "player1" ? "player2" : "player1"} , post:"nextGameRound"})
            }else{
                    await endGameSeq_MODE({gameID , gameConnectionDB , winnerPosition:currentPlayerMark , connectionWs})
            }
        }else{
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"Game session does not exist"} , post:"playerGuess"})
            ))
        }
    }catch(err)
    {
        connectionWs.send(JSON.stringify(
            new createClientMultiplayer({msg:{type:"serverError" , msg:err.message} , post:"playerGuess"})
        ))
    }
}




async function clientTimeOut__MODE1 (msg , connectionWs , gameConnectionDB){
    const {userID , gameID} = msg;

    try{
        const gameSessionCache = tempconnectObj__getData({key:gameID});

        if(gameSessionCache)
        {   
            let currentPlayerMark = '';

            for(let i = 0; i < gameSessionCache.playersCount; i++)
            {
                if(gameSessionCache.playersID[`player${i+1}`][0] === userID)
                {
                    currentPlayerMark = `player${i+1}`;
                    break;
                }
            }


            await endGameSeq_MODE({gameID , gameConnectionDB , winnerPosition:currentPlayerMark === "player1" ? "player2" : "player1", connectionWs})

        }else{
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"wsConnectionFailed" , msg:"Game session does not exist"} , post:"playerGuess"})
            ))
        }
    }catch(err)
    {
        connectionWs.send(JSON.stringify(
            new createClientMultiplayer({msg:{type:"serverError" , msg:err.message} , post:"clientTimeOut"})
        ))
    }
}




async function endGameSeq_MODE({gameID , gameConnectionDB , winnerPosition , connectionWs , initiatorLose = false , tournamentConnection = null}){
    try{
        const gameSession = await gameConnectionDB.findOneAndUpdate(
            { gameID },
            {$set : {
                        hasStart:false ,
                        isEnd:true,
                        gameRecord:tempconnectObj__getData({key:gameID}).gameRecord,
                        deadPoints:tempconnectObj__getData({key:gameID}).deadPoints,
                        gameCalls:tempconnectObj__getData({key:gameID}).gameCalls
                    }},
            {new:true}
        );

        if(initiatorLose)
        {
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"gameEnd" , gameWinner:winnerPosition , status:"defeat"}, post:"serverAuto"}
            )))

            sendJointParcel_exceptCurrentConnection({gameID , parcel:{type:"gameEnd" , gameWinner:winnerPosition , status:"winner"} , post:"serverAuto" , currentPlayerMark:winnerPosition});
        }else {
            connectionWs.send(JSON.stringify(
                new createClientMultiplayer({msg:{type:"gameEnd" , gameWinner:winnerPosition , status:"winner"}, post:"serverAuto"}
            )))

            sendJointParcel_exceptCurrentConnection({gameID , parcel:{type:"gameEnd" , gameWinner:winnerPosition , status:"defeat"} , post:"serverAuto" , currentPlayerMark:winnerPosition});
        }

        //Delete game session
        const timer__ = setTimeout(() => {
            tempconnectObj__delData({key:gameID});
            clearTimeout(timer__);
        }, 3000);
        //Delete game session

        //Check if game is tournament base
        if(gameSession.tournamentBase)
        {
            tournamentBase__createPair__endGame
            ({gameSession , tournamentConnection , gameConnectionDB , winnerID:gameSession.playersID[`${winnerPosition}`][0]});
        }else{
            //Do something , say decrement coin of loser or any other thing
        }
        //Check if game is tournament base

    }catch(err)
    {
        sendJointParcel({gameID , parcel:{type:"serverError" , msg:err.message} , post:"endGameOperation"})
    }
}



module.exports = {
    sendNupdateConnection:sendNupdateConnection,
    sendNupdateRe_connection:sendNupdateRe_connection,
    getCallsNupdate_MODE1:getCallsNupdate_MODE1,
    getCallsNupdate_MODE2:getCallsNupdate_MODE2,
    clientTimeOut__MODE1:clientTimeOut__MODE1,
    checkAllPlayers__start__bySecretCode:checkAllPlayers__start__bySecretCode,
    checkAllPlayers__start__connection:checkAllPlayers__start__connection,
    endGameSeq_MODE:endGameSeq_MODE
}