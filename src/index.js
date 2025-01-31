const express = require("express");
const connect = require("./database/connection");
const userRoutes = require('./Routes/useRoutes.js');

const app = express();

connect();

app.use('/imagens', express.static('src/imagens'));
app.use(express.static('public'));
app.use(express.json());
app.use('/api', userRoutes)
app.get("/", (_req, res) => {
    res.send("Servidor rodando!")
})

app.listen(3000, () => {
    console.log('servidor rodando na porta 3000');
});