const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    nascimento: { type: Number, required: true, unique: true },
    endereco: { type: String, required: true, },
    bairro: { type: String, required: true, },
    filiacao: { type: String, required: true, },
    estado_civil: { type: String, required: true, },
    cpf: { type: String, minlength: 11, maxlength: 11, unique: true },
    area: { type: String, required: true,  },
    congregacao: { type: String, required: true,  },
    dirigente: { type: String, required: true,  },
    convencao: { type: Number, required: true,  },
    funcao: { type: String, required: true,  },
    discipulado: { type: String, required: true,  },
    data_de_batismo: { type: Number, require: true,},
});

const Usuario  = mongoose.model('Usuario', usuarioSchema);

module.export  = Usuario;