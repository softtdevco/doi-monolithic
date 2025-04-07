const { tempconnectObj__getData } = require("../DoiTempCache/playersConnectionCache");
const { getJwtPayload, failedJwtAuth, createJwtToken } = require("../utils/jwtAuth");

const authInviteCode = async({connection , userConnection , userID , inviteCode , anonymous}) =>{
    try
    {
        const gameExists = await connection.findOne({
            $or: [{ invitableCode: `${inviteCode}`}],
        });

        const userExists = await userConnection.findOne({
            $or: [{ userID }],
        } , "username avatar");

        if(gameExists)
        {
            if(getJwtPayload({token:gameExists.jwtGameAuth}))
            {
                const playersID = gameExists.playersID;
                let allEmpty = true;
                let currentPlayerMark;

                for(let i = 0; i < gameExists.playersCount; i++)
                {
                    if(playersID[`player${i+1}`].length === 0)
                    {
                        allEmpty = false;
                        playersID[`player${i+1}`].push(userID);
                        gameExists.playerAppInfo[`player${i+1}`].push({username:userExists.username , avatar:userExists.avatar});
                        if(!allEmpty) break;
                    }else 
                    {
                        if(playersID[`player${i+1}`][0] === userID){
                            allEmpty = false;
                            currentPlayerMark = `player${i+1}`;
                            break;
                        }
                    }
                }
                if(allEmpty)
                {
                    return {ok:false , data:{type:"gameIdQueryFailed" , msg:"Player list is full"}};
                }else{
                   if(!currentPlayerMark)
                   {
                        await connection.findOneAndUpdate(
                            {hostID:gameExists.hostID},
                            {$set : {playersID:playersID , playerAppInfo:gameExists.playerAppInfo}},
                            {new:false}
                        );
                   }

                    let reconnecObj = {};
                    if(tempconnectObj__getData({key:gameExists.gameID}))
                    {
                        console.log(tempconnectObj__getData({key:gameExists.gameID}).disconnectedUsers)
                        if(tempconnectObj__getData({key:gameExists.gameID}).disconnectedUsers.includes(currentPlayerMark))
                        {
                            reconnecObj.reconnection = true;
                        }
                    }

                    return {ok:true , data:{type:"gameIdQuerySuccess" , msg:{gameID:gameExists.gameID , gameMode:gameExists.gameMode , ...reconnecObj , ...(() =>{return anonymous ? {tempID:createJwtToken({cred:userID})} : {}})()}}};
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