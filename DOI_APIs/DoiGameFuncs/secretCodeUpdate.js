const { tempconnectObj__getData } = require("../DoiTempCache/playersConnectionCache");
const { multiplayerGameModes } = require("../utils/multiplayerUtils");

const UploadSecretCode = async({connection , gameID , secretCode , userID}) =>{
    try{
        const gameSessionExist = await connection.findOne({
            $or: [{ gameID }],
        });
    
        if(gameSessionExist.gameMode === multiplayerGameModes.mode1)
        {
            if(secretCode.length === gameSessionExist.guessDigitCount)
                {
                    let currentPlayerMark = "";
            
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
                        const secretCodeObj = gameSessionExist.secretCodes;
                        if(secretCodeObj[currentPlayerMark].length === 0)
                        {
                            secretCodeObj[currentPlayerMark].push(secretCode);
                            if(tempconnectObj__getData({key:gameID}))
                            {
                                tempconnectObj__getData({key:gameID}).secretCodes[currentPlayerMark] = [secretCode];
                                await connection.findOneAndUpdate(
                                    { gameID },
                                    {$set : {secretCodes:secretCodeObj}},
                                    {new:false}
                                )
                            }
                        }
            
                        return {ok:true , data:{type:"secretCodeUpdateSuccess" , msg:"secret code uploaded successfully"}};
                    }else return {ok:false , data:{type:"secretCodeUpdateFailed" , msg:"Could not match playerID with game session"}};
                }else return {ok:false , data:{type:"secretCodeUpdateFailed" , msg:"invalid secret code, secret code doesn't match with game guessing count"}};
        }else return {ok:false , data:{type:"secretCodeUpdateFailed" , msg:"invalid Game mode, cannot upload secret code in this game mode"}}
    }catch(err)
    {
        console.log(err)
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

module.exports = {
    UploadSecretCode:UploadSecretCode
}