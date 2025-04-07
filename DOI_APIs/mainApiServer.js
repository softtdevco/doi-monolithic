require("dotenv").config();
const http = require("http");
const express = require("express");
const websocket = require("ws");
const app = express();
const server = http.createServer(app);
const wss = new websocket.Server({server})
const cors = require("cors");
const { socketModule } = require("./Doi_websocketFunc/serverWs");


//Import server clock
const clockTimer = require("./utils/serverClock");
//Import server clock

//Cors middleWare
app.use(cors());
//Cors middleWare

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
//     if (req.method === "OPTIONS") {
//         return res.sendStatus(204);
//     }
    
//     next();
// });

//Import API Router
const router = require("./mainApiRoute").router;
//Import API Router

//import sockectModule
socketModule({wss});
//import sockectModule

//JSON middleWare
app.use(express.json());
//JSON middleWare

app.use("/" , router())

// server.listen(process.env.PORT , () =>{
//     console.log(`Server listening at PORT : ${process.env.PORT}`)
// });

const PORT = process.env.PORT || 3000;

server.listen(PORT , "0.0.0.0" , () =>{
    console.log(`Server listening at PORT : ${PORT}`)
});

