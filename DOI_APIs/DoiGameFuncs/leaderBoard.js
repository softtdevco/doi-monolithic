const getGameLeaderBoard = async({leaderBoardConnection , searchObj}) =>{
    try{
        let top10LeaderBoard;

        if(searchObj.mode === "global")
        {
            top10LeaderBoard = await leaderBoardConnection.find()
            .sort({ XP: -1 })
            .limit(10);
        }else
        {
            top10LeaderBoard = await leaderBoardConnection.find({country:searchObj.country})
            .sort({ XP: -1 })
            .limit(10);
        }
    
        console.log(top10LeaderBoard);
    
        return {ok:true , data:{type:"leaderBoardFetchSuccess" , msg:top10LeaderBoard}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


module.exports = {
    getGameLeaderBoard:getGameLeaderBoard
}