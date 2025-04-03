const { getJwtPayload, failedJwtAuth, failedJwtWsAuth } = require("../utils/jwtAuth");
const {multiplayerRoute} = require("./multiplayerRoutes");
const mongoose = require("mongoose")

const socketModule = ({wss}) =>{

    //Set up Atlas DB connection
    const atlasConnection = mongoose.createConnection(process.env.connectionString,
    {
        useUnifiedTopology:true,
        useNewUrlParser:true
    });
    //Set up Atlas DB connection

    //Import Schemas
    const createGame_connection = require("../Db_schema/createGame_schema")({connection:atlasConnection , mongoose:mongoose});
    
    const UsersAccount_connection = require("../Db_schema/createAccount_schema")({connection:atlasConnection , mongoose:mongoose});
    //Import Schemas

    wss.on('connection', ws =>{
        console.log("User is Connected to server via websocket");
        ws.on('message',data =>{
            let parsed;

            try{
                parsed = JSON.parse(data);

                switch(true)
                {
                    case parsed.type === 'multiplayer':
                        multiplayerRoute({reqData:parsed,ws:ws , gameConnectionDB:createGame_connection , userConnectionDB:UsersAccount_connection})
                    break;
                    case parsed.type === 'createTournament':
                        // mainBoard({reqData:parsed,ws:ws})
                    break;
                    case parsed.type === 'tournamentMain':
                        console.log('i came here')
                        // mainBoard({reqData:parsed,ws:ws})
                    break
                    default:
                        processData(parsed,ws)
                }
            }
            catch(err)
            {
                console.log(err)
            }
        })
    })
}



module.exports = {
    socketModule:socketModule
}