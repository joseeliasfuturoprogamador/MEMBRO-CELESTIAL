const express = require("express");
const connect = require("./database/connection");
const userRoutes = require('./Routes/useRoutes.js');
const app = express();

connect();

app.use(express.json());

app.get("/",(req, res) => {
    res.send("Servidor rodando!")
})

app.listen(3000, () => {
    console.log('servidor rodando na porta 3000');
});