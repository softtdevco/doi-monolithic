const {clock} = require("../utils/serverClock");

class newClockSync{
    constructor({ID , duration})
    {
        this.ID = ID;
        this.startTime = clock().min;
        this.endTime = this.startTime + duration;
        this.type = "startTournament"
    }
}


const fsUpdate_tempSession = async ({id , data , pathName}) =>{
    const sessionData = fs.readFileSync(path.join(__dirname,`../tempSessions/${pathName}.json`))
    const updatedData = JSON.parse(sessionData.toString());
    let err = false
    if(id) updatedData[`${id}`] = data;
    else updatedData.push(data);

    try{fs.writeFileSync(path.join(__dirname,`../tempSessions/${pathName}.json`),JSON.stringify(updatedData))}
    catch(err)
    {
        err = true
    }

    return err;
}

const fsRead_tempSession = async ({id , pathName}) =>{
    const sessionData = fs.readFileSync(path.join(__dirname,`../tempSessions/${pathName}.json`))

    return id ? (JSON.parse(sessionData.toString())[`${id}`] === undefined ? [] : [JSON.parse(sessionData.toString())[`${id}`]]) : JSON.parse(sessionData.toString());
}



module.exports = {
    newClockSync:newClockSync,
    fsUpdate_tempSession:fsUpdate_tempSession,
    fsRead_tempSession:fsRead_tempSession
}