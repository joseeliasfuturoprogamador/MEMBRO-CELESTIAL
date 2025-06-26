const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

igrejaSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

igrejaSchema.methods.comparePassword = async function(senhaRecebida) {
  return await bcrypt.compare(senhaRecebida, this.senha);
};

module.exports = { schema: igrejaSchema };
