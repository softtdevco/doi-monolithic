const sendMissingCredResponse = ({credArray , res , req}) =>{
    let misssingCred = "";
    for(let i = 0; i < credArray.length; i++)
    {
        if(!req.body[credArray[i]]) misssingCred += `${credArray[i]} - `
    }
    res.status(400).send(JSON.stringify({reqStatus:"missingCredential" , msg:{data:`Please enter the following credentials : ${misssingCred}`}}));
}

module.exports = sendMissingCredResponse