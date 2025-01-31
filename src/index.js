const express = require("express");
const connect = require("./database/connection");
const userRoutes = require('./Routes/useRoutes.js'); // Corrigido o nome do arquivo

const app = express();

connect();

app.use(express.static('public'));
app.use(express.json());
app.use('/api', userRoutes);
app.use('/imagens', express.static('src/imagens'));
app.get("/", (_req, res) => {
    res.send("Servidor rodando!");
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});