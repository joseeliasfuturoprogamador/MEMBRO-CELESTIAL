const express = require("express");
const connect = require("./database/connection");

connect();
const app = express();

app.use(express.json)


app.listen(3000, () => {
console.log('servidor rodando na porta 3000')
});