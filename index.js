import express from 'express';
const app = express();

import jwt from 'jsonwebtoken';
const JWT_SECRET = "randomVaibhavLovesAdventure"

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

const users = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");//this will host fe and be on same server no need of cors
})

//signup endpoint 
//it takes username and password from the body then pushes it to In Memory users array
//here we have not made the username unique 
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    users.push({
        username,
        password
    })
    res.send({
        message: "You have signed up"
    })
});

//signin endpoint
//it takes username and password from the body then checks In memory database 
//if the provided username does exist or not then also checks if password is correct or not and 
//returns a jwt token if the credentials are correct.
app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const token = jwt.sign({
            username: user.username
        }, JWT_SECRET);
        user.token = token;
        res.send({
            token
        })
        console.log(users);
    } else {
        res.status(403).send({
            message: "Invalid username or password"
        })
    }
});

//Authorisation middleware
//verify jwt token and returns the username
function auth(req, res, next) {
    if (req.headers.token) {
        let reqToken = req.headers.token;
        jwt.verify(reqToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    message: "Invalid token provided!!!!"
                })
            }
            else if (decoded.username) {
                req.username = decoded.username;
                next();
            }
            else {
                res.status(401).json({
                    message: "Invalid token provided!!!!"
                })
            }
        });
    }
    else {
        res.status(401).json({
            message: "You cannot acess this without logging in!!!!"
        })
    }
}

//me endpoint 
//first this endpoint Authorised by auth middleware then they
//take username provided by the auth middleware and checks if this user does exist or not
//then provides its details if this username does exist
app.get("/me", auth, (req, res) => {
    const username = req.username;
    const found = users.find(user => user.username === username);
    if (found) {
        res.json({
            username: found.username,
            password: found.password
        })
    }
    else {
        res.status(401).json({ message: 'Invalid token of non-existing user!!!!' })
    }

})

app.listen(3000);