const { sendNupdateConnection, getCallsNupdate_MODE1 , endGameSeq_MODE1, getCallsNupdate_MODE2, clientTimeOut__MODE1, sendNupdateRe_connection } = require("../DoiGameFuncs/multiplayerBase");
const { failedJwtWsAuth, getJwtPayload } = require("../utils/jwtAuth");
const { sendMissingCredResponseWs } = require("../utils/MissingCred");
const { createClosedConnectionInfo, createClientMultiplayer, multiplayerGameModes } = require("../utils/multiplayerUtils");
const {sendNupdateConnectionCred , playerGuessCred , playerTimeOutCred} = require("../utils/onboardingCred.json")

const multiplayerRouteBoard = async ({reqData , ws , gameConnectionDB , userConnectionDB , tournamentConnection}) =>{
    switch(reqData.post)
    {
        case 'connection':
            if(reqData.body)
            {
                if(reqData.body.jwtToken && reqData.body.gameID)
                    {
                        const payload = getJwtPayload({token:reqData.body.jwtToken});
                        if(payload)
                        {
                            reqData.body.userID = payload.cred;
        
                            const routeResponse = await sendNupdateConnection(reqData.body , ws , gameConnectionDB , userConnectionDB);

                        }else failedJwtWsAuth({ws})
                    }else sendMissingCredResponseWs({credArray:sendNupdateConnectionCred , ws:ws , req:reqData.body})
            }else sendMissingCredResponseWs({credArray:["body"] , ws:ws , req:reqData})
        break;
        case 'playerGuess':
            if(reqData.body)
            {
                let {jwtToken , gameID , guess , clockTimer , gameMode} = reqData.body;
                if(jwtToken && gameID && guess && clockTimer && gameMode)
                {
                    const payload = getJwtPayload({token:jwtToken});
                    if(payload)
                    {
                        reqData.body.userID = payload.cred;
                        if(gameMode === multiplayerGameModes.mode1) await getCallsNupdate_MODE1(reqData.body , ws , gameConnectionDB , tournamentConnection);
                        else if(gameMode === multiplayerGameModes.mode1)await getCallsNupdate_MODE2(reqData.body , ws , gameConnectionDB);
                        else ws.send(JSON.stringify(
                            new createClientMultiplayer({msg:{type:"invalidGameMode" , msg:"Invalid game mode"} , post:"playerGuess"})
                        ))

                    }else failedJwtWsAuth({ws})
                }else sendMissingCredResponseWs({credArray:playerGuessCred , ws:ws , req:reqData.body})
            }else sendMissingCredResponseWs({credArray:["body"] , ws:ws , req:reqData})
        break;
        case 'playerTimeOut':
            if(reqData.body)
                {
                    let {jwtToken , gameID} = reqData.body;
                    if(jwtToken && gameID)
                    {
                        const payload = getJwtPayload({token:jwtToken});
                        if(payload)
                        {
                            reqData.body.userID = payload.cred;
    
                            await clientTimeOut__MODE1(reqData.body , ws , gameConnectionDB);
    
                        }else failedJwtWsAuth({ws})
                    }else sendMissingCredResponseWs({credArray:playerTimeOutCred , ws:ws , req:reqData.body})
                }else sendMissingCredResponseWs({credArray:["body"] , ws:ws , req:reqData})
        break;
        case 're_connect':
            if(reqData.body)
                {
                    if(reqData.body.jwtToken && reqData.body.gameID)
                        {
                            const payload = getJwtPayload({token:reqData.body.jwtToken});
                            if(payload)
                            {
                                reqData.body.userID = payload.cred;
            
                                const routeResponse = await sendNupdateRe_connection(reqData.body , ws , gameConnectionDB , userConnectionDB);
    
                            }else failedJwtWsAuth({ws})
                        }else sendMissingCredResponseWs({credArray:sendNupdateConnectionCred , ws:ws , req:reqData.body})
                }else sendMissingCredResponseWs({credArray:["body"] , ws:ws , req:reqData})
        break;
        default:
            ws.send(JSON.stringify(
                new createClientMultiplayer({msg:"invalid WS endpoint" , post:"invalidEndpoint"})
            ))
    }
}

module.exports = {
    multiplayerRouteBoard:multiplayerRouteBoard
}