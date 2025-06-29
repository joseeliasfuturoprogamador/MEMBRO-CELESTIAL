const mongoose = require('mongoose');

const igrejaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  dbName: { type: String, required: true, unique: true },
  confirmado: { type: Boolean, default: false },
  codigoConfirmacao: { type: String },
  codigoSenhaReset: { type: String },
  codigoSenhaResetExpira: { type: Date },
}, { timestamps: true });

// REMOVIDO pre('save') para não aplicar hash automático

module.exports = { schema: igrejaSchema };
