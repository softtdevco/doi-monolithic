const { endTournamentRegistration } = require("../utils/tournamentUtils");

const joinTournamentFunc = async({userID , body , tournamentConnection , UsersAccount_connection}) =>{
    try
    {
        const tournamentSessionExist = await tournamentConnection.findOne({
            $or: [{ tID:body.tID }],
        });

        if(tournamentSessionExist)
        {
            if(tournamentSessionExist.regAlive)
            {
                tournamentSessionExist.universalPlayers.push(userID);

                //deduct coins from player DOI coin based on tournament requirement --> to host coin

                //deduct coins from player DOI coin based on tournament requirement --> to host coin

                await tournamentConnection.findOneAndUpdate(
                    { tID:body.tID },
                    {$set : {universalPlayers:tournamentSessionExist.universalPlayers}},
                    {new:false}
                );

                if(tournamentSessionExist.universalPlayers.length === tournamentSessionExist.playersCount)
                {
                    // Start tournament and sent regAlive to false
                    endTournamentRegistration({tID , tournamentConnection});
                    // Start tournament and sent regAlive to false
                }

                return {ok:true , data:{type:"joinTournamentSuccess" , msg:`successfully joined ${tournamentSessionExist.name} tournament`}};
            }else return {ok:false , data:{type:"joinTournamentFailed" , msg:"Tournament registration has ENDED!"}};
        }else return {ok:false , data:{type:"joinTournamentFailed" , msg:"Tournament session does not EXIST!"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


module.exports = {
    joinTournamentFunc:joinTournamentFunc
}