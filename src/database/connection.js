require('dotenv').config();
const mongoose = require('mongoose');

const conexoes = {}; // Cache para conexões reutilizáveis

const connect = async (dbName) => {
  try {
    // Se já existir conexão para esse banco, reutiliza
    if (conexoes[dbName]) {
      return conexoes[dbName];
    }

    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;

    // URI com autenticação e nome do banco dinâmico
    const uri = `mongodb+srv://${dbUser}:${dbPassword}@membros005.0l8jn.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=MEMBROS005`;

    // Cria nova conexão usando createConnection e espera ela estar pronta
    const novaConexao = await mongoose.createConnection(uri).asPromise();

    conexoes[dbName] = novaConexao;
    console.log(`🔗 Conectado ao banco: ${novaConexao.name}`);

    return novaConexao;
  } catch (err) {
    console.error(`❌ Erro ao conectar no banco ${dbName}:`, err.message);
    throw err;
  }
};

module.exports = connect;
