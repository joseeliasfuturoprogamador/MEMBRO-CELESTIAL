const User = require('../models/UsuarioSchema')

const ciacaodeUsuario = async (userdata) => {
    try {
        const user = await User.create(userdata);
        return user;

    } catch (error) {
        throw new error('Erro ao criar usuario' + error.message);
    }
};

const listarUsuarios = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        throw new error('Erro ao criar usuario' + error.message);
    }
};

//const listarPorId =  async (id) => {







