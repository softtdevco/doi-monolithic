const deleteTournamentFunc = async({userID , body , tournamentConnection , UsersAccount_connection}) =>{
    try
    {
        const tournamentSessionExist = await tournamentConnection.findOne({
            $or: [{ tID:body.tID }],
        });

        if(tournamentSessionExist)
        {
            if(tournamentSessionExist.hostID === userID)
            {
                await tournamentConnection.deleteOne({ tID: body.tID });

                return {ok:true , data:{type:"deleteTournamentSuccess" , msg:`successfully deleted ${tournamentSessionExist.name} tournament`}};
            }else return {ok:false , data:{type:"deleteTournamentFailed" , msg:"Only tournament Host can initiate this action!"}};
        }else return {ok:false , data:{type:"deleteTournamentFailed" , msg:"Tournament session does not EXIST!"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

module.exports = {
    deleteTournamentFunc:deleteTournamentFunc
}