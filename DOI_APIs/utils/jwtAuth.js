const jwt = require("jsonwebtoken");

const failedAuth = ({res}) =>{
    res.status(400).send(JSON.stringify({reqStatus:"jwtAuthFailed" , msg:"INVALID JWT token, please re-login"}));
}

const failedJwtWsAuth = ({ws}) =>{
    ws.send(JSON.stringify({reqStatus:"jwtAuthFailed" , msg:"INVALID JWT token, please re-login"}));
}

const getJwtPayload = ({token}) =>{
    try{
        const payload = jwt.verify(token , process.env.jwtSecretKey)

        return payload;
    }catch(err)
    {
        return null;
    }
}

const createJwtToken = (cred , expireTime = "3h") =>{
    return jwt.sign(cred , process.env.jwtSecretKey , {expiresIn:expireTime})
}

module.exports = {
    failedJwtAuth:failedAuth,
    getJwtPayload:getJwtPayload,
    createJwtToken:createJwtToken,
    failedJwtWsAuth:failedJwtWsAuth
}