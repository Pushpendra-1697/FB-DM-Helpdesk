const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
const { userrouter } = require("./routes/user.route");
require("dotenv").config();
let app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
    res.send('Yahooooo!!! Welcome in FB DM App');
});


app.use("/user", userrouter);


app.listen(process.env.port, async () => {
    try {
        await connection;
        console.log("connected to the db");
    } catch (error) {
        console.log(error);
    }
    console.log(`server running on ${process.env.port} `);
});