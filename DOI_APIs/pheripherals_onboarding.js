const { createJwtToken } = require("./utils/jwtAuth");

const syncUserAccount = async ({connection , cred = {}}) =>{
    try{
        const userExists = await connection.findOne({
            $or: [{ email: `${cred.email}`}],
        });

        if(!userExists)
        {
            const syncUser = await connection.findOneAndUpdate(
                {userID:cred.userID},
                {$set : {email:cred.email , password:cred.password}},
                {new:true}
            )

            if(syncUser) return {ok:true , data:{type:"syncSuccessful" , msg:"User account synced"}};
            else return {ok:false , data:{type:"syncFailed" , msg:"Could not find account with specified ID"}};
        }else
        {
            if(userExists.email === cred.email)
            {
                return {ok:false , data:{type:"AccountSynced" , msg:"Email already synced to your account"}}   
            }else return {ok:false , data:{type:"unavailableEmail" , msg:"Email already synced to another account"}}   
        }

    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}



const loginUserAccount = async ({connection , cred = {}}) =>{
    try{
        const userExists = await connection.findOne({
            $or: [{ email: `${cred.email}`}],
        });

        if(userExists)
        {
            if(cred.password === userExists.password)
            {
                const newDeviceUser = await connection.findOneAndUpdate(
                    {userID:userExists.userID},
                    {$set : {deviceID:cred.deviceID}},
                    {new:false}
                )

                if(newDeviceUser) return {ok:true , data:{type:"loginSuccessful" , msg:createJwtToken({cred:userExists.userID} , "1d")}};
                else{
                    return {ok:false , data:{type:"loginFailed" , msg:"Could not update new deviceID"}};
                }
            }else
            {
                return {ok:false , data:{type:"invalidPassword" , msg:"incorrect user password"}};
            }
            
        }else{
            return {ok:false , data:{type:"unavailableAccount" , msg:"Email doesn't exist"}};
        }

    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


const userRegistration = async ({connection , initID , cred}) =>{
    try
    {
        const userExists = await connection.findOne({
            $or: [{ deviceID: `${cred.deviceID}`}],
        });

        if(!userExists)
        {
            const userID = initID();
            const userSaveObject = new connection({userID:userID , username:cred.username , country:cred.country , avatar:cred.avatar , deviceID:cred.deviceID});

            await userSaveObject.save();

            return {ok:true , data:{type:"registrationsuccess" , msg:createJwtToken({cred:userID} , "1d")}}
        }else return {ok:false , data:{type:"registrationFailed" , msg:"Device ID already exist"}}
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}

const deviceIDAuth = async({connection , cred}) =>{
    try
    {
        const userExists = await connection.findOne({
            $or: [{ deviceID: `${cred.deviceID}`}],
        });
        
        if(userExists)
        {
            return {ok:true , data:{type:"IDAuthSuccess" , msg:createJwtToken({cred:userExists.userID} , "1d")}}
        }else return {ok:false , data:{type:"deviceAuthFailed" , msg:"deviceID does not exist"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


const addUserName = async({connection , cred}) =>{
    try{
        const userExists = await connection.findOne({
            $or: [{ userID: `${cred.userID}`}],
        });

        if(userExists)
        {
            if(!userExists.username.includes(cred.username))
            {
                const userNameList = userExists.username;
                userNameList.push(cred.username);
    
                const addUserName_ = await connection.findOneAndUpdate(
                    {userID:userExists.userID},
                    {$set : {username:userNameList}},
                    {new:true}
                )
    
                if(addUserName_) return {ok:true , data:{type:"nameAddSuccessful" , msg:userExists.username}};
                else return {ok:false , data:{type:"nameAddFailed" , msg:"Could not add username"}};
            }else return {ok:false , data:{type:"nameAddFailed" , msg:"Username already exist"}};
        }else return {ok:false , data:{type:"nameAddFailed" , msg:"User does not EXIST"}};
    }catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


const updateCountry = async({connection , cred}) =>{
    try{
        const userExists = await connection.findOne({
            $or: [{ userID: `${cred.userID}`}],
        });

        if(userExists)
        {
            if(userExists.country !== cred.country)
            {
                const updateCountry_ = await connection.findOneAndUpdate(
                    {userID:userExists.userID},
                    {$set : {country:cred.country}},
                    {new:false}
                )
    
                if(updateCountry_) return {ok:true , data:{type:"countryUpdateSuccessful" , msg:"country updated successfully"}};
                else return {ok:false , data:{type:"countryUpdateFailed" , msg:`Failed to update user country, error with updating property using connection.findOneAndUpdate`}};
            }else return {ok:false , data:{type:"countryUpdateFailed" , msg:`country value is the same as previous value`}};
            
        }else return {ok:false , data:{type:"countryUpdateFailed" , msg:"User does not EXIST"}};
    }
    catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}


const updateAvatar = async({connection , cred}) =>{
    try{
        const userExists = await connection.findOne({
            $or: [{ userID: `${cred.userID}`}],
        });

        if(userExists)
        {
            if(userExists.avatar !== cred.avatar)
            {
                const updateAvatar_ = await connection.findOneAndUpdate(
                    {userID:userExists.userID},
                    {$set : {avatar:cred.avatar}},
                    {new:false}
                )
    
                if(updateAvatar_) return {ok:true , data:{type:"avatarUpdateSuccessful" , msg:"avatar updated successfully"}};
                else return {ok:false , data:{type:"avatarUpdateFailed" , msg:`Failed to update user avatar, error with updating property using connection.findOneAndUpdate`}};
            }else return {ok:true , data:{type:"avatarUpdateFailed" , msg:`avatar value is the same as previous value`}};
            
        }else return {ok:false , data:{type:"avatarUpdateFailed" , msg:"User does not EXIST"}};
    }
    catch(err)
    {
        return {ok:false , data:{type:"serverError" , msg:err.message}};
    }
}
module.exports = {
    syncUserAccount:syncUserAccount,
    loginUserAccount:loginUserAccount,
    userRegistration:userRegistration,
    deviceIDAuth:deviceIDAuth,
    addUserName:addUserName,
    updateCountry:updateCountry,
    updateAvatar:updateAvatar
}