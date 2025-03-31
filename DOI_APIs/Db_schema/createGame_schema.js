const newGameSession = ({connection,mongoose}) =>{
    const schema = mongoose.Schema({
        gameID:{
            type:String,
            required:true
        },
        hostID:{
            type:String,
            required:true
        },
        invitableCode:{
            type:String,
            required:true
        },
        clockTimer:{
            type:Object,
            required:false
        },
        playersID:{
            type:Object,
            required:false
        },
        secretCode:{
            type:Object,
            required:false
        },
        gameRecord:{
            type:Object,
            required:false
        },
        deadPoints:{
            type:Object,
            required:false
        },
        gameCalls:{
            type:Object,
            required:false
        },
        playerAppInfo:{
            type:Object,
            required:false
        },
        connectionTrack:{
            type:Number,
            required:false
        },
        tournamentBase:{
            type:Boolean,
            required:true
        },
        tournamentInfo:{
            type:Object,
            required:false
        },
        jwtGameAuth:{
            type:String,
            required:true
        },
        playersCount:{
            type:Number,
            required:true
        },
        gameType:{
            type:String,
            required:true
        },
        guessDigitCount:{
            type:Number,
            required:true
        }
        
    })

    return connection.model('GameSessions',schema)
}

module.exports = newGameSession