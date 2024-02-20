const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("./../model/User.model");
const userrouter = express.Router();

// register of user
userrouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        bcrypt.hash(password, 5, async (err, hash) => {
            // Store hash in your password DB.
            if (err) {
                res.send({ massege: "something went wrong", error: err.message });
            } else {
                const user = new User({ username, email, password: hash });
                await user.save();
                res.send({ massege: "New user register" });
            }
        });
    } catch (error) {
        res.send({ massege: "something went wrong" });
    }
});

// login of the user
// added api for blocking requests after 5 times wrong password for next 24 hours;
let count = 0
userrouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let BlockedTime = Date.now();
    try {
        const user = await User.find({ email });
        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, async (err, result) => {
                if (result) {
                    const token = jwt.sign({ userID: user[0]._id }, "masai");

                    res.send({ massege: "login successful", token: token, id: user[0]._id });
                } else {
                    count++

                    if (count === 5) {
                        await User.updateOne({ email }, { $set: { BlockedTime } })
                    }
                    res.send({ massege: "wrong Passwaor" });
                }
            });
        } else {
            res.send({ massege: "wrong Email" });
        }
    } catch (error) {
        res.send({ massege: "something went wrong" });
    }
});


// get user information
userrouter.get('/get', async (req, res) => {
    var currentTime = Date.now();
    const { email } = req.headers;

    try {
        const user = await User.findOne({ email });
        let BlockedTime = user.BlockedTime;
        if (currentTime - BlockedTime >= 120000 && BlockedTime !== undefined) {
            await User.updateOne({ email }, { $unset: { BlockedTime } });
            res.send({ msg: "Not Blocked" });
        } else if (currentTime - BlockedTime < 120000 && BlockedTime !== undefined) {
            res.send({ msg: "Blocked" });
        } else {
            res.send({ msg: "Login Successful" });
        }
    } catch (err) {
        res.status(404).send({ msg: "Something went wrong😒" })
    }
});









module.exports = {
    userrouter,
};