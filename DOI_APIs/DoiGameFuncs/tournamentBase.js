const { fsUpdate_tempSession, newClockSync } = require("../utils/clockSyncUtils");
const { createTournament, getDuration_date_time } = require("../utils/tournamentUtils");

const createNewTournament = async({userID , body , initID , tournamentConnection}) =>{
    try
    {
        body.userID = userID;
        const durationObj = getDuration_date_time({timeStamp1:new Date().toDateString() , timeStamp2:body.startDate_time});
        if(!durationObj.errorObj.status)
        {
            const newTournament = new createTournament({data:body,tournamentID:initID()});
    
            const savedTournamentSession = new tournamentConnection(newTournament);
    
            await savedTournamentSession.save();
    
            console.log(newTournament);
    
            fsUpdate_tempSession({data:new newClockSync({ID:newTournament.tID , duration:durationObj.token})});
    
            console.log("Timing session initiated");
    
            return {ok:true , data:{type:"tournamentCreationSuccess" , msg:"tournament created successfully"}};
        }else return {ok:false , data:{type:"serverError" , msg:`${durationObj.errorObj.msg} -- Occured at setting the tournament start date and time`}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}}
    }
};


module.exports = {
    createNewTournament:createNewTournament
}