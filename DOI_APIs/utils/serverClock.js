const clock = {
    timeStamp:new Date().getSeconds(),
    min:0,
    sec:0,
    hour:0
}
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const { endTournamentRegistration } = require('./tournamentUtils');

//Set up Atlas DB connection
const atlasConnection = mongoose.createConnection(process.env.connectionString,
{
    useUnifiedTopology:true,
    useNewUrlParser:true
});
//Set up Atlas DB connection

//Import Schemas connection
const tournamentConnection = require("../Db_schema/createTournament_schema")({connection:atlasConnection , mongoose:mongoose});

const createGame_connection = require("../Db_schema/createGame_schema")({connection:atlasConnection , mongoose:mongoose});
//Import Schemas connection

// const initPair = require('../functionals/tournamentInitPair')

const fsReadTime = ({pathName = "timeSession"} = {}) =>{
    const sessionData = fs.readFileSync(path.join(__dirname,`../tempSessions/${pathName}.json`))

    return JSON.parse(sessionData.toString())
}

const fsUpdateTime = ({data = [] , pathName = "timeSession"}) =>{
    let err = false
    try{fs.writeFileSync(path.join(__dirname,`../tempSessions/${pathName}.json`),JSON.stringify(data))}
    catch(err)
    {
        err = true
    }

    return err;
}

const timeSession = {
    // id:{
    //     clockStart:startTime,
    //     clockEnd:startTime + aliveTime,
    //     tID:id
    // }
}

async function clockAnimate()
{
    const secondTimer = new Date().getSeconds();

    switch(true)
    {
        case clock.timeStamp !== secondTimer:
            clock.timeStamp = secondTimer
            clock.sec++;
            switch(true)
            {
                case clock.sec > 59:

                    const syncClock = fsReadTime({pathName:"clockOfflineSync"});

                    if(clock.min === 0)
                    {
                        clock.min = syncClock.sync.min;
                        clock.sec = syncClock.sync.sec;
                    }else {
                        syncClock.sync.min = clock.min;
                        syncClock.sync.sec = clock.sec;
                    }
                    
                    clock.sec = 0;
                    clock.min++;
                    const timeSession = await fsReadTime();
                    timeSession.forEach(val =>{
                        switch(val.endTime === clock.min)
                        {
                            case true:
                                console.log("found synced tornament here");

                                //set tournament reg to false
                                endTournamentRegistration({tID:val.ID , tournamentConnection , createGame_connection});
                                //set tournament reg to false

                                // const readTournament = async() =>{
                                //     const data = await fsRead({id:val});
                                //     data[0].regAlive = false;
                                //     await initPair({tournament:data[0]})
                                //     const updated = await fsUpdate({id:val,data:data[0]})
                                //     if(!updated) console.log('updated sucessfully')
                                // }
                                // readTournament()
                        }
                    })
                    fsUpdateTime({data:timeSession});

                    fsUpdateTime({data:{
                        "sync":{"min":clock.min , "sec":clock.sec}
                    } , pathName:"clockOfflineSync"})

                    console.log(clock)
            }
    }
}

setInterval(() =>{
    clockAnimate()
},1000)

module.exports = {
    timeSession:() => timeSession,
    clock:() => clock
}