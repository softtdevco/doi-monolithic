const { createNewGameSession } = require("../DoiGameFuncs/createGameSession");

const {v4:uuidv4} = require("uuid");
const { multiplayerGameModes } = require("./multiplayerUtils");

class createTournament{
    constructor({data,tournamentID} = {})
    {
        const {userID , name , type , gameMode = multiplayerGameModes.mode1 , entrySettings , startDate_time , pricePool , matchTimeLimit , allowSpectators , autoStart , pricePoolType , tMode = "singleElimination" , startDuration , playerNo , guessDigitCount = 4} = data;

        const customGameSettings = {gameMode , matchTimeLimit , guessDigitCount};

        this.tID = tournamentID;
        this.hostID = userID
        this.name = name;
        this.pairingAlgorithm = tMode;
        this.privacy = type;
        this.currentStageNum = 1;
        this.regAlive = true;
        this.playersCount = playerNo
        this.tournamentAlive = true;
        this.universalPlayers = [];
        this.optionalGamesCustomisation = customGameSettings;
        this.entrySettings = entrySettings;
        this.startDate_time = startDate_time;
        this.startTimeToken = startDuration; //time token in min
        this.pricePool = pricePool;
        this.allowSpectators = allowSpectators;
        this.autoStart = autoStart;
        this.pricePoolType = pricePoolType;
        this.gameObject = {
            'stage1': new createStage() 
        }
    }
}


class createStage{
    constructor({participants = []} = {}){
        this.participants = participants;
        this.pairing = new Array();
        this.otherInfo = [];
        this.winners = [];
        this.games = 0;
        this.count = 0;
    }
}


function convertDateToMinutes({token,unit} = {})
{
    const timlify = {
        'months' : 30 * 24 * 60,
        'weeks' : 7 * 24 * 60,
        'days' : 24 * 60,
        'hours' : 1 * 60,
        'minutes' : 1
    }
    return Number(token) * timlify[unit]
}

function getDuration_date_time({timeStamp1 , timeStamp2})
{
    let err__ = {status:false , msg:""};
    let duration;
    try{
        const timeStamp1_ISO = new Date(timeStamp1);
        const timeStamp2_ISO = new Date(timeStamp2); 
    
        duration = timeStamp2_ISO - timeStamp1_ISO;
    }catch(err)
    {
        err__.status = true;
        err__.msg = err.message;
    }

    return {token:duration / (1000 * 60) , errorObj:err__};
}


const endTournamentRegistration = async({tID , tournamentConnection , createGame_connection}) =>{
    await tournamentConnection.findOneAndUpdate(
        { tID },
        {$set : {regAlive:false}},
        {new:false}
    );

    //Start pairing of players
    startTournament__updateTournamentStage({tournamentConnection , createGame_connection , tID})
    //Start pairing of players
}



function pairTournamentPlayers({tournamentSession})
{
        const virtualParticipants = tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].participants;
    
        switch(`${(virtualParticipants.length / 2)}`.includes('.'))
        {
            case true:
                const randNumber = Math.round(Math.random()*(virtualParticipants.length-1));
                tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].winners.push(
                    virtualParticipants[randNumber]
                );
                virtualParticipants.splice(randNumber,1)
            break;
        }
    
        const length = virtualParticipants.length/2;
        tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].games = length;
    
        for(let i = 0; i < length; i++)
        {
            const pairArray = []
            for(let j = 0; j < 2; j++)
                {
                    const randNumber = Math.round(Math.random()*(virtualParticipants.length-1));

                    pairArray.push(
                        virtualParticipants[randNumber]
                    )
                    virtualParticipants.splice(randNumber,1)
                }
            
                tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].pairing.push(
                    pairArray
                )
        }

    return tournamentSession;
}


async function createGameSession__tournamentPairs({tournamentSession , createGame_connection})
{
    const otherInfo = [];
    for(let i = 0; i < tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].pairing.length; i++)
    {
        const newGameSessionInfo = await createNewGameSession({
            userID:tournamentSession.hostID ,
            tournamentInfo:{tID:tournamentSession.tID},
            duration:tournamentSession.optionalGamesCustomisation.matchTimeLimit,
            playersCount:tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].pairing[i].length,
            gameType:tournamentSession.optionalGamesCustomisation.gameMode,
            guessDigitCount:tournamentSession.optionalGamesCustomisation.guessDigitCount,
            initID:uuidv4,
            gameMode:multiplayerGameModes.mode1,
            createGame_connection
        })

        if(newGameSessionInfo.ok)
        {
            tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].otherInfo.push(newGameSessionInfo.data.msg);
        }else console.error(newGameSessionInfo.data.msg)
    }

    return tournamentSession;
}



async function startTournament__updateTournamentStage({tournamentConnection , tID , createGame_connection})
{
    let tournamentSession = await tournamentConnection.findOne({
        $or: [{ tID }],
    });

    //send all players to stage1
    tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].participants = tournamentSession.universalPlayers;
    //send all players to stage1

    //pair stage1 players
    tournamentSession = pairTournamentPlayers({tournamentSession});
    //pair stage1 players

    //create game sessions for each pairs
    tournamentSession = createGameSession__tournamentPairs({tournamentSession , createGame_connection})
    //create game sessions for each pairs

    //update game DB info
    await tournamentConnection.findOneAndUpdate(
        { tID },
        {$set : {gameObject:tournamentSession.gameObject}},
        {new:false}
    )
    //update game DB info


    //send game invites to participating players

    //send game invites to participating players

    console.log(`tournament stage${tournamentSession.currentStageNum} created successfully`)
}

async function createNewStage__updateTournamentStage({tournamentSession , gameConnectionDB , tournamentConnection})
{
    const {winners:currentStagePlayers} = tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`];
    //first increment current stage
    tournamentSession.currentStageNum++;
    //first increment current stage

    //assign new stage object
    tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`] = new createStage({participants:currentStagePlayers})
    //assign new stage object

    //pair stage players
    tournamentSession = pairTournamentPlayers({tournamentSession});
    //pair stage players

    //create game sessions for each pairs
    tournamentSession = createGameSession__tournamentPairs({tournamentSession , createGame_connection:gameConnectionDB})
    //create game sessions for each pairs
    
    //update game DB info
    await tournamentConnection.findOneAndUpdate(
        { tID },
        {$set : {gameObject:tournamentSession.gameObject}},
        {new:false}
    )
    //update game DB info 

    //send game invites to participating players

    //send game invites to participating players
}


async function endTournament__deleteTournament({tournamentSession})
{
    const {tID} = tournamentSession;
    try
    {
        await tournamentConnection.deleteOne({ tID: body.tID });

        console.log(`successfully deleted ${tournamentSession.name} tournament`);
    }catch(err)
    {
        console.log(err.message);
    }
}



async function tournamentBase__createPair__endGame({gameSession , tournamentConnection , gameConnectionDB , winnerID})
{
    const {gameID , tournamentInfo} = gameSession;
    const {tID} = tournamentInfo;

    let tournamentSession = await tournamentConnection.findOne({
        $or: [{ tID }],
    });

    let {count , games , winners} = tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`];

    //Increment tournament game count
    tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].count +=1;
    //Increment tournament game count

    //push winner ID to game object winner array
    tournamentSession.gameObject[`stage${tournamentSession.currentStageNum}`].winners.push(winnerID);
    //push winner ID to game object winner array

    if(games === count)
    {
        if(winners < 2)
        {
            //end tournament

            //events to handle before deleting tournament

            //events to handle before deleting tournament
            endTournament__deleteTournament({tournamentSession});

            //end tournament
        }else
        {
            //End current stage and create new stage
            createNewStage__updateTournamentStage({tournamentSession , gameConnectionDB , tournamentConnection})
            //End current stage and create new stage
        }
    }
    else{
        //update game DB info
        await tournamentConnection.findOneAndUpdate(
            { tID },
            {$set : {gameObject:tournamentSession.gameObject}},
            {new:false}
        )
        //update game DB info
    }
}


module.exports = {
    createTournament:createTournament,
    createStage:createStage,
    convertDateToMinutes:convertDateToMinutes,
    getDuration_date_time:getDuration_date_time,
    endTournamentRegistration:endTournamentRegistration,
    pairTournamentPlayers:pairTournamentPlayers,
    tournamentBase__createPair__endGame:tournamentBase__createPair__endGame
}