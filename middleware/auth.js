const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    console.log(token);
    await jwt.verify(token, "secret",(err,token_verified)=>{
        if(err){
            return res.status(400).json({'message':err})
        }
        req.userId = token_verified.userId;
        req.role = token_verified.role;
        next()
    })
}
module.exports = auth