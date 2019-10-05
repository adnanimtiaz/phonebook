const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv/config");

const SERVER_PORT = process.env.port | 3000;
const routesApiAuth = require("./routes/apis/auth");
const routesApiContacts = require("./routes/apis/contacts");

// ** Middlewares **
app.use(express.json());

// ** Routes Configuration **
app.use("/api/auth", routesApiAuth);
app.use("/api/contacts", routesApiContacts);

// ** Database Connection Configuration **
mongoose.connect(process.env.DATABASE_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true }, (errc, client) => {
    errc? console.log(errc) : console.log("MongoDB has been connected");
});

// ******************************************************************

app.listen(SERVER_PORT);