require("dotenv").config();
const express = require("express")

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('./models/userModel.js')
const isAuth = require('./middleware/auth.js')

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
        if (error.message.includes("user validation failed")) {
            Object.values(error.errors).forEach(({ properties }) => {
                errors[properties.path] = properties.message;
            });
        }
        if (error.code == 11000) {
            errors.duplicate = error.errmsg;
        }
        res.status(400).json(errors);
    }
})

// Route POST /connexion
app.post('/connexion', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Valider les données d'entrée (required, email, minLength)

        // Rechercher l'utilisateur par son adresse e-mail
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Adresse e-mail non trouvé dans la base de données');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isPasswordValid) {
            return res.status(401).send('Mot de passe incorrect');
        }

        // Générer un jeton JWT
        const token = jwt.sign({ userId: user._id,role:user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Envoyer la réponse avec le jeton et les informations utilisateur
        res.json({
            token,
            utilisateur: {
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

app.get("/dashboard",isAuth, async (req, res) => {
    res.status(200).json({"message":req.role})
})
app.get("/admindashboard",isAuth, async (req, res) => {
    if(req.role=="Utilisateur"){
        return res.status(400).json({"message":"route non autorisée"})
    }
    res.status(200).json({"message":req.role})
})
app.listen(82, function () {
    console.log("listening ...")
})