const User = require('../models/UsuarioSchema')

const criacaodeUsuario = async (userdata) => {
    try {
        const user = await User.create(userdata);
        return user;

    } catch (error) {
        throw new error('Erro ao criar usuario' + error.message);
    }
}

const listarUsuarios = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (error) {
        throw new error('Erro ao criar usuario' + error.message);
    }
};

const listarPorId = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw new Error(error.message)
    }
};

const atualizaUsuarioPorId = async (id, updateData) => {
    try {
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const deletarPorId = async (id) => {
    try{
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Erro("Usuário não encontrado");
        return user;
    } catch (error) {
        throw new Error(error.message)
    }   
};

module.exports = {
    criacaodeUsuario,
    listarUsuarios,
    listarPorId,
    atualizaUsuarioPorId,
    deletarPorId,
};




