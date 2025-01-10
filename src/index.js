const express = require("express");
const connect = require("./database/connection");

const app = express();

connect();

app.use(express.json());

app.get("/",(req, res) => {
    res.send("Servidor rodando!")
})

app.listen(4000, () => {
    console.log('servidor rodando na porta 3000');
});