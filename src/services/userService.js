const User = require('../models/UsuarioSchema')
const path = require('path')
const pdf = require('html-pdf')
const exphbs = require('ExpressHandlebars')
const { ExpressHandlebars } = require('express-handlebars')
const { promises } = require('dns')
const { error } = require('console')

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
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Erro("Usuário não encontrado");
        return user;
    } catch (error) {
        throw new Error(error.message)
    }
};

const hbs = exphbs.create();

const compileTemplate = ExpressHandlebars = async (template, data) => {
    return new promise((resolve, reject) => {
        hbs.renderView(template, data, (err, html) => {
            if (error) reject(err);
            else resolve(html);
        }); 
    });
};

exports.gerarCarta = async (id) => {
    try{
        const membro = await Membro.findById(id);
        if (!membro) throw new error("Membro não encontrado");
        
        membro.dataMembro = new Date(membro.dataMembro).toLocaleDateString(pt-BR);

        const html =  await compileTemplate(path.join(__dirname, '..viwes/carat.carta'))
    }
}



module.exports = {
    criacaodeUsuario,
    listarUsuarios,
    listarPorId,
    atualizaUsuarioPorId,
    deletarPorId,
};




