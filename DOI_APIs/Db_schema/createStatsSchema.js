const newUserStats = ({connection,mongoose}) =>{
    const schema = mongoose.Schema({
        userID:{
            type:String,
            required:true
        },
        username:{
            type:String,
            required:true
        },
        dailyStreak:{
            type:Number,
            required:true
        },
        matchPlayed:{
            type:Number,
            required:true
        },
        shortestGameTime:{
            type:Number,
            required:true
        },
        rank:{
            type:Number,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        dateJoined:{
            type:String,
            required:true
        },
        achievements:{
            type:Array,
            required:true
        }
        
    })

    return connection.model('userStats',schema)
}

module.exports = newUserStats