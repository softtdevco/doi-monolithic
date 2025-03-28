require("dotenv").config();
const mongoose = require("mongoose");
const {v4:uuidv4} = require("uuid")

//Set up Atlas DB connection
const atlasConnection = mongoose.createConnection(process.env.connectionString,
{
    useUnifiedTopology:true,
    useNewUrlParser:true
});
//Set up Atlas DB connection

//Import Schemas
const UsersAccount_connection = require("./Db_schema/createAccount_schema")({connection:atlasConnection , mongoose:mongoose});
//Import Schemas

//Import Utils
const { emailReg } = require("./regEx/signUp_reg");
const { syncUserAccount, loginUserAccount, userRegistration, deviceIDAuth, addUserName, updateCountry, updateAvatar } = require("./pheripherals");
const {regCred , email_syncCred , loginCred , loginDeviceIDCred , addUsernameCred , updateCountryCred} = require("./utils/onboardingCred.json");
//Import Utils

const router = require("express").Router();

router
//sign up Endpoint
.post("/user/sync/signup" , async(req , res) =>{
        const {email , password , userID} = req.body;
        if(email && password && userID)
        {
            if(RegExp(emailReg()).test(email)){

                const response = await syncUserAccount({connection:UsersAccount_connection , cred:{email , password , userID}});

                res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
            }
            else{
                res.status(400).send(JSON.stringify({reqStatus:"failed" , msg:"Please enter a valid Email"}));
            }
        }else {
            let misssingCred = "";
            for(let i = 0; i < email_syncCred.length; i++)
            {
                if(!req.body[email_syncCred[i]]) misssingCred += `${email_syncCred[i]} - `
            }
            res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
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
        let misssingCred = "";
        for(let i = 0; i < loginCred.length; i++)
        {
            if(!req.body[loginCred[i]]) misssingCred += `${loginCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
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
        let misssingCred = "";
        for(let i = 0; i < regCred.length; i++)
        {
            if(!req.body[regCred[i]]) misssingCred += `${regCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
    }
})
//User registration

.post("/user/deviceID/auth" , async(req , res) =>{
    const {deviceID} = req.body;

    if(deviceID)
    {
        const response = await deviceIDAuth({connection:UsersAccount_connection , cred:{deviceID}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }else
    {
        let misssingCred = "";
        for(let i = 0; i < loginDeviceIDCred.length; i++)
        {
            if(!req.body[loginDeviceIDCred[i]]) misssingCred += `${loginDeviceIDCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
    }
})

.post("/user/add/username" , async(req , res) =>{
    const {username , userID} = req.body;

    if(username && userID)
    {
        const response = await addUserName({connection:UsersAccount_connection , cred:{username , userID}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }else
    {
        let misssingCred = "";
        for(let i = 0; i < addUsernameCred.length; i++)
        {
            if(!req.body[addUsernameCred[i]]) misssingCred += `${addUsernameCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
    }
})

.put("/user/update/country" , async(req , res) =>{
    const {country , userID} = req.body;

    if(country && userID)
    {
        const response = await updateCountry({connection:UsersAccount_connection , cred:{userID , country}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }else
    {
        let misssingCred = "";
        for(let i = 0; i < updateCountryCred.length; i++)
        {
            if(!req.body[updateCountryCred[i]]) misssingCred += `${updateCountryCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
    }
})

.put("/user/update/avatar" , async (req , res) =>{
    const {avatar , userID} = req.body;

    if(avatar && userID)
    {
        const response = await updateAvatar({connection:UsersAccount_connection , cred:{userID , avatar}});

        res.status(response.ok ? 200 : 400).send(JSON.stringify({reqStatus:response.data.type , msg:{data:response.data.msg}}))
    }else
    {
        let misssingCred = "";
        for(let i = 0; i < updateAvatarCred.length; i++)
        {
            if(!req.body[updateAvatarCred[i]]) misssingCred += `${updateAvatarCred[i]} - `
        }
        res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
    }
})

module.exports = {
    router:() => router
}