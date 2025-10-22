const express = require("express");
const userRoutes = require('./Routes/useRoutes');
const igrejaRoutes = require('./Routes/IgrejaRoutes');
const dizimoRoutes = require('./Routes/dizimo.Routes');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({ origin: "*" }));


// Configuração do Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src/templates'));

// Configuração de arquivos estáticos e JSON
app.use(express.static('public'));
app.use(express.json());

// Rotas principais
app.use('/api', userRoutes);
app.use('/api', igrejaRoutes);
app.use('/api', dizimoRoutes);

// Rota inicial (teste)
app.get("/", (_req, res) => {
  res.send("Servidor rodando!");
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// ✅ PORTA DINÂMICA PARA DEPLOY
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
