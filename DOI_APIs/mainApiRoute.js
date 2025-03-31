require("dotenv").config();
const mongoose = require("mongoose");
const {v4:uuidv4} = require("uuid");

//Set up Atlas DB connection
const atlasConnection = mongoose.createConnection(process.env.connectionString,
{
    useUnifiedTopology:true,
    useNewUrlParser:true
});
//Set up Atlas DB connection

//Import Schemas
const createGame_connection = require("./Db_schema/createGame_schema")({connection:atlasConnection , mongoose:mongoose});

const UsersAccount_connection = require("./Db_schema/createAccount_schema")({connection:atlasConnection , mongoose:mongoose});
//Import Schemas

//Import Utils
const { emailReg } = require("./regEx/signUp_reg");

const { syncUserAccount, loginUserAccount, userRegistration, deviceIDAuth, addUserName, updateCountry, updateAvatar } = require("./pheripherals_onboarding");

const {regCred , email_syncCred , loginCred , loginDeviceIDCred , addUsernameCred , updateCountryCred , updateAvatarCred , createGameCred , authInviteCodeCred , updateSecretCodeCred} = require("./utils/onboardingCred.json");

const { createNewGameSession } = require("./DoiGameFuncs/createGameSession");
const {authInviteCode} = require("./DoiGameFuncs/authInvite_sendGameID")
const sendMissingCredResponse = require("./utils/MissingCred");
const { getJwtPayload, failedJwtAuth } = require("./utils/jwtAuth");
const { UploadSecretCode } = require("./DoiGameFuncs/secretCodeUpdate");
//Import Utils

const router = require("express").Router();

router
//sign up Endpoint
.post("/user/sync/signup" , async(req , res) =>{
        const {email , password , jwtToken} = req.body;
        if(email && password && jwtToken)
        {
            if(RegExp(emailReg()).test(email)){
                const payload = getJwtPayload({token:jwtToken});
                if(payload)
                {
                    const response = await syncUserAccount({connection:UsersAccount_connection , cred:{email , password , userID:payload.cred}});

                    res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
                }else failedJwtAuth({res});
                
            }
            else{
                res.status(400).send(JSON.stringify({reqStatus:"failed" , msg:"Please enter a valid Email"}));
            }
        }else {
            sendMissingCredResponse({credArray:email_syncCred , res , req});
        }
})
//sign up Endpoint





//log-in Endpoint
.post("/user/sync/login" , async(req , res) =>{
    const {email , password , deviceID} = req.body;
    if(email && password && deviceID)
    {
        if(RegExp(emailReg()).test(email)){

            const response = await loginUserAccount({connection:UsersAccount_connection , cred:{email , password , deviceID}});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }
        else{
            res.status(400).send(JSON.stringify({reqStatus:"failed" , msg:{data:"Please enter a valid Email"}}));
        }
    }else {
        sendMissingCredResponse({credArray:loginCred , res , req});
    }
})
//log-in Endpoint





//User registration
.post("/user/deviceID/registration" , async(req , res) =>{
    let {username , country , avatar , deviceID} = req.body;

    if(username && country && avatar && deviceID)
    {
        try{username.forEach(val =>{})}catch(err){username = [username]};
        const response = await userRegistration({connection:UsersAccount_connection , initID:uuidv4 , cred:{username , country , avatar , deviceID}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }
    else{
        sendMissingCredResponse({credArray:regCred , res , req});
    }
})
//User registrationt




.post("/user/deviceID/auth" , async(req , res) =>{
    const {deviceID} = req.body;

    if(deviceID)
    {
        const response = await deviceIDAuth({connection:UsersAccount_connection , cred:{deviceID}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }else
    {
        sendMissingCredResponse({credArray:loginDeviceIDCred , res , req});

    }
})





.post("/user/add/username" , async(req , res) =>{
    const {username , jwtToken} = req.body;

    if(username && jwtToken)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await addUserName({connection:UsersAccount_connection , cred:{username , userID:payload.cred}});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else failedJwtAuth({res});

    }else
    {
        sendMissingCredResponse({credArray:addUsernameCred , res , req});
    }
})





.put("/user/update/country" , async(req , res) =>{
    const {country , jwtToken} = req.body;

    if(country && jwtToken)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await updateCountry({connection:UsersAccount_connection , cred:{userID:payload.cred , country}});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else failedJwtAuth({res})
        
    }else
    {
        sendMissingCredResponse({credArray:updateCountryCred , res , req});
    }
})





.put("/user/update/avatar" , async (req , res) =>{
    const {avatar , jwtToken} = req.body;

    if(avatar && jwtToken)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await updateAvatar({connection:UsersAccount_connection , cred:{userID:payload.cred , avatar}});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else failedJwtAuth({res})
    }else
    {
        sendMissingCredResponse({credArray:updateAvatarCred , res , req});
    }
})






.post("/host/multiplayer/createGame" , async(req , res) =>{
    const {jwtToken , gameDuration , playersCount , gameType , guessDigitCount} = req.body; //gameDuration = {minutes:-- , seconds:--}
    //Deliberation to authenticate userID if necessary, but dont think its necessary
    if(jwtToken && gameDuration && playersCount && gameType && guessDigitCount)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await createNewGameSession({initID:uuidv4 , userID:payload.cred , duration:gameDuration , playersCount , gameType , guessDigitCount , createGame_connection:createGame_connection});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else failedJwtAuth({res})    
    }else
    {
        sendMissingCredResponse({credArray:createGameCred , res , req});
    }
})



.post("/player/multiplayer/authInvite" , async(req , res) =>{
    const {jwtToken = "def" , inviteCode , anonymous = false} = req.body;

    if(jwtToken && inviteCode)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await authInviteCode({connection:createGame_connection , userID:payload.cred , inviteCode});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else if(anonymous)
        {
            const response = await authInviteCode({connection:createGame_connection , userID:uuidv4() , inviteCode , anonymous});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }
        else failedJwtAuth({res})
    }else sendMissingCredResponse({credArray:authInviteCodeCred , res , req})
})



.post("/player/multiplayer/updateSecretCode" , async(req , res) =>{
    const {jwtToken , gameID , secretCode} = req.body;
    if(jwtToken && gameID && secretCode)
    {
        const payload = getJwtPayload({token:jwtToken});
        if(payload)
        {
            const response = await UploadSecretCode({connection:createGame_connection , gameID , secretCode , userID:payload.cred});

            res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
        }else failedJwtAuth({res});
    }else sendMissingCredResponse({credArray:updateSecretCodeCred , res , req})
})



module.exports = {
    router:() => router
}