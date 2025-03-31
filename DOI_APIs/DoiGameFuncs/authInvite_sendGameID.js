const { getJwtPayload, failedJwtAuth, createJwtToken } = require("../utils/jwtAuth");

const authInviteCode = async({connection , userID , inviteCode , anonymous}) =>{
    try
    {
        const gameExists = await connection.findOne({
            $or: [{ invitableCode: `${inviteCode}`}],
        });

        if(gameExists)
        {
            if(getJwtPayload({token:gameExists.jwtGameAuth}))
            {
                const playersID = gameExists.playersID;
                let allEmpty = true;
                for(let i = 0; i < gameExists.playersCount; i++)
                {
                    if(playersID[`player${i+1}`].length === 0)
                    {
                        allEmpty = false;
                        playersID[`player${i+1}`].push(userID);
                        if(!allEmpty) break;
                    }else 
                    {
                        if(playersID[`player${i+1}`][0] === userID){
                            allEmpty = false;
                            break;
                        }
                    }
                }
                if(allEmpty)
                {
                    return {ok:false , data:{type:"gameIdQueryFailed" , msg:"Player list is full"}};
                }else{
                    await connection.findOneAndUpdate(
                        {hostID:gameExists.hostID},
                        {$set : {playersID:playersID}},
                        {new:false}
                    )

                    return {ok:true , data:{type:"gameIdQuerySuccess" , msg:{gameID:gameExists.gameID , ...(() =>{return anonymous ? {tempID:createJwtToken({cred:userID})} : {}})()}}};
                }

            }else return {ok:false , data:{type:"jwtAuthFailed" , msg:"Game session expired!"}}
        }else return {ok:false , data:{type:"gameIdQueryFailed" , msg:"Game session does not EXIST!"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

module.exports = {
    authInviteCode:authInviteCode
}