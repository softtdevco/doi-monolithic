const playerStats = async({playerID , userStatsConnection , leaderBoardConnection , UsersAccount_connection}) =>{
    try{
        const playerExists = await UsersAccount_connection.findOne({
            $or: [{ userID: `${playerID}`}],
        });

        if(playerExists)
        {
            const playerLeaderBoard = await leaderBoardConnection.findOne({
                $or: [{ userID: `${playerID}`}],
            } , {XP:1});

            const playerStats = await userStatsConnection.findOne({
                $or: [{ userID: `${playerID}`}],
            } , {_id:0});

            playerStats.XP = playerLeaderBoard.XP;

            return {ok:true , data:{type:"statsFetchSuccess" , msg:playerStats}};
        }else return {ok:false , data:{type:"statsFetchFailed" , msg:"User does not EXIST"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

module.exports = {
    playerStats:playerStats
}