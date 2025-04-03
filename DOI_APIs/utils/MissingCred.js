const sendMissingCredResponse = ({credArray , res , req}) =>{
    let misssingCred = "";
    for(let i = 0; i < credArray.length; i++)
    {
        if(!req.body[credArray[i]]) misssingCred += `${credArray[i]} - `
    }
    res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
}


const sendMissingCredResponseWs = ({credArray , ws , req}) =>{
    let misssingCred = "";
    for(let i = 0; i < credArray.length; i++)
    {
        if(!req[credArray[i]]) misssingCred += `${credArray[i]} - `
    }
    ws.send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
}

module.exports = {
    sendMissingCredResponse:sendMissingCredResponse,
    sendMissingCredResponseWs:sendMissingCredResponseWs
}