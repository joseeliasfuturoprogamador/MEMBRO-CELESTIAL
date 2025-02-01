const express = require("express");
const connect = require("./database/connection");
const userRoutes = require('./Routes/useRoutes'); // Corrigido o nome do arquivo
const { engine } = require('express-handlebars'); // Atualizado para usar a função engine
const path = require('path');

const app = express();

connect();

app.engine('handlebars', engine()); // Atualizado para usar a função engine
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/templates'));

app.use(express.static('public'));
app.use(express.json());
app.use('/api', userRoutes);

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