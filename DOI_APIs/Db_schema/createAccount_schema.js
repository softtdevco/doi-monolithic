const newUser = ({connection,mongoose}) =>{
    const schema = mongoose.Schema({
        userID:{
            type:String,
            required:true
        },
        deviceID:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:false
        },
        password:{
            type:String,
            required:false
        },
        username:{
            type:Array,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        avatar:{
            type:String,
            required:true
        },
        notification:{
            type:Array,
            required:false
        }
        
    })

    return connection.model('UsersAccount',schema)
}

module.exports = newUser