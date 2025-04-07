const leaderBoard = ({connection,mongoose}) =>{
    const schema = mongoose.Schema({
        username:{
            type:String,
            required:true
        },
        userID:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        XP:{
            type:Number,
            required:true
        },

    })

    return connection.model('DOILeaderBoard',schema)
}

module.exports = leaderBoard