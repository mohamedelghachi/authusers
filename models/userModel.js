const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const {isEmail} = require('validator')

const userSchema = new mongoose.Schema({
    nom:{
        type:String,
        required:[true,"Please enter a name"],
        unique:[true,"name should be unique"],
    },
    email:{
        type:String,
        required:[true,"Please enter an email"],
        unique:[true,"email should be unique"],
        validate:[isEmail,'Please enter a valid email']
    },
    motDePasse:{
        type:String,
        required:[true,"Please enter a password"],
        minLength:[6,"Minimum password length is 6 characters"]
    },
    role:{
        type:String,
        enum : ['Administrateur','Utilisateur'],
        default: 'Utilisateur'
    },
    tokens:{
        type:[{
            token: {
                type: String,
                required: true
            }
        }]
    }
})

userSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.motDePasse = await bcrypt.hash(this.motDePasse,salt);
    console.log('%s will be created and saved', this);
    next();
  });

const user = mongoose.model('user',userSchema);
module.exports = user;