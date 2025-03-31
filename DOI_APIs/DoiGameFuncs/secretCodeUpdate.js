const UploadSecretCode = async({connection , gameID , secretCode , userID}) =>{
    try{
        const gameSessionExist = await connection.findOne({
            $or: [{ gameID }],
        });
    
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
                const secretCodeObj = gameSessionExist.secretCode;
                if(secretCodeObj[currentPlayerMark].length === 0)
                {
                    secretCodeObj[currentPlayerMark].push(secretCode);
                    await connection.findOneAndUpdate(
                        { gameID },
                        {$set : {secretCode:secretCodeObj}},
                        {new:false}
                    )
                }
    
                return {ok:true , data:{type:"secretCodeUpdateSuccess" , msg:"secret code uploaded successfully"}};
            }else return {ok:false , data:{type:"secretCodeUpdateFailed" , msg:"Could not match playerID with game session"}};
        }else return {ok:false , data:{type:"secretCodeUpdateFailed" , msg:"invalid secret code, secret code doesn't match with game guessing count"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

module.exports = {
    UploadSecretCode:UploadSecretCode
}