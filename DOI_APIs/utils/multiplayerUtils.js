const { tempconnectObj__getData, tempconnectObj__delData } = require("../DoiTempCache/playersConnectionCache");

class connectionInit{
    constructor(playersCount , gameMode , guessDigitCount , playersID , secretCodes)
    {
        this.playersObj = {};
        this.connectionTrack = 0;
        this.gameMode = gameMode;
        this.secretCodes = secretCodes;
        this.disconnectedUsers = [];
        this.guessDigitCount = guessDigitCount;
        this.playersID = playersID;
        this.playersCount = playersCount;
        this.playerTurn = "player1";
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
        this.clockTimer = {
            ...(() =>{
                let obj = {};
                for(let i = 0; i < playersCount; i++)
                {
                    obj[`player${i+1}`] = [];
                }
                return obj;
            })()
        }
        this.createPlayerConnection = () =>{
            for(let i = 0; i < playersCount; i++)
            {
                this.playersObj[`player${i+1}`] = [];
            }
        }
        this.createPlayerConnection();

        this.getObject = () =>{
            delete this.createPlayerConnection;
            delete this.getObject
            return this;
        }
    }
}


class createClientMultiplayer{
    constructor({msg = {},post = ''} = {})
    {
        this.type = 'multiplayer';
        this.post = post;
        this.data = msg
    }
}


const createClosedConnectionInfo = ({gameID , currentPlayerMark , defectConnection}) =>{
    //clear user connection from game session
    tempconnectObj__getData({key:gameID}).playersObj[currentPlayerMark] = [];
    //clear user connection from game session

    //Mark player as disconnected
    tempconnectObj__getData({key:gameID}).disconnectedUsers.push(currentPlayerMark);
    //Mark player as disconnected

    tempconnectObj__getData({key:gameID}).connectionTrack--;

    if(Object.keys(tempconnectObj__getData({key:gameID}).playersObj).length > 0)
    {
        sendJointParcel_exceptCurrentConnection({gameID , parcel:{type:"playerDisconnect" , msg:{player:currentPlayerMark , playState:"pause"}} , post:"serverAuto" , currentPlayerMark});
    }else{
        //Delete game session
        const timer__ = setTimeout(() => {
            tempconnectObj__delData({key:gameID});

            clearTimeout(timer__);
        }, 3000);
        //Delete game session
    }
    
}


const sendJointParcel = ({parcel , gameID , post}) =>{
    Object.keys(tempconnectObj__getData({key:gameID}).playersObj).forEach(val =>{
        switch(tempconnectObj__getData({key:gameID}).playersObj[`${val}`].length > 0)
        {
            case true:
                tempconnectObj__getData({key:gameID}).playersObj[`${val}`][0].send(JSON.stringify(
                    new createClientMultiplayer({msg:parcel,post:post})
                ))
        }
    })
}

const sendJointParcel_exceptCurrentConnection = ({parcel , gameID , post , currentPlayerMark}) =>{
    Object.keys(tempconnectObj__getData({key:gameID}).playersObj).forEach(val =>{
        if(val !== currentPlayerMark)
        {
            switch(tempconnectObj__getData({key:gameID}).playersObj[`${val}`].length > 0)
            {
                case true:
                    tempconnectObj__getData({key:gameID}).playersObj[`${val}`][0].send(JSON.stringify(
                        new createClientMultiplayer({msg:parcel,post:post})
                    ))
            }
        }
    })
}

const multiplayerGameModes = {
    mode1:"1v1",//one vs one (2 players max)
    mode2:"gv1"//group vs 1 (groupplayers)
}

const serverSecretCodeGenerator = (count) =>{
    let mainCode = "";

    for(let i = 0; i < count; i++)
    {
        gen();
        function gen()
        {
            let rand = Math.floor(Math.random()*9);
            
            mainCode.includes(`${rand}`) ? gen() : mainCode += rand;
        }
    }

    return mainCode;
}


const generateNextPlayer = (currentPlayer , maxPlayerCount) =>{
    let playerIndex = Number(currentPlayer.split("player")[1]);
    if(playerIndex === maxPlayerCount) playerIndex = 1;
    else playerIndex++;

    return `player${playerIndex}`;
}

const processCalls = ({guess,sCode , guessDigitCount}) =>{
    let deadCalls = 0;
    let injuredCalls = 0;
    const callArray = Array(guessDigitCount).fill("");

    for(let i = 0; i < guessDigitCount; i++)
    {
        if(guess[i] === sCode[i])
        {
            deadCalls++;
            callArray[i] = "dead";
        }
        else{
            const getIndex = sCode.indexOf(guess[i]);
            if(getIndex !== -1)
            {
                injuredCalls++
                callArray[i] = "injured";
            }
        }
    }

    return {
        callArray : callArray,
        callString:`${deadCalls}D   ${injuredCalls}I`,
        guess:guess,
        dead:deadCalls,
        injured:injuredCalls
    }
}



module.exports = {
    connectionInit:connectionInit,
    createClosedConnectionInfo:createClosedConnectionInfo,
    sendJointParcel:sendJointParcel,
    sendJointParcel_exceptCurrentConnection:sendJointParcel_exceptCurrentConnection,
    createClientMultiplayer:createClientMultiplayer,
    multiplayerGameModes:multiplayerGameModes,
    processCalls:processCalls,
    serverSecretCodeGenerator:serverSecretCodeGenerator,
    generateNextPlayer:generateNextPlayer
}