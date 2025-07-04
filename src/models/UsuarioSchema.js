// Não usar mongoose.model direto aqui no schema
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  nascimento: { type: Date, required: true },
  endereco: { type: String, required: true },
  bairro: { type: String, required: true },
  filiacao: { type: String, required: true },
  estadocivil: { type: String, required: true },
  cpf: { type: String, required: true, unique: true, match: /^\d{11}$/ },
  area: { type: String, required: true },
  congregacao: { type: String, required: true },
  dirigente: { type: String, required: true },
  conversao: { type: Date, required: true },
  funcao: { type: String, required: true },
  discipulado: { type: String, required: true },
  batismo: { type: Date, required: true },
});

module.exports = usuarioSchema;  // exporta só o schema, não o model!
