const mongoose = require("mongoose");

const DizimoSchema = new mongoose.Schema({
  membro: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  tipo: {
    type: String,
    enum: ['entrada', 'saida'],
    default: 'entrada',
  },
  cargo: {
    type: String,
    required: true,
  },
  data: {
    type: Date,
    required: true,
  },
  descricao: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

module.exports = DizimoSchema;
