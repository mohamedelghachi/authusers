const express = require("express")

const mongoose = require('mongoose')
const User = require('./models/userModel.js')
const bcrypt = require("bcrypt")

const app = express()
app.use(express.json())
mongoose.connect('mongodb://localhost/authusers').
    then(() => console.log("Connection réussie")).
    catch(error => console.log(error));

app.get("/home", function (req, res) {
    res.send("Home page")
})

app.post("/inscription", async function (req, res) {
    const user = req.body;
    let errors = {};
    try {
        await User.create(user)
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    } catch (error) {
        console.log(error);
        if (error.message.includes("user validation failed")) {
            Object.values(error.errors).forEach(({properties}) => errors[properties.path] = properties.message);
        }
        if (error.code == 11000) {
            errors.duplicate = error.errmsg;
        }
        res.status(400).json(errors);
    }
})

app.listen(82, function () {
    console.log("listening ...")
})