require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

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

//JSON middleWare
app.use(express.json());
//JSON middleWare

app.use("/" , router())

// app.listen(process.env.PORT , () =>{
//     console.log(`Server listening at PORT : ${process.env.PORT}`)
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT , "0.0.0.0" , () =>{
    console.log(`Server listening at PORT : ${PORT}`)
});