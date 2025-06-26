const express = require("express");
const userRoutes = require('./Routes/useRoutes');
const igrejaRoutes = require('./Routes/IgrejaRoutes');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/templates'));

app.use(express.static('public'));
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', igrejaRoutes);

app.get("/", (_req, res) => {
    res.send("Servidor rodando!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
